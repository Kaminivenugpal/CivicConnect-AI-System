package com.civicconnect;

import com.civicconnect.dto.AnalysisResponse;
import com.civicconnect.entity.ComplaintCategory;
import com.civicconnect.entity.ComplaintPriority;
import com.civicconnect.service.RuleBasedComplaintAnalysisService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class ComplaintAnalysisServiceTest {

    private RuleBasedComplaintAnalysisService analysisService;

    @BeforeEach
    void setUp() {
        analysisService = new RuleBasedComplaintAnalysisService();
    }

    @Test
    @DisplayName("Should classify roads and potholes with high urgency")
    void testRoadClassificationHighPriority() {
        AnalysisResponse response = analysisService.analyze(
                "Dangerous deep crater pothole on Main Street",
                "Two cars were damaged due to the massive road crater. Immediate accident hazard."
        );

        assertEquals(ComplaintCategory.ROADS, response.getPredictedCategory());
        assertEquals(ComplaintPriority.HIGH, response.getPredictedPriority());
        assertTrue(response.getConfidenceScore() >= 0.85);
        assertTrue(response.getExplanation().contains("ROADS"));
    }

    @Test
    @DisplayName("Should classify water supply leakage issue")
    void testWaterSupplyClassification() {
        AnalysisResponse response = analysisService.analyze(
                "Drinking water pipeline leakage",
                "Clean drinking water is leaking from the municipal pipeline on 5th cross."
        );

        assertEquals(ComplaintCategory.WATER_SUPPLY, response.getPredictedCategory());
        assertNotNull(response.getPredictedPriority());
        assertTrue(response.getExplanation().contains("WATER_SUPPLY"));
    }

    @Test
    @DisplayName("Should classify electricity hazard with live wire as HIGH priority")
    void testElectricityHazard() {
        AnalysisResponse response = analysisService.analyze(
                "Sparking transformer and live wire exposed",
                "Electric lamp post has live wire hanging dangerously near school gate. Sparking continuously."
        );

        assertEquals(ComplaintCategory.ELECTRICITY, response.getPredictedCategory());
        assertEquals(ComplaintPriority.HIGH, response.getPredictedPriority());
        assertTrue(response.getExplanation().contains("sparking"));
    }

    @Test
    @DisplayName("Should classify sanitation and garbage accumulation")
    void testSanitationClassification() {
        AnalysisResponse response = analysisService.analyze(
                "Garbage waste pile unattended",
                "Rotting trash and debris overflowing from community dustbin causing foul smell."
        );

        assertEquals(ComplaintCategory.SANITATION, response.getPredictedCategory());
        assertEquals(ComplaintPriority.MEDIUM, response.getPredictedPriority());
        assertTrue(response.getExplanation().contains("SANITATION"));
    }

    @Test
    @DisplayName("Should classify clogged drainage and sewage")
    void testDrainageClassification() {
        AnalysisResponse response = analysisService.analyze(
                "Clogged sewage manhole overflowing",
                "Rainwater drain is blocked with dirt, leading to street water logging."
        );

        assertEquals(ComplaintCategory.DRAINAGE, response.getPredictedCategory());
        assertTrue(response.getExplanation().contains("DRAINAGE"));
    }

    @Test
    @DisplayName("Should fallback to OTHER category for unrelated text")
    void testFallbackClassification() {
        AnalysisResponse response = analysisService.analyze(
                "General query regarding town hall timings",
                "Need information about civic portal certificates."
        );

        assertEquals(ComplaintCategory.OTHER, response.getPredictedCategory());
        assertEquals(0.50, response.getConfidenceScore());
    }
}
