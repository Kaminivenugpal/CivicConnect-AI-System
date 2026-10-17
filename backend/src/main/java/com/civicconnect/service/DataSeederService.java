package com.civicconnect.service;

import com.civicconnect.entity.*;
import com.civicconnect.repository.AuthorityRemarkRepository;
import com.civicconnect.repository.ComplaintRepository;
import com.civicconnect.repository.ComplaintStatusHistoryRepository;
import com.civicconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class DataSeederService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final ComplaintStatusHistoryRepository statusHistoryRepository;
    private final AuthorityRemarkRepository remarkRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    public DataSeederService(UserRepository userRepository,
                             ComplaintRepository complaintRepository,
                             ComplaintStatusHistoryRepository statusHistoryRepository,
                             AuthorityRemarkRepository remarkRepository,
                             PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.remarkRepository = remarkRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) {
            return;
        }

        // Seed default authority if not exists
        if (!userRepository.existsByEmail("admin@civicconnect.gov")) {
            User admin = new User(
                    "Municipal Officer R. Verma",
                    "admin@civicconnect.gov",
                    passwordEncoder.encode("Admin@123"),
                    "1800-CIVIC-01",
                    Role.AUTHORITY
            );
            userRepository.save(admin);
        }

        // Seed demo citizen if not exists
        User citizen1;
        if (!userRepository.existsByEmail("citizen@example.com")) {
            citizen1 = new User(
                    "Ravi Kumar",
                    "citizen@example.com",
                    passwordEncoder.encode("Citizen@123"),
                    "+1 555-0199",
                    Role.CITIZEN
            );
            citizen1 = userRepository.save(citizen1);
        } else {
            citizen1 = userRepository.findByEmail("citizen@example.com").orElse(null);
        }

        User citizen2;
        if (!userRepository.existsByEmail("anita@example.com")) {
            citizen2 = new User(
                    "Anita Sharma",
                    "anita@example.com",
                    passwordEncoder.encode("Citizen@123"),
                    "+1 555-0144",
                    Role.CITIZEN
            );
            citizen2 = userRepository.save(citizen2);
        } else {
            citizen2 = userRepository.findByEmail("anita@example.com").orElse(null);
        }

        User adminUser = userRepository.findByEmail("admin@civicconnect.gov").orElse(null);

        // Seed sample complaints if database is empty
        if (complaintRepository.count() == 0 && citizen1 != null && adminUser != null) {
            createSampleComplaint(
                    "CC-2026-1001",
                    "Deep dangerous pothole near Metro Station Gate 2",
                    "There is a severe crater-like pothole on the main road right outside Metro Gate 2. Two two-wheelers skidded yesterday during evening traffic. Needs emergency asphalt leveling.",
                    "Corner of Metro Station & Station Road, Ward 12",
                    ComplaintCategory.ROADS,
                    ComplaintPriority.HIGH,
                    ComplaintStatus.IN_PROGRESS,
                    "Public Works Department (Roads)",
                    "Officer D. Kulkarni",
                    0.94,
                    "Rule-based classifier matched key indicators [pothole, road] mapping to ROADS. High priority assigned due to urgent keywords: [dangerous, crater].",
                    citizen1,
                    adminUser
            );

            createSampleComplaint(
                    "CC-2026-1002",
                    "Major drinking water pipeline burst flooding street",
                    "A drinking water supply main line cracked open and clean water is flooding into the road continuously since early morning. Houses on 4th block have zero tap pressure.",
                    "4th Main Road, Green Park Layout",
                    ComplaintCategory.WATER_SUPPLY,
                    ComplaintPriority.HIGH,
                    ComplaintStatus.UNDER_REVIEW,
                    "Municipal Water Board",
                    "Inspector M. Patil",
                    0.92,
                    "Rule-based classifier matched key indicators [pipeline, water, burst] mapping to WATER_SUPPLY. High priority assigned due to urgent keywords: [burst, flooding].",
                    citizen2,
                    adminUser
            );

            createSampleComplaint(
                    "CC-2026-1003",
                    "Flickering and dark streetlights across 3rd Cross",
                    "Five consecutive streetlights are not functioning. The whole street is completely pitch dark after 7 PM, creating safety concerns for pedestrians and elderly residents.",
                    "3rd Cross, Shanti Nagar, Sector 4",
                    ComplaintCategory.ELECTRICITY,
                    ComplaintPriority.MEDIUM,
                    ComplaintStatus.SUBMITTED,
                    "Electricity & Power Grid Authority",
                    null,
                    0.86,
                    "Rule-based classifier matched key indicators [streetlights, light] mapping to ELECTRICITY. Medium priority assigned based on public convenience impact.",
                    citizen1,
                    adminUser
            );

            createSampleComplaint(
                    "CC-2026-1004",
                    "Overflowing community garbage dump emitting foul odor",
                    "Municipal collection bin has not been cleared for 4 days. Waste has spilled over the entire pedestrian sidewalk. Stray cattle and dogs are scattering debris.",
                    "Opposite Community Health Center, Market Road",
                    ComplaintCategory.SANITATION,
                    ComplaintPriority.MEDIUM,
                    ComplaintStatus.RESOLVED,
                    "Solid Waste Management & Sanitation",
                    "Sanitation Supv. A. Rao",
                    0.90,
                    "Rule-based classifier matched key indicators [garbage, dump, waste, bin] mapping to SANITATION. Medium priority assigned based on public convenience impact.",
                    citizen2,
                    adminUser
            );
        }
    }

    private void createSampleComplaint(
            String refId, String title, String description, String location,
            ComplaintCategory category, ComplaintPriority priority, ComplaintStatus status,
            String department, String assignedOfficer, double confidence, String explanation,
            User citizen, User admin
    ) {
        Complaint c = new Complaint();
        c.setReferenceId(refId);
        c.setTitle(title);
        c.setDescription(description);
        c.setLocation(location);
        c.setCategory(category);
        c.setPriority(priority);
        c.setStatus(status);
        c.setDepartment(department);
        c.setAssignedOfficer(assignedOfficer);
        c.setAiConfidenceScore(confidence);
        c.setAiExplanation(explanation);
        c.setCitizen(citizen);
        Complaint saved = complaintRepository.save(c);

        // Initial submission history
        ComplaintStatusHistory h1 = new ComplaintStatusHistory(
                saved, null, ComplaintStatus.SUBMITTED,
                "Complaint filed and registered into triage system.",
                citizen.getFullName()
        );
        h1.setTimestamp(LocalDateTime.now().minusDays(3));
        statusHistoryRepository.save(h1);

        if (status != ComplaintStatus.SUBMITTED) {
            ComplaintStatusHistory h2 = new ComplaintStatusHistory(
                    saved, ComplaintStatus.SUBMITTED, ComplaintStatus.UNDER_REVIEW,
                    "Assigned to " + department + " for preliminary inspection.",
                    admin.getFullName()
            );
            h2.setTimestamp(LocalDateTime.now().minusDays(2));
            statusHistoryRepository.save(h2);
        }

        if (status == ComplaintStatus.IN_PROGRESS || status == ComplaintStatus.RESOLVED) {
            ComplaintStatusHistory h3 = new ComplaintStatusHistory(
                    saved, ComplaintStatus.UNDER_REVIEW, ComplaintStatus.IN_PROGRESS,
                    "Field repair crew dispatched with equipment.",
                    admin.getFullName()
            );
            h3.setTimestamp(LocalDateTime.now().minusDays(1));
            statusHistoryRepository.save(h3);
        }

        if (status == ComplaintStatus.RESOLVED) {
            ComplaintStatusHistory h4 = new ComplaintStatusHistory(
                    saved, ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED,
                    "Work verified and site cleared. Grievance closed successfully.",
                    admin.getFullName()
            );
            h4.setTimestamp(LocalDateTime.now().minusHours(4));
            statusHistoryRepository.save(h4);

            AuthorityRemark remark = new AuthorityRemark(
                    saved,
                    "Sanitation sweep completed at 11:30 AM. Waste compactors sanitized the area.",
                    admin
            );
            remarkRepository.save(remark);
        }
    }
}
