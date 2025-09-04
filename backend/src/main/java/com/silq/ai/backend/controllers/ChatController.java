package com.silq.ai.backend.controllers;

import com.silq.ai.backend.dto.ChatRequest;
import com.silq.ai.backend.dto.ChatResponse;
import com.silq.ai.backend.services.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Public-facing controller for chat functionality.
 * 
 * This controller provides the main API endpoint for the Chrome extension
 * to interact with the AI writing assistant.
 */
@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*") // Allow requests from Chrome extension
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    @Autowired
    private ChatService chatService;

    /**
     * Main chat endpoint for processing writing assistance requests.
     * 
     * This endpoint accepts a ChatRequest from the Chrome extension,
     * processes it through the ChatService with prompt engineering,
     * and returns the AI-generated response.
     * 
     * @param request The chat request containing provider, prompt, and API key
     * @return ChatResponse containing the AI-generated content
     */
    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        try {
            log.info("Received chat request for provider: {}", request.provider());

            // Process the request through the chat service
            String responseContent = chatService.handleChatRequest(request);

            // Create and return the response
            ChatResponse response = ChatResponse.of(responseContent);
            
            log.info("Successfully processed chat request for provider: {}", request.provider());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid chat request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error processing chat request: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Health check endpoint for the chat service.
     * 
     * @return Simple status message
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Chat service is running");
    }
}