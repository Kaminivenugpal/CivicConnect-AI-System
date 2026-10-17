package com.civicconnect.service;

import com.civicconnect.dto.AuthorityDashboardStatsResponse;
import com.civicconnect.dto.ComplaintResponse;
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

import java.util.*;

@Service
public class AuthorityService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintStatusHistoryRepository statusHistoryRepository;
    private final AuthorityRemarkRepository remarkRepository;
    private final ComplaintService complaintService;

    // Strict State Machine Permitted Transitions Map
    private static final Map<ComplaintStatus, Set<ComplaintStatus>> VALID_TRANSITIONS = new EnumMap<>(ComplaintStatus.class);

    static {
        VALID_TRANSITIONS.put(ComplaintStatus.SUBMITTED, EnumSet.of(ComplaintStatus.UNDER_REVIEW, ComplaintStatus.REJECTED));
        VALID_TRANSITIONS.put(ComplaintStatus.UNDER_REVIEW, EnumSet.of(ComplaintStatus.IN_PROGRESS, ComplaintStatus.REJECTED));
        VALID_TRANSITIONS.put(ComplaintStatus.IN_PROGRESS, EnumSet.of(ComplaintStatus.RESOLVED, ComplaintStatus.REJECTED));
        VALID_TRANSITIONS.put(ComplaintStatus.RESOLVED, Collections.emptySet());
        VALID_TRANSITIONS.put(ComplaintStatus.REJECTED, Collections.emptySet());
    }

    public AuthorityService(ComplaintRepository complaintRepository,
                            ComplaintStatusHistoryRepository statusHistoryRepository,
                            AuthorityRemarkRepository remarkRepository,
                            ComplaintService complaintService) {
        this.complaintRepository = complaintRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.remarkRepository = remarkRepository;
        this.complaintService = complaintService;
    }

    @Transactional(readOnly = true)
    public Page<ComplaintResponse> getAllComplaints(String search, ComplaintCategory category,
                                                    ComplaintPriority priority, ComplaintStatus status, Pageable pageable) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        return complaintRepository.findWithFilters(cleanSearch, category, priority, status, pageable)
                .map(complaintService::mapToResponse);
    }

    @Transactional
    public ComplaintResponse updateStatus(Long complaintId, ComplaintStatus newStatus, String remarks, User authorityUser) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        ComplaintStatus currentStatus = complaint.getStatus();

        // 1. Validate permitted transitions
        Set<ComplaintStatus> allowedNext = VALID_TRANSITIONS.getOrDefault(currentStatus, Collections.emptySet());
        if (!allowedNext.contains(newStatus)) {
            throw new BadRequestException("Invalid status transition from " + currentStatus + " to " + newStatus +
                    ". Allowed transitions: " + allowedNext);
        }

        // 2. Enforce mandatory explanation on rejection
        if (newStatus == ComplaintStatus.REJECTED) {
            if (remarks == null || remarks.trim().isEmpty()) {
                throw new BadRequestException("A mandatory explanation note is required when rejecting a complaint.");
            }
        }

        // 3. Update status on Complaint
        complaint.setStatus(newStatus);
        Complaint saved = complaintRepository.save(complaint);

        // 4. Record in Status History Audit Trail
        String logRemarks = (remarks != null && !remarks.trim().isEmpty())
                ? remarks.trim()
                : "Status transitioned to " + newStatus + " by authority officer.";

        ComplaintStatusHistory history = new ComplaintStatusHistory(
                saved,
                currentStatus,
                newStatus,
                logRemarks,
                authorityUser.getFullName()
        );
        statusHistoryRepository.save(history);

        return complaintService.mapToResponse(saved);
    }

    @Transactional
    public ComplaintResponse updateClassification(Long complaintId, ComplaintCategory category, ComplaintPriority priority,
                                                  String rationale, User authorityUser) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        if (category != null) {
            complaint.setCategory(category);
        }
        if (priority != null) {
            complaint.setPriority(priority);
        }

        Complaint saved = complaintRepository.save(complaint);

        // Log to history
        String logNote = "AI Classification reviewed by officer " + authorityUser.getFullName() +
                ". Updated to Category: " + saved.getCategory() + ", Priority: " + saved.getPriority() +
                (rationale != null && !rationale.trim().isEmpty() ? ". Reason: " + rationale.trim() : "");

        ComplaintStatusHistory history = new ComplaintStatusHistory(
                saved,
                saved.getStatus(),
                saved.getStatus(),
                logNote,
                authorityUser.getFullName()
        );
        statusHistoryRepository.save(history);

        return complaintService.mapToResponse(saved);
    }

    @Transactional
    public ComplaintResponse assignDepartment(Long complaintId, String department, String assignedOfficer, User authorityUser) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        if (department == null || department.trim().isEmpty()) {
            throw new BadRequestException("Department cannot be blank");
        }

        complaint.setDepartment(department.trim());
        complaint.setAssignedOfficer(assignedOfficer != null ? assignedOfficer.trim() : null);

        Complaint saved = complaintRepository.save(complaint);

        // Log assignment
        String logNote = "Assigned to department: " + department +
                (assignedOfficer != null && !assignedOfficer.trim().isEmpty() ? " (Officer: " + assignedOfficer.trim() + ")" : "");

        ComplaintStatusHistory history = new ComplaintStatusHistory(
                saved,
                saved.getStatus(),
                saved.getStatus(),
                logNote,
                authorityUser.getFullName()
        );
        statusHistoryRepository.save(history);

        return complaintService.mapToResponse(saved);
    }

    @Transactional
    public void addRemark(Long complaintId, String remarkText, User authorityUser) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        if (remarkText == null || remarkText.trim().isEmpty()) {
            throw new BadRequestException("Remark text cannot be empty");
        }

        AuthorityRemark remark = new AuthorityRemark(complaint, remarkText.trim(), authorityUser);
        remarkRepository.save(remark);

        // Also add audit history event
        ComplaintStatusHistory history = new ComplaintStatusHistory(
                complaint,
                complaint.getStatus(),
                complaint.getStatus(),
                "Official Remark: " + remarkText.trim(),
                authorityUser.getFullName()
        );
        statusHistoryRepository.save(history);
    }

    @Transactional(readOnly = true)
    public AuthorityDashboardStatsResponse getDashboardStats() {
        AuthorityDashboardStatsResponse stats = new AuthorityDashboardStatsResponse();

        stats.setTotalComplaints(complaintRepository.count());
        stats.setSubmitted(complaintRepository.countByStatus(ComplaintStatus.SUBMITTED));
        stats.setUnderReview(complaintRepository.countByStatus(ComplaintStatus.UNDER_REVIEW));
        stats.setInProgress(complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS));
        stats.setResolved(complaintRepository.countByStatus(ComplaintStatus.RESOLVED));
        stats.setRejected(complaintRepository.countByStatus(ComplaintStatus.REJECTED));

        // Category distribution
        Map<String, Long> categoryDist = new LinkedHashMap<>();
        for (ComplaintCategory cat : ComplaintCategory.values()) {
            categoryDist.put(cat.name(), 0L);
        }
        for (Object[] row : complaintRepository.countGroupByCategory()) {
            if (row[0] != null && row[1] != null) {
                ComplaintCategory cat = (ComplaintCategory) row[0];
                Long count = (Long) row[1];
                categoryDist.put(cat.name(), count);
            }
        }
        stats.setCategoryDistribution(categoryDist);

        // Status distribution
        Map<String, Long> statusDist = new LinkedHashMap<>();
        for (ComplaintStatus st : ComplaintStatus.values()) {
            statusDist.put(st.name(), 0L);
        }
        for (Object[] row : complaintRepository.countGroupByStatus()) {
            if (row[0] != null && row[1] != null) {
                ComplaintStatus st = (ComplaintStatus) row[0];
                Long count = (Long) row[1];
                statusDist.put(st.name(), count);
            }
        }
        stats.setStatusDistribution(statusDist);

        return stats;
    }
}
