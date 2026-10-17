package com.civicconnect.dto;

import com.civicconnect.entity.ComplaintStatus;
import java.time.LocalDateTime;

public class StatusHistoryDto {

    private Long id;
    private ComplaintStatus previousStatus;
    private ComplaintStatus newStatus;
    private String remarks;
    private String changedBy;
    private LocalDateTime timestamp;

    public StatusHistoryDto() {
    }

    public StatusHistoryDto(Long id, ComplaintStatus previousStatus, ComplaintStatus newStatus, String remarks, String changedBy, LocalDateTime timestamp) {
        this.id = id;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.remarks = remarks;
        this.changedBy = changedBy;
        this.timestamp = timestamp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ComplaintStatus getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(ComplaintStatus previousStatus) {
        this.previousStatus = previousStatus;
    }

    public ComplaintStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(ComplaintStatus newStatus) {
        this.newStatus = newStatus;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(String changedBy) {
        this.changedBy = changedBy;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
