package com.civicconnect;

import com.civicconnect.dto.ComplaintCreateRequest;
import com.civicconnect.dto.ComplaintResponse;
import com.civicconnect.entity.*;
import com.civicconnect.exception.BadRequestException;
import com.civicconnect.repository.ComplaintRepository;
import com.civicconnect.repository.UserRepository;
import com.civicconnect.service.AuthorityService;
import com.civicconnect.service.ComplaintService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AuthorityServiceTest {

    @Autowired
    private AuthorityService authorityService;

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    private User citizen;
    private User authority;
    private Complaint complaint;

    @BeforeEach
    void setUp() {
        citizen = userRepository.save(new User("Test Citizen", "cit" + System.currentTimeMillis() + "@test.com", "pass", "123", Role.CITIZEN));
        authority = userRepository.save(new User("Test Officer", "auth" + System.currentTimeMillis() + "@test.com", "pass", "456", Role.AUTHORITY));

        ComplaintCreateRequest req = new ComplaintCreateRequest(
                "Leaking main line",
                "Water leak near sidewalk",
                "Sector 7",
                ComplaintCategory.WATER_SUPPLY,
                ComplaintPriority.MEDIUM
        );
        ComplaintResponse created = complaintService.createComplaint(req, null, citizen);
        complaint = complaintRepository.findById(created.getId()).orElseThrow();
    }

    @Test
    @DisplayName("Should successfully progress status from SUBMITTED to UNDER_REVIEW, IN_PROGRESS, and RESOLVED")
    void testValidLifecycleTransitions() {
        // Step 1: SUBMITTED -> UNDER_REVIEW
        ComplaintResponse step1 = authorityService.updateStatus(complaint.getId(), ComplaintStatus.UNDER_REVIEW, "Assigned to review crew", authority);
        assertEquals(ComplaintStatus.UNDER_REVIEW, step1.getStatus());

        // Step 2: UNDER_REVIEW -> IN_PROGRESS
        ComplaintResponse step2 = authorityService.updateStatus(complaint.getId(), ComplaintStatus.IN_PROGRESS, "Pipes being replaced", authority);
        assertEquals(ComplaintStatus.IN_PROGRESS, step2.getStatus());

        // Step 3: IN_PROGRESS -> RESOLVED
        ComplaintResponse step3 = authorityService.updateStatus(complaint.getId(), ComplaintStatus.RESOLVED, "Repair complete and tested", authority);
        assertEquals(ComplaintStatus.RESOLVED, step3.getStatus());
    }

    @Test
    @DisplayName("Should reject invalid state transition jumping directly from SUBMITTED to RESOLVED")
    void testInvalidTransitionThrowsException() {
        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                authorityService.updateStatus(complaint.getId(), ComplaintStatus.RESOLVED, "Skipping review", authority)
        );
        assertTrue(ex.getMessage().contains("Invalid status transition"));
    }

    @Test
    @DisplayName("Should require non-blank remarks when rejecting a complaint")
    void testRejectionRequiresExplanation() {
        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                authorityService.updateStatus(complaint.getId(), ComplaintStatus.REJECTED, "", authority)
        );
        assertTrue(ex.getMessage().contains("mandatory explanation note is required"));
    }

    @Test
    @DisplayName("Should allow department assignment and updating classification")
    void testDepartmentAssignmentAndClassification() {
        authorityService.assignDepartment(complaint.getId(), "Water Board", "Officer Patil", authority);
        Complaint updated = complaintRepository.findById(complaint.getId()).orElseThrow();
        assertEquals("Water Board", updated.getDepartment());
        assertEquals("Officer Patil", updated.getAssignedOfficer());

        authorityService.updateClassification(complaint.getId(), ComplaintCategory.DRAINAGE, ComplaintPriority.HIGH, "Actually a drainage backflow issue", authority);
        Complaint reclassified = complaintRepository.findById(complaint.getId()).orElseThrow();
        assertEquals(ComplaintCategory.DRAINAGE, reclassified.getCategory());
        assertEquals(ComplaintPriority.HIGH, reclassified.getPriority());
    }
}
