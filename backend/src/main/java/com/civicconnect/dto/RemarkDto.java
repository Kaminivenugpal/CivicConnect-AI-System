package com.civicconnect.dto;

import java.time.LocalDateTime;

public class RemarkDto {

    private Long id;
    private String remarkText;
    private String authorityName;
    private String authorityEmail;
    private LocalDateTime createdAt;

    public RemarkDto() {
    }

    public RemarkDto(Long id, String remarkText, String authorityName, String authorityEmail, LocalDateTime createdAt) {
        this.id = id;
        this.remarkText = remarkText;
        this.authorityName = authorityName;
        this.authorityEmail = authorityEmail;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRemarkText() {
        return remarkText;
    }

    public void setRemarkText(String remarkText) {
        this.remarkText = remarkText;
    }

    public String getAuthorityName() {
        return authorityName;
    }

    public void setAuthorityName(String authorityName) {
        this.authorityName = authorityName;
    }

    public String getAuthorityEmail() {
        return authorityEmail;
    }

    public void setAuthorityEmail(String authorityEmail) {
        this.authorityEmail = authorityEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
