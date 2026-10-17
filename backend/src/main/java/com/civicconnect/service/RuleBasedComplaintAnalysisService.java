package com.civicconnect.service;

import com.civicconnect.dto.AnalysisResponse;
import com.civicconnect.entity.ComplaintCategory;
import com.civicconnect.entity.ComplaintPriority;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Baseline Rule-Based NLP Classifier for Civic Grievances.
 *
 * NOTE: This is an honest, explainable keyword and pattern-based baseline classifier
 * that operates offline without third-party API dependencies or fees.
 * It scores domain keywords across civic departments and evaluates severity markers
 * for priority triage.
 */
@Service
public class RuleBasedComplaintAnalysisService implements ComplaintAnalysisService {

    // Category Keyword Mappings
    private static final Map<ComplaintCategory, List<String>> CATEGORY_KEYWORDS = new EnumMap<>(ComplaintCategory.class);

    // High Urgency Markers
    private static final List<String> HIGH_URGENCY_KEYWORDS = Arrays.asList(
            "sparking", "live wire", "open manhole", "deep crater", "accident", "fatal",
            "dangerous", "hazard", "hazard", "emergency", "burst", "flooding", "collapsing",
            "falling tree", "current", "shock", "fire", "immediate danger", "life threatening",
            "severe", "uncovered manhole", "electric shock"
    );

    // Medium Urgency Markers
    private static final List<String> MEDIUM_URGENCY_KEYWORDS = Arrays.asList(
            "overflowing", "blocked", "clogged", "stagnant", "traffic jam", "foul smell",
            "stinking", "pothole", "leak", "no water", "dark street", "garbage pile",
            "inconvenience", "delay", "broken pipe"
    );

    static {
        CATEGORY_KEYWORDS.put(ComplaintCategory.ROADS, Arrays.asList(
                "pothole", "potholes", "road", "roads", "asphalt", "crater", "craters",
                "street surface", "pavement", "footpath", "speed breaker", "cave-in",
                "road damaged", "damaged road", "uneven road", "tar", "ditch"
        ));

        CATEGORY_KEYWORDS.put(ComplaintCategory.WATER_SUPPLY, Arrays.asList(
                "water", "leak", "leakage", "pipeline", "pipe burst", "burst pipe",
                "drinking water", "water contamination", "low pressure", "no water",
                "water supply", "tap", "valve", "water tanker", "dirty water"
        ));

        CATEGORY_KEYWORDS.put(ComplaintCategory.ELECTRICITY, Arrays.asList(
                "street light", "streetlight", "streetlights", "light", "lamp post", "pole",
                "electricity", "power cut", "sparking", "live wire", "wire", "blackout",
                "transformer", "electric shock", "exposed wire", "short circuit", "power failure"
        ));

        CATEGORY_KEYWORDS.put(ComplaintCategory.SANITATION, Arrays.asList(
                "garbage", "trash", "dump", "dumping", "waste", "stench", "foul smell",
                "dustbin", "litter", "rotting", "uncollected", "filth", "dead animal",
                "sanitation", "debris", "sweep", "rubbish"
        ));

        CATEGORY_KEYWORDS.put(ComplaintCategory.DRAINAGE, Arrays.asList(
                "drain", "drainage", "sewage", "manhole", "sewer", "clogged drain",
                "flooded", "gutter", "rainwater", "stagnant water", "overflowing sewage",
                "blocked drain", "water logging", "waterlogged"
        ));

        CATEGORY_KEYWORDS.put(ComplaintCategory.PUBLIC_SAFETY, Arrays.asList(
                "dangerous", "hazard", "accident", "collapse", "falling", "fire hazard",
                "safety", "crime", "illegal parking", "stray dog", "aggressive",
                "encroachment", "open pit", "building crack"
        ));
    }

    @Override
    public AnalysisResponse analyze(String title, String description) {
        String fullText = ((title != null ? title : "") + " " + (description != null ? description : "")).toLowerCase();

        // 1. Evaluate Category Scores
        Map<ComplaintCategory, Integer> categoryScores = new EnumMap<>(ComplaintCategory.class);
        Map<ComplaintCategory, List<String>> matchedKeywordsPerCategory = new EnumMap<>(ComplaintCategory.class);

        for (Map.Entry<ComplaintCategory, List<String>> entry : CATEGORY_KEYWORDS.entrySet()) {
            ComplaintCategory category = entry.getKey();
            List<String> keywords = entry.getValue();
            int score = 0;
            List<String> matched = new ArrayList<>();

            for (String kw : keywords) {
                if (fullText.contains(kw)) {
                    score += kw.contains(" ") ? 3 : 2; // multi-word matches carry higher weight
                    matched.add(kw);
                }
            }

            if (score > 0) {
                categoryScores.put(category, score);
                matchedKeywordsPerCategory.put(category, matched);
            }
        }

        // Determine Highest Scoring Category
        ComplaintCategory predictedCategory = ComplaintCategory.OTHER;
        int maxScore = 0;
        List<String> topMatches = Collections.emptyList();

        for (Map.Entry<ComplaintCategory, Integer> entry : categoryScores.entrySet()) {
            if (entry.getValue() > maxScore) {
                maxScore = entry.getValue();
                predictedCategory = entry.getKey();
                topMatches = matchedKeywordsPerCategory.get(predictedCategory);
            }
        }

        // 2. Evaluate Priority Urgency
        ComplaintPriority predictedPriority = ComplaintPriority.LOW;
        List<String> matchedUrgencyMarkers = new ArrayList<>();

        for (String highKw : HIGH_URGENCY_KEYWORDS) {
            if (fullText.contains(highKw)) {
                matchedUrgencyMarkers.add(highKw);
            }
        }

        if (!matchedUrgencyMarkers.isEmpty()) {
            predictedPriority = ComplaintPriority.HIGH;
        } else {
            for (String medKw : MEDIUM_URGENCY_KEYWORDS) {
                if (fullText.contains(medKw)) {
                    matchedUrgencyMarkers.add(medKw);
                }
            }
            if (!matchedUrgencyMarkers.isEmpty() || predictedCategory != ComplaintCategory.OTHER) {
                predictedPriority = ComplaintPriority.MEDIUM;
            }
        }

        // 3. Compute Honest Confidence Score
        double confidenceScore;
        if (predictedCategory == ComplaintCategory.OTHER) {
            confidenceScore = 0.50;
        } else if (maxScore >= 6) {
            confidenceScore = 0.94;
        } else if (maxScore >= 4) {
            confidenceScore = 0.86;
        } else {
            confidenceScore = 0.75;
        }

        // 4. Formulate Detailed Human-Readable Explanation
        StringBuilder explanation = new StringBuilder();
        explanation.append("Rule-based classifier matched ");
        if (!topMatches.isEmpty()) {
            explanation.append("key indicators [").append(String.join(", ", topMatches)).append("] ");
            explanation.append("mapping to category '").append(predictedCategory.name()).append("'. ");
        } else {
            explanation.append("general text terms, defaulting to 'OTHER'. ");
        }

        if (predictedPriority == ComplaintPriority.HIGH) {
            explanation.append("High priority assigned due to urgent/safety keywords: [")
                    .append(String.join(", ", matchedUrgencyMarkers)).append("].");
        } else if (predictedPriority == ComplaintPriority.MEDIUM) {
            explanation.append("Medium priority assigned based on public convenience impact.");
        } else {
            explanation.append("Routine priority assigned for standard municipal maintenance.");
        }

        return new AnalysisResponse(predictedCategory, predictedPriority, confidenceScore, explanation.toString());
    }
}
