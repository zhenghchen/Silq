package com.silq.ai.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Health check controller for monitoring backend status
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    /**
     * Health check endpoint
     * 
     * @return Status information about the backend service
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Silq AI Backend");
        response.put("version", "1.0.0");
        response.put("timestamp", LocalDateTime.now());
        response.put("message", "Backend is running successfully");
        
        return ResponseEntity.ok(response);
    }
}
