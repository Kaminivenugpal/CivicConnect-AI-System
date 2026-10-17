package com.civicconnect.dto;

import jakarta.validation.constraints.NotBlank;

public class AnalysisRequest {

    private String title;

    @NotBlank(message = "Description cannot be blank for AI analysis")
    private String description;

    public AnalysisRequest() {
    }

    public AnalysisRequest(String title, String description) {
        this.title = title;
        this.description = description;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
