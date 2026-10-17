package com.civicconnect.dto;

import com.civicconnect.entity.ComplaintCategory;
import com.civicconnect.entity.ComplaintPriority;

public class AnalysisResponse {

    private ComplaintCategory predictedCategory;
    private ComplaintPriority predictedPriority;
    private Double confidenceScore;
    private String explanation;

    public AnalysisResponse() {
    }

    public AnalysisResponse(ComplaintCategory predictedCategory, ComplaintPriority predictedPriority, Double confidenceScore, String explanation) {
        this.predictedCategory = predictedCategory;
        this.predictedPriority = predictedPriority;
        this.confidenceScore = confidenceScore;
        this.explanation = explanation;
    }

    public ComplaintCategory getPredictedCategory() {
        return predictedCategory;
    }

    public void setPredictedCategory(ComplaintCategory predictedCategory) {
        this.predictedCategory = predictedCategory;
    }

    public ComplaintPriority getPredictedPriority() {
        return predictedPriority;
    }

    public void setPredictedPriority(ComplaintPriority predictedPriority) {
        this.predictedPriority = predictedPriority;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
