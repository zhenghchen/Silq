package com.silq.ai.backend.dto;

/**
 * Data Transfer Object for chat requests from the Chrome extension.
 *
 * This record provides a clean, immutable structure for incoming chat requests
 * containing the user's prompt, preferred AI provider, and their API key.
 */
public record ChatRequest(
    String prompt,
    String provider,
    String apiKey
) {
    /**
     * Validates that all required fields are present and non-empty.
     *
     * @return true if the request is valid, false otherwise
     */
    public boolean isValid() {
        return prompt != null && !prompt.trim().isEmpty() &&
               provider != null && !provider.trim().isEmpty() &&
               apiKey != null && !apiKey.trim().isEmpty();
    }
    
    /**
     * Gets the effective prompt for the AI service.
     * This method can be extended to include prompt engineering logic.
     *
     * @return the processed prompt ready for AI consumption
     */
    public String getEffectivePrompt() {
        return prompt;
    }
}
