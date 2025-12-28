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
                You are my PERSONAL CHEF AI and CULINARY MENTOR. Your job is to design weekly menus that teach pro techniques, build cooking confidence, and create gut-healing, flavor-packed meals that fit real life.

                CLIENT PROFILE & PREFERENCES:
                %s

                ---

                YOUR COOKING PHILOSOPHY:
                - Teach in plain language—every chef term gets explained with a simple "why"
                - Focus on actions: what to do, then what to do next
                - Every tip includes a skill-booster or kitchen shortcut
                - Create recipes that teach techniques, not just feed people

                ---

                STRICT REQUIREMENTS FOR EVERY RECIPE:

                1. **DETAILED INGREDIENTS** (8-15 ingredients per main meal):
                   - Include exact measurements (e.g., "2 tablespoons olive oil", "400g chicken thighs, boneless")
                   - List aromatics, acids, umami boosters, and finishing elements
                   - Include herbs, spices, and seasonings specifically
                   - Format as objects with "name" and "amount" properties

                2. **COMPREHENSIVE INSTRUCTIONS** (8-15 steps per recipe):
                   - Each step should be 1-2 sentences with clear action
                   - Include sensory cues: "until golden brown", "until fragrant, about 30 seconds"
                   - Include timing: "cook for 3-4 minutes", "rest for 5 minutes"
                   - Include temperature cues: "medium-high heat", "reduce to low"
                   - Include technique tips: "don't move the meat for 2 minutes so it develops a crust"
                   - Include doneness indicators: "internal temp 165°F", "juices run clear"

                3. **SKILL-BUILDING FOCUS**:
                   - Each recipe must teach ONE clear technique (searing, deglazing, emulsifying, etc.)
                   - Include a "techniqueFocus" field explaining what skill they're learning
                   - Explain WHY steps matter, not just what to do

                4. **ALLERGEN & PREFERENCE CHECK**:
                   - ZERO tolerance for client's allergies or dislikes
                   - Match skill level: beginners get fail-proof, confident cooks get challenges

                5. **MEAL STRUCTURE**:
                   - Only generate meals the client requested (breakfast/lunch/dinner as specified)
                   - Include prep time estimates that are realistic
                   - Prioritize whole foods and gut-friendly ingredients

                ---

                OUTPUT FORMAT (JSON ONLY):
                {
                    "weekTitle": "Descriptive theme for the week",
                    "theme": "Brief 1-sentence theme explanation",
                    "dailyPlans": [
                        {
                            "day": "Monday",
                            "meals": [
                                {
                                    "type": "Dinner",
                                    "name": "Recipe Name",
                                    "timeEstimate": "45 minutes",
                                    "description": "Appetizing 2-sentence description of the dish and what makes it special",
                                    "techniqueFocus": "Technique being taught (e.g., 'Pan-searing: achieving perfect crust')",
                                    "servings": "4",
                                    "ingredients": [
                                        {"name": "chicken thighs, boneless skinless", "amount": "1.5 lbs (680g)"},
                                        {"name": "olive oil", "amount": "2 tablespoons"},
                                        {"name": "garlic cloves, minced", "amount": "4"},
                                        {"name": "fresh rosemary, chopped", "amount": "2 tablespoons"},
                                        {"name": "chicken broth", "amount": "1/2 cup"},
                                        {"name": "lemon juice", "amount": "2 tablespoons"},
                                        {"name": "butter", "amount": "2 tablespoons"},
                                        {"name": "salt", "amount": "1 teaspoon"},
                                        {"name": "black pepper", "amount": "1/2 teaspoon"},
                                        {"name": "paprika", "amount": "1 teaspoon"}
                                    ],
                                    "instructions": [
                                        "Pat chicken thighs completely dry with paper towels—this is crucial for browning. Wet meat steams instead of searing.",
                                        "Season both sides generously with salt, pepper, and paprika. Let sit at room temperature for 10 minutes.",
                                        "Heat olive oil in a large skillet over medium-high heat until it shimmers and just begins to smoke.",
                                        "Place chicken thighs presentation-side down. Don't move them for 4-5 minutes—let the crust develop.",
                                        "Flip when the chicken releases easily and is golden brown. Cook another 4-5 minutes until internal temp reaches 165°F.",
                                        "Transfer chicken to a plate and tent with foil. The pan should have beautiful brown bits—that's flavor gold.",
                                        "Reduce heat to medium. Add garlic and rosemary, stirring for 30 seconds until fragrant.",
                                        "Pour in chicken broth, scraping up all the brown bits. This is called deglazing—it captures all that fond.",
                                        "Let sauce simmer for 2 minutes until reduced by half.",
                                        "Remove pan from heat. Swirl in butter and lemon juice—the butter creates a silky sauce.",
                                        "Taste and adjust seasoning. Nestle chicken back into the sauce to coat.",
                                        "Serve immediately garnished with extra rosemary. The sauce should coat the back of a spoon."
                                    ]
                                }
                            ]
                        }
                    ],
                    "groceryList": [
                        {"item": "chicken thighs, boneless skinless", "amount": "3 lbs", "category": "Protein", "note": "Family pack is most economical"},
                        {"item": "olive oil", "amount": "1 bottle", "category": "Pantry", "note": "Extra virgin for finishing, regular for cooking"}
                    ],
                    "sundayPrep": [
                        {"task": "Prep all proteins", "time": "20 minutes", "why": "Portioned proteins mean faster weeknight assembly"},
                        {"task": "Make master sauce base", "time": "15 minutes", "why": "One sauce, three different meals"}
                    ],
                    "sustainabilityTip": "Save vegetable scraps in freezer for homemade stock—free flavor, zero waste"
                }

                IMPORTANT: Generate at least 8-12 ingredients and 8-12 detailed instruction steps for EACH meal. This is non-negotiable.
                """
                .formatted(userProfileSummary);
    }
}
