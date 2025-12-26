package com.yourkitchen.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/";
    private final RestTemplate restTemplate;

    public GeminiService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Generate weekly meal plan using Gemini API
     */
    public String generateWeeklyPlan(List<Map<String, Object>> answers) {
        String model = "gemini-2.0-flash:generateContent";
        String url = GEMINI_API_URL + model + "?key=" + apiKey;

        // Build the prompt from answers
        StringBuilder userProfileSummary = new StringBuilder();
        for (Map<String, Object> answer : answers) {
            userProfileSummary.append("Q").append(answer.get("questionId"))
                    .append(": ").append(answer.get("answer")).append("\n");
        }

        String prompt = buildWeeklyPlanPrompt(userProfileSummary.toString());

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> contents = new HashMap<>();
        contents.put("parts", List.of(Map.of("text", prompt)));
        requestBody.put("contents", List.of(contents));

        // Add generation config for JSON output
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");
        requestBody.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Error calling Gemini API: " + e.getMessage(), e);
        }
    }

    /**
     * Chat with Chef AI
     */
    public String chatWithChef(String message, String context, String mode) {
        String model = mode.equals("chef_brain") ? "gemini-2.0-pro:generateContent"
                : "gemini-2.0-flash:generateContent";
        String url = GEMINI_API_URL + model + "?key=" + apiKey;

        String fullPrompt = "You are Chef AI, a helpful culinary mentor. " +
                "User Context: " + context + "\n" +
                "User Message: " + message;

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> contents = new HashMap<>();
        contents.put("parts", List.of(Map.of("text", fullPrompt)));
        requestBody.put("contents", List.of(contents));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Error calling Gemini API: " + e.getMessage(), e);
        }
    }

    private String buildWeeklyPlanPrompt(String userProfileSummary) {
        return """
                ACT AS A SENIOR EXECUTIVE CHEF.

                Task: Design a bespoke 7-day meal plan for the following client.

                Client Profile & Constraints:
                %s

                STRICT CHEF'S REQUIREMENTS (Must pass "Chef's Audit"):
                1. **Safety Check**: Verify every ingredient against the client's allergies and dislikes. Zero tolerance for errors.
                2. **Meal Selection**: Pay close attention to "Which meals do you need planned?". ONLY generate the requested meals.
                3. **Skill Matching**: If the client is a beginner, use fail-proof techniques.
                4. **Efficiency**: The Sunday prep must genuinely cut 50% of weeknight cooking time.
                5. **Instructions**: You MUST provide concise but complete step-by-step instructions for every meal generated.
                6. **Nutrition Logic**: Prioritize whole foods.

                Output Format: JSON only with this structure:
                {
                    "weekTitle": "string",
                    "theme": "string",
                    "dailyPlans": [{"day": "string", "meals": [{"type": "string", "name": "string", "timeEstimate": "string", "description": "string", "techniqueFocus": "string", "ingredients": ["string"], "instructions": ["string"]}]}],
                    "groceryList": [{"item": "string", "category": "string", "note": "string"}],
                    "sundayPrep": [{"task": "string", "time": "string", "why": "string"}],
                    "sustainabilityTip": "string"
                }
                """
                .formatted(userProfileSummary);
    }
}
