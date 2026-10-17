package com.civicconnect.dto;

import jakarta.validation.constraints.NotBlank;

public class RemarkCreateRequest {

    @NotBlank(message = "Remark text is required")
    private String remarkText;

    public RemarkCreateRequest() {
    }

    public RemarkCreateRequest(String remarkText) {
        this.remarkText = remarkText;
    }

    public String getRemarkText() {
        return remarkText;
    }

    public void setRemarkText(String remarkText) {
        this.remarkText = remarkText;
    }
}
