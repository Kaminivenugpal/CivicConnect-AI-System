package com.civicconnect.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "authority_remarks", indexes = {
    @Index(name = "idx_remark_complaint", columnList = "complaint_id"),
    @Index(name = "idx_remark_created", columnList = "createdAt")
})
public class AuthorityRemark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String remarkText;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "authority_user_id", nullable = false)
    private User authorityUser;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public AuthorityRemark() {
    }

    public AuthorityRemark(Complaint complaint, String remarkText, User authorityUser) {
        this.complaint = complaint;
        this.remarkText = remarkText;
        this.authorityUser = authorityUser;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Complaint getComplaint() {
        return complaint;
    }

    public void setComplaint(Complaint complaint) {
        this.complaint = complaint;
    }

    public String getRemarkText() {
        return remarkText;
    }

    public void setRemarkText(String remarkText) {
        this.remarkText = remarkText;
    }

    public User getAuthorityUser() {
        return authorityUser;
    }

    public void setAuthorityUser(User authorityUser) {
        this.authorityUser = authorityUser;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
