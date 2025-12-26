package com.yourkitchen.controller;

import com.yourkitchen.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gemini")
public class GeminiController {

    private final GeminiService geminiService;

    @Autowired
    public GeminiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/weekly-plan")
    public ResponseEntity<String> generateWeeklyPlan(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> answers = (List<Map<String, Object>>) request.get("answers");
        String result = geminiService.generateWeeklyPlan(answers);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/chat")
    public ResponseEntity<String> chatWithChef(@RequestBody Map<String, Object> request) {
        String message = (String) request.get("message");
        String context = (String) request.getOrDefault("context", "");
        String mode = (String) request.getOrDefault("mode", "web_search");

        String result = geminiService.chatWithChef(message, context, mode);
        return ResponseEntity.ok(result);
    }
}
