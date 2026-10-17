package com.civicconnect.service;

import com.civicconnect.dto.*;
import com.civicconnect.entity.*;
import com.civicconnect.exception.BadRequestException;
import com.civicconnect.exception.ResourceNotFoundException;
import com.civicconnect.repository.AuthorityRemarkRepository;
import com.civicconnect.repository.ComplaintRepository;
import com.civicconnect.repository.ComplaintStatusHistoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Year;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintStatusHistoryRepository statusHistoryRepository;
    private final AuthorityRemarkRepository remarkRepository;
    private final ComplaintAnalysisService analysisService;
    private final FileStorageService fileStorageService;

    public ComplaintService(ComplaintRepository complaintRepository,
                            ComplaintStatusHistoryRepository statusHistoryRepository,
                            AuthorityRemarkRepository remarkRepository,
                            ComplaintAnalysisService analysisService,
                            FileStorageService fileStorageService) {
        this.complaintRepository = complaintRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.remarkRepository = remarkRepository;
        this.analysisService = analysisService;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public ComplaintResponse createComplaint(ComplaintCreateRequest request, MultipartFile image, User citizen) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new BadRequestException("Complaint title is required");
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new BadRequestException("Complaint description is required");
        }
        if (request.getLocation() == null || request.getLocation().trim().isEmpty()) {
            throw new BadRequestException("Complaint location is required");
        }

        // Run AI Analysis
        AnalysisResponse analysis = analysisService.analyze(request.getTitle(), request.getDescription());

        // Use requested category/priority or AI predicted
        ComplaintCategory category = request.getCategory() != null ? request.getCategory() : analysis.getPredictedCategory();
        ComplaintPriority priority = request.getPriority() != null ? request.getPriority() : analysis.getPredictedPriority();

        // Handle Image Upload
        String imagePath = null;
        if (image != null && !image.isEmpty()) {
            imagePath = fileStorageService.storeFile(image);
        }

        // Generate unique human-readable reference ID e.g. CC-2026-F3A1
        String refId = "CC-" + Year.now().getValue() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Complaint complaint = new Complaint();
        complaint.setReferenceId(refId);
        complaint.setTitle(request.getTitle().trim());
        complaint.setDescription(request.getDescription().trim());
        complaint.setLocation(request.getLocation().trim());
        complaint.setCategory(category);
        complaint.setPriority(priority);
        complaint.setStatus(ComplaintStatus.SUBMITTED);
        complaint.setImageUrl(imagePath);
        complaint.setAiConfidenceScore(analysis.getConfidenceScore());
        complaint.setAiExplanation(analysis.getExplanation());
        complaint.setCitizen(citizen);

        Complaint saved = complaintRepository.save(complaint);

        // Record initial status in history
        ComplaintStatusHistory initialHistory = new ComplaintStatusHistory(
                saved,
                null,
                ComplaintStatus.SUBMITTED,
                "Complaint filed and registered into civic triage system.",
                citizen.getFullName()
        );
        statusHistoryRepository.save(initialHistory);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<ComplaintResponse> getMyComplaints(User citizen, String search, ComplaintCategory category,
                                                  ComplaintPriority priority, ComplaintStatus status, Pageable pageable) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        return complaintRepository.findWithFiltersForCitizen(citizen, cleanSearch, category, priority, status, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public ComplaintDetailResponse getComplaintDetails(String idOrRef) {
        Complaint complaint;
        if (idOrRef.startsWith("CC-") || idOrRef.contains("-")) {
            complaint = complaintRepository.findByReferenceId(idOrRef)
                    .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with reference: " + idOrRef));
        } else {
            try {
                Long id = Long.parseLong(idOrRef);
                complaint = complaintRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));
            } catch (NumberFormatException e) {
                complaint = complaintRepository.findByReferenceId(idOrRef)
                        .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with identifier: " + idOrRef));
            }
        }

        ComplaintDetailResponse response = mapToDetailResponse(complaint);

        // Fetch Status History
        List<StatusHistoryDto> historyList = statusHistoryRepository.findByComplaintOrderByTimestampDesc(complaint)
                .stream()
                .map(h -> new StatusHistoryDto(
                        h.getId(),
                        h.getPreviousStatus(),
                        h.getNewStatus(),
                        h.getRemarks(),
                        h.getChangedBy(),
                        h.getTimestamp()
                ))
                .collect(Collectors.toList());
        response.setStatusHistory(historyList);

        // Fetch Authority Remarks
        List<RemarkDto> remarksList = remarkRepository.findByComplaintOrderByCreatedAtDesc(complaint)
                .stream()
                .map(r -> new RemarkDto(
                        r.getId(),
                        r.getRemarkText(),
                        r.getAuthorityUser().getFullName(),
                        r.getAuthorityUser().getEmail(),
                        r.getCreatedAt()
                ))
                .collect(Collectors.toList());
        response.setRemarks(remarksList);

        return response;
    }

    @Transactional(readOnly = true)
    public List<StatusHistoryDto> getComplaintHistory(String idOrRef) {
        return getComplaintDetails(idOrRef).getStatusHistory();
    }

    @Transactional(readOnly = true)
    public CitizenStatsResponse getCitizenStats(User citizen) {
        long total = complaintRepository.countByCitizen(citizen);
        long submitted = complaintRepository.countByCitizenAndStatus(citizen, ComplaintStatus.SUBMITTED);
        long underReview = complaintRepository.countByCitizenAndStatus(citizen, ComplaintStatus.UNDER_REVIEW);
        long inProgress = complaintRepository.countByCitizenAndStatus(citizen, ComplaintStatus.IN_PROGRESS);
        long resolved = complaintRepository.countByCitizenAndStatus(citizen, ComplaintStatus.RESOLVED);

        return new CitizenStatsResponse(total, submitted + underReview, inProgress, resolved);
    }

    public AnalysisResponse analyzeText(String title, String description) {
        return analysisService.analyze(title, description);
    }

    public ComplaintResponse mapToResponse(Complaint c) {
        ComplaintResponse dto = new ComplaintResponse();
        dto.setId(c.getId());
        dto.setReferenceId(c.getReferenceId());
        dto.setTitle(c.getTitle());
        dto.setDescription(c.getDescription());
        dto.setCategory(c.getCategory());
        dto.setPriority(c.getPriority());
        dto.setStatus(c.getStatus());
        dto.setImageUrl(c.getImageUrl());
        dto.setLocation(c.getLocation());
        dto.setDepartment(c.getDepartment());
        dto.setAssignedOfficer(c.getAssignedOfficer());
        dto.setAiConfidenceScore(c.getAiConfidenceScore());
        dto.setAiExplanation(c.getAiExplanation());
        if (c.getCitizen() != null) {
            dto.setCitizenId(c.getCitizen().getId());
            dto.setCitizenName(c.getCitizen().getFullName());
            dto.setCitizenEmail(c.getCitizen().getEmail());
        }
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());
        return dto;
    }

    private ComplaintDetailResponse mapToDetailResponse(Complaint c) {
        ComplaintDetailResponse dto = new ComplaintDetailResponse();
        dto.setId(c.getId());
        dto.setReferenceId(c.getReferenceId());
        dto.setTitle(c.getTitle());
        dto.setDescription(c.getDescription());
        dto.setCategory(c.getCategory());
        dto.setPriority(c.getPriority());
        dto.setStatus(c.getStatus());
        dto.setImageUrl(c.getImageUrl());
        dto.setLocation(c.getLocation());
        dto.setDepartment(c.getDepartment());
        dto.setAssignedOfficer(c.getAssignedOfficer());
        dto.setAiConfidenceScore(c.getAiConfidenceScore());
        dto.setAiExplanation(c.getAiExplanation());
        if (c.getCitizen() != null) {
            dto.setCitizenId(c.getCitizen().getId());
            dto.setCitizenName(c.getCitizen().getFullName());
            dto.setCitizenEmail(c.getCitizen().getEmail());
        }
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());
        return dto;
    }
}
