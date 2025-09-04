package com.silq.ai.backend.controller;

import com.silq.ai.backend.services.llm.LLMProxyFactory;
import com.silq.ai.backend.services.llm.LLMService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for testing and demonstrating the LLM engine functionality.
 */
@RestController
@RequestMapping("/api/llm")
public class LLMController {

    private static final Logger log = LoggerFactory.getLogger(LLMController.class);

    @Autowired
    private LLMProxyFactory llmProxyFactory;

    /**
     * Test endpoint to generate a response using the specified LLM provider.
     * 
     * @param request The request containing prompt, provider, and API key
     * @return The generated response from the LLM
     */
    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateResponse(@RequestBody Map<String, String> request) {
        try {
            String prompt = request.get("prompt");
            String provider = request.get("provider");
            String apiKey = request.get("apiKey");

            // Validate input
            if (prompt == null || prompt.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Prompt is required"));
            }
            if (provider == null || provider.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Provider is required"));
            }
            if (apiKey == null || apiKey.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "API key is required"));
            }

            // Get the appropriate LLM service
            LLMService llmService = llmProxyFactory.getService(provider);
            
            // Generate response
            // TODO: Update this test endpoint to support conversational format.
            // This is currently disabled as it expects a List<ChatMessage> not a String.
            String response = "This test endpoint is disabled pending updates for conversational AI.";
            // String response = llmService.generateResponse(prompt, apiKey);

            // Return success response
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("provider", provider);
            result.put("response", response);
            result.put("prompt", prompt);

            log.info("Successfully generated response using provider: {}", provider);
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error generating response: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to generate response: " + e.getMessage()));
        }
    }

    /**
     * Get available LLM providers.
     * 
     * @return List of available providers
     */
    @GetMapping("/providers")
    public ResponseEntity<Map<String, Object>> getProviders() {
        Map<String, Object> response = new HashMap<>();
        response.put("providers", llmProxyFactory.getAvailableProviders());
        response.put("count", llmProxyFactory.getAvailableProviders().size());
        return ResponseEntity.ok(response);
    }

    /**
     * Check if a provider is supported.
     * 
     * @param provider The provider name to check
     * @return Whether the provider is supported
     */
    @GetMapping("/providers/{provider}/supported")
    public ResponseEntity<Map<String, Object>> isProviderSupported(@PathVariable String provider) {
        boolean supported = llmProxyFactory.isProviderSupported(provider);
        Map<String, Object> response = new HashMap<>();
        response.put("provider", provider);
        response.put("supported", supported);
        return ResponseEntity.ok(response);
    }
}
