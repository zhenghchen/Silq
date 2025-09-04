package com.silq.ai.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuration class for RestTemplate and other HTTP-related beans.
 */
@Configuration
public class RestTemplateConfig {

    /**
     * Provides a RestTemplate bean for making HTTP requests to external APIs.
     * 
     * @return Configured RestTemplate instance
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
