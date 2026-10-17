package com.civicconnect.dto;

import com.civicconnect.entity.ComplaintStatus;
import jakarta.validation.constraints.NotNull;

public class StatusUpdateRequest {

    @NotNull(message = "Target status is required")
    private ComplaintStatus status;

    private String remarks;

    public StatusUpdateRequest() {
    }

    public StatusUpdateRequest(ComplaintStatus status, String remarks) {
        this.status = status;
        this.remarks = remarks;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
