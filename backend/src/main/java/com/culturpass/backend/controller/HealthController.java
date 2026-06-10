package com.culturpass.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

// Simple endpoint to confirm the API is running
@RestController
@RequestMapping("/api/health")
public class HealthController {

    // GET /api/health — returns API status and current timestamp
    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "CulturPass API is running");
        response.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
}