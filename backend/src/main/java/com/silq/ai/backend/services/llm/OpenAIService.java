package com.silq.ai.backend.services.llm;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service("openai")
public class OpenAIService implements LLMService {

    private static final Logger log = LoggerFactory.getLogger(OpenAIService.class);
    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    private static final String DEFAULT_MODEL = "gpt-3.5-turbo";

    @Autowired
    private RestTemplate restTemplate;

    @Override
    public String generateResponse(String engineeredPrompt, String userApiKey) {
        // Set headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(userApiKey);

        // Create the request body
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", DEFAULT_MODEL);
        requestBody.put("messages", List.of(
            Map.of("role", "user", "content", engineeredPrompt)
        ));

        // Create the HTTP entity
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            // Make the API call
            log.info("Sending request to OpenAI API");
            ResponseEntity<Map> response = restTemplate.exchange(OPENAI_API_URL, HttpMethod.POST, entity, Map.class);
            log.info("Received successful response from OpenAI API");

            // Extract the content from the response
            return extractContentFromResponse(response);

        } catch (Exception e) {
            log.error("Error calling OpenAI API: {}", e.getMessage());
            throw new RuntimeException("Failed to generate response from OpenAI: " + e.getMessage(), e);
        }
    }

    private String extractContentFromResponse(ResponseEntity<Map> response) {
        try {
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    if (firstChoice.containsKey("message")) {
                        Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                        if (message.containsKey("content")) {
                            return (String) message.get("content");
                        }
                    }
                }
            }
            log.warn("No content found in OpenAI response");
            return "No response content found.";
        } catch (Exception e) {
            log.error("Error parsing OpenAI response: {}", e.getMessage());
            return "Error parsing response.";
        }
    }
}
