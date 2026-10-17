package com.civicconnect.repository;

import com.civicconnect.entity.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long>, JpaSpecificationExecutor<Complaint> {

    Optional<Complaint> findByReferenceId(String referenceId);

    Page<Complaint> findByCitizen(User citizen, Pageable pageable);

    long countByCitizen(User citizen);

    long countByCitizenAndStatus(User citizen, ComplaintStatus status);

    long countByStatus(ComplaintStatus status);

    @Query("SELECT c.category, COUNT(c) FROM Complaint c GROUP BY c.category")
    List<Object[]> countGroupByCategory();

    @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
    List<Object[]> countGroupByStatus();

    @Query("SELECT c FROM Complaint c WHERE c.citizen = :citizen AND " +
           "(:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.referenceId) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:category IS NULL OR c.category = :category) AND " +
           "(:priority IS NULL OR c.priority = :priority) AND " +
           "(:status IS NULL OR c.status = :status)")
    Page<Complaint> findWithFiltersForCitizen(
            @Param("citizen") User citizen,
            @Param("search") String search,
            @Param("category") ComplaintCategory category,
            @Param("priority") ComplaintPriority priority,
            @Param("status") ComplaintStatus status,
            Pageable pageable
    );

    @Query("SELECT c FROM Complaint c WHERE " +
           "(:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.referenceId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.location) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:category IS NULL OR c.category = :category) AND " +
           "(:priority IS NULL OR c.priority = :priority) AND " +
           "(:status IS NULL OR c.status = :status)")
    Page<Complaint> findWithFilters(
            @Param("search") String search,
            @Param("category") ComplaintCategory category,
            @Param("priority") ComplaintPriority priority,
            @Param("status") ComplaintStatus status,
            Pageable pageable
    );
}
