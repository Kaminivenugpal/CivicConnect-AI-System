package com.civicconnect.controller;

import com.civicconnect.dto.*;
import com.civicconnect.entity.*;
import com.civicconnect.exception.BadRequestException;
import com.civicconnect.repository.UserRepository;
import com.civicconnect.security.UserPrincipal;
import com.civicconnect.service.ComplaintService;
import com.civicconnect.service.FileStorageService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public ComplaintController(ComplaintService complaintService,
                               UserRepository userRepository,
                               FileStorageService fileStorageService) {
        this.complaintService = complaintService;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    /**
     * AI Analysis endpoint for pre-submission categorization & priority triage
     */
    @PostMapping("/analyze")
    public ResponseEntity<AnalysisResponse> analyzeComplaint(@Valid @RequestBody AnalysisRequest request) {
        AnalysisResponse response = complaintService.analyzeText(request.getTitle(), request.getDescription());
        return ResponseEntity.ok(response);
    }

    /**
     * Submit new complaint with optional photo evidence multipart upload
     */
    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<ComplaintResponse> submitComplaint(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("location") String location,
            @RequestParam(value = "category", required = false) ComplaintCategory category,
            @RequestParam(value = "priority", required = false) ComplaintPriority priority,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        if (userPrincipal == null) {
            throw new BadRequestException("Authenticated user context required");
        }

        User citizen = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("Citizen user not found"));

        ComplaintCreateRequest request = new ComplaintCreateRequest(title, description, location, category, priority);
        ComplaintResponse response = complaintService.createComplaint(request, image, citizen);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Get complaints submitted by logged-in citizen with filters
     */
    @GetMapping("/my")
    public ResponseEntity<Page<ComplaintResponse>> getMyComplaints(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "category", required = false) ComplaintCategory category,
            @RequestParam(value = "priority", required = false) ComplaintPriority priority,
            @RequestParam(value = "status", required = false) ComplaintStatus status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        User citizen = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("Citizen user not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ComplaintResponse> result = complaintService.getMyComplaints(citizen, search, category, priority, status, pageable);

        return ResponseEntity.ok(result);
    }

    /**
     * Citizen dashboard statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<CitizenStatsResponse> getCitizenStats(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User citizen = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("Citizen user not found"));

        CitizenStatsResponse stats = complaintService.getCitizenStats(citizen);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get full complaint details by ID or reference code (e.g. CC-2026-1001)
     */
    @GetMapping("/{id}")
    public ResponseEntity<ComplaintDetailResponse> getComplaintById(@PathVariable("id") String id) {
        ComplaintDetailResponse response = complaintService.getComplaintDetails(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get status audit history for a complaint
     */
    @GetMapping("/{id}/history")
    public ResponseEntity<List<StatusHistoryDto>> getComplaintHistory(@PathVariable("id") String id) {
        List<StatusHistoryDto> history = complaintService.getComplaintHistory(id);
        return ResponseEntity.ok(history);
    }

    /**
     * Safely serve uploaded photo evidence
     */
    @GetMapping("/images/{fileName:.+}")
    public ResponseEntity<Resource> downloadImage(@PathVariable String fileName) {
        Resource resource = fileStorageService.loadFileAsResource(fileName);

        String contentType = "application/octet-stream";
        try {
            contentType = Files.probeContentType(resource.getFile().toPath());
        } catch (IOException ignored) {
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "image/jpeg"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
