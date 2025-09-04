package com.silq.ai.backend.services;

import com.silq.ai.backend.dto.ChatRequest;
import com.silq.ai.backend.services.llm.LLMProxyFactory;
import com.silq.ai.backend.services.llm.LLMService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    @Autowired
    private LLMProxyFactory llmProxyFactory;

    public String handleChatRequest(ChatRequest request) {
        if (!request.isValid()) {
            throw new IllegalArgumentException("Invalid chat request: required fields are missing");
        }

        try {
            log.info("Processing chat request for provider: {}", request.provider());

            // Apply prompt engineering to enhance the user's request
            String engineeredPrompt = applyPromptEngineering(request.getEffectivePrompt());
            log.debug("Applied prompt engineering to user request");

            // Get the appropriate LLM service
            LLMService llmService = llmProxyFactory.getService(request.provider());
            log.debug("Retrieved LLM service for provider: {}", request.provider());

            // Generate response using the engineered prompt
            String response = llmService.generateResponse(engineeredPrompt, request.apiKey());
            log.info("Successfully generated response for provider: {}", request.provider());

            return response;

        } catch (IllegalArgumentException e) {
            log.warn("Invalid request or provider: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error processing chat request: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process chat request: " + e.getMessage(), e);
        }
    }

    /**
     * Applies prompt engineering to enhance the user's request.
     * This method can be extended to include more sophisticated prompt engineering logic.
     *
     * @param originalPrompt the user's original prompt
     * @return the enhanced prompt ready for AI consumption
     */
    private String applyPromptEngineering(String originalPrompt) {
        // For now, return the original prompt with basic enhancement
        // This can be extended to include context, examples, or specific instructions
        return "You are a helpful writing assistant. Please help with the following request:\n\n" + originalPrompt;
    }
}
