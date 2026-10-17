package com.civicconnect.repository;

import com.civicconnect.entity.AuthorityRemark;
import com.civicconnect.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuthorityRemarkRepository extends JpaRepository<AuthorityRemark, Long> {

    List<AuthorityRemark> findByComplaintOrderByCreatedAtDesc(Complaint complaint);
}
