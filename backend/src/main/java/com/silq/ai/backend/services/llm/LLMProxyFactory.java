package com.silq.ai.backend.services.llm;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Factory class that acts as a 'universal remote' for LLM services.
 * 
 * Provides a scalable way to get the correct LLM service implementation
 * based on the provider name. Uses a Map for efficient provider lookup.
 */
@Component
public class LLMProxyFactory {

    private static final Logger log = LoggerFactory.getLogger(LLMProxyFactory.class);

    private final Map<String, LLMService> serviceMap;

    @Autowired
    public LLMProxyFactory(OpenAIService openAIService, GeminiService geminiService) {
        this.serviceMap = new HashMap<>();
        
        // Register available services
        serviceMap.put("openai", openAIService);
        serviceMap.put("gpt", openAIService);      // Alternative name for OpenAI
        serviceMap.put("gemini", geminiService);
        serviceMap.put("google", geminiService);   // Alternative name for Gemini
        
        log.info("LLMProxyFactory initialized with {} providers: {}", 
                serviceMap.size(), serviceMap.keySet());
    }

    /**
     * Gets the appropriate LLM service for the specified provider.
     * 
     * @param provider The provider name (e.g., "openai", "gemini")
     * @return The LLMService implementation for the specified provider
     * @throws IllegalArgumentException if the provider is not supported
     */
    public LLMService getService(String provider) {
        if (provider == null || provider.trim().isEmpty()) {
            throw new IllegalArgumentException("Provider name cannot be null or empty");
        }

        String normalizedProvider = provider.toLowerCase().trim();
        LLMService service = serviceMap.get(normalizedProvider);

        if (service == null) {
            String availableProviders = String.join(", ", serviceMap.keySet());
            throw new IllegalArgumentException(
                String.format("Unsupported provider '%s'. Available providers: %s", 
                    provider, availableProviders)
            );
        }

        log.debug("Retrieved LLM service for provider: {}", normalizedProvider);
        return service;
    }

    /**
     * Gets all available provider names.
     * 
     * @return Set of available provider names
     */
    public java.util.Set<String> getAvailableProviders() {
        return serviceMap.keySet();
    }

    /**
     * Checks if a provider is supported.
     * 
     * @param provider The provider name to check
     * @return true if the provider is supported, false otherwise
     */
    public boolean isProviderSupported(String provider) {
        if (provider == null || provider.trim().isEmpty()) {
            return false;
        }
        return serviceMap.containsKey(provider.toLowerCase().trim());
    }
}
