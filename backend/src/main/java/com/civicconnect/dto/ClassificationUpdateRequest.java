package com.civicconnect.dto;

import com.civicconnect.entity.ComplaintCategory;
import com.civicconnect.entity.ComplaintPriority;

public class ClassificationUpdateRequest {

    private ComplaintCategory category;
    private ComplaintPriority priority;
    private String rationale;

    public ClassificationUpdateRequest() {
    }

    public ClassificationUpdateRequest(ComplaintCategory category, ComplaintPriority priority, String rationale) {
        this.category = category;
        this.priority = priority;
        this.rationale = rationale;
    }

    public ComplaintCategory getCategory() {
        return category;
    }

    public void setCategory(ComplaintCategory category) {
        this.category = category;
    }

    public ComplaintPriority getPriority() {
        return priority;
    }

    public void setPriority(ComplaintPriority priority) {
        this.priority = priority;
    }

    public String getRationale() {
        return rationale;
    }

    public void setRationale(String rationale) {
        this.rationale = rationale;
    }
}
