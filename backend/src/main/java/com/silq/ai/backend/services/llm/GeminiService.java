package com.silq.ai.backend.services.llm;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service("gemini")
public class GeminiService implements LLMService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    @Autowired
    private RestTemplate restTemplate;

    @Override
    public String generateResponse(String engineeredPrompt, String userApiKey) {
        // Build the request URL with the API key
        String url = UriComponentsBuilder.fromHttpUrl(GEMINI_API_URL)
                .queryParam("key", userApiKey)
                .toUriString();

        // Set headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Create the request body for Gemini
        Map<String, Object> part = Collections.singletonMap("text", engineeredPrompt);
        Map<String, Object> content = Collections.singletonMap("parts", Collections.singletonList(part));
        Map<String, Object> requestBody = Collections.singletonMap("contents", Collections.singletonList(content));

        // Create the HTTP entity
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            // Make the API call
            log.info("Sending request to Gemini API");
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            log.info("Received successful response from Gemini API");

            // Extract the content from the response
            return extractContentFromResponse(response);

        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage());
            throw new RuntimeException("Failed to generate response from Gemini: " + e.getMessage(), e);
        }
    }

    private String extractContentFromResponse(ResponseEntity<Map> response) {
        try {
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("candidates")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> firstCandidate = candidates.get(0);
                    if (firstCandidate.containsKey("content")) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
                        if (content.containsKey("parts")) {
                            @SuppressWarnings("unchecked")
                            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                            if (!parts.isEmpty()) {
                                return (String) parts.get(0).get("text");
                            }
                        }
                    }
                }
            }
            log.warn("No content found in Gemini response");
            return "No response content found.";
        } catch (Exception e) {
            log.error("Error parsing Gemini response: {}", e.getMessage());
            return "Error parsing response.";
        }
    }
}
