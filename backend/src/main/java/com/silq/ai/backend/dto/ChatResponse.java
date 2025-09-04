package com.silq.ai.backend.dto;

/**
 * Data Transfer Object for chat responses to the Chrome extension.
 * 
 * This record provides a clean, immutable structure for AI-generated responses
 * that will be sent back to the Chrome extension.
 */
public record ChatResponse(
    String content
) {
    /**
     * Creates a ChatResponse with the provided content.
     * 
     * @param content The AI-generated response content
     * @return A new ChatResponse instance
     */
    public static ChatResponse of(String content) {
        return new ChatResponse(content);
    }
}
