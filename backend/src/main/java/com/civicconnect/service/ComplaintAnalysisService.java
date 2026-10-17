package com.civicconnect.service;

import com.civicconnect.dto.AnalysisResponse;

/**
 * Service contract for civic complaint analysis.
 * Modular design allows swapping this baseline implementation
 * with an advanced ML/NLP or LLM model in the future without breaking application contracts.
 */
public interface ComplaintAnalysisService {

    /**
     * Analyzes complaint title and description to predict category, priority,
     * confidence score, and classification rationale.
     *
     * @param title       Complaint headline
     * @param description Detailed problem description
     * @return AnalysisResponse containing predictions and explanation
     */
    AnalysisResponse analyze(String title, String description);
}
