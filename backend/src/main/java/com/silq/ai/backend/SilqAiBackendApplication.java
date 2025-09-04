package com.silq.ai.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Spring Boot application class for Silq AI Backend
 * 
 * This is a stateless MVP backend service for the Silq AI Chrome Extension.
 * It provides REST API endpoints for AI-powered writing assistance.
 */
@SpringBootApplication
public class SilqAiBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(SilqAiBackendApplication.class, args);
    }
}
