package com.civicconnect.controller;

import com.civicconnect.dto.*;
import com.civicconnect.entity.ComplaintCategory;
import com.civicconnect.entity.ComplaintPriority;
import com.civicconnect.entity.ComplaintStatus;
import com.civicconnect.entity.User;
import com.civicconnect.exception.BadRequestException;
import com.civicconnect.repository.UserRepository;
import com.civicconnect.security.UserPrincipal;
import com.civicconnect.service.AuthorityService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/authority")
public class AuthorityController {

    private final AuthorityService authorityService;
    private final UserRepository userRepository;

    public AuthorityController(AuthorityService authorityService, UserRepository userRepository) {
        this.authorityService = authorityService;
        this.userRepository = userRepository;
    }

    /**
     * Get all complaints with search and filters for municipal staff
     */
    @GetMapping("/complaints")
    public ResponseEntity<Page<ComplaintResponse>> getAllComplaints(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "category", required = false) ComplaintCategory category,
            @RequestParam(value = "priority", required = false) ComplaintPriority priority,
            @RequestParam(value = "status", required = false) ComplaintStatus status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ComplaintResponse> result = authorityService.getAllComplaints(search, category, priority, status, pageable);
        return ResponseEntity.ok(result);
    }

    /**
     * Get real-time dashboard statistics and distribution charts calculated from database records
     */
    @GetMapping("/dashboard")
    public ResponseEntity<AuthorityDashboardStatsResponse> getDashboardStats() {
        AuthorityDashboardStatsResponse stats = authorityService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Update complaint status with strict state-transition validation
     */
    @PatchMapping("/complaints/{id}/status")
    public ResponseEntity<ComplaintResponse> updateStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        User authorityUser = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("Authority user context not found"));

        ComplaintResponse updated = authorityService.updateStatus(id, request.getStatus(), request.getRemarks(), authorityUser);
        return ResponseEntity.ok(updated);
    }

    /**
     * Review and update AI-predicted category or priority
     */
    @PatchMapping("/complaints/{id}/classification")
    public ResponseEntity<ComplaintResponse> updateClassification(
            @PathVariable("id") Long id,
            @Valid @RequestBody ClassificationUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        User authorityUser = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("Authority user context not found"));

        ComplaintResponse updated = authorityService.updateClassification(
                id, request.getCategory(), request.getPriority(), request.getRationale(), authorityUser
        );
        return ResponseEntity.ok(updated);
    }

    /**
     * Assign complaint to municipal department and designated officer
     */
    @PatchMapping("/complaints/{id}/assignment")
    public ResponseEntity<ComplaintResponse> assignDepartment(
            @PathVariable("id") Long id,
            @Valid @RequestBody AssignmentRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        User authorityUser = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("Authority user context not found"));

        ComplaintResponse updated = authorityService.assignDepartment(
                id, request.getDepartment(), request.getAssignedOfficer(), authorityUser
        );
        return ResponseEntity.ok(updated);
    }

    /**
     * Post official authority remark
     */
    @PostMapping("/complaints/{id}/remarks")
    public ResponseEntity<Void> addRemark(
            @PathVariable("id") Long id,
            @Valid @RequestBody RemarkCreateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        User authorityUser = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("Authority user context not found"));

        authorityService.addRemark(id, request.getRemarkText(), authorityUser);
        return ResponseEntity.ok().build();
    }
}
