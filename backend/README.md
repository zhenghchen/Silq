# Silq AI Backend

A stateless MVP backend service for the Silq AI Chrome Extension, built with Spring Boot and Java 17.

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher

## Quick Start

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Build the project:**
   ```bash
   mvn clean compile
   ```

3. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```

4. **Verify the backend is running:**
   ```bash
   curl http://localhost:8080/api/health
   ```

5. **Test the chat API:**
   ```bash
   curl -X POST http://localhost:8080/api/chat \
     -H "Content-Type: application/json" \
     -d '{
       "provider": "openai",
       "prompt": "The quick brown fox jumps over the lazy dog.",
       "apiKey": "your-openai-api-key"
     }'
   ```

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/silq/ai/backend/
│   │   │   ├── SilqAiBackendApplication.java    # Main application class
│   │   │   ├── config/
│   │   │   │   └── RestTemplateConfig.java      # HTTP client configuration
│   │   │   ├── controllers/
│   │   │   │   └── ChatController.java          # Main chat API endpoint
│   │   │   ├── controller/
│   │   │   │   ├── HealthController.java        # Health check endpoint
│   │   │   │   └── LLMController.java           # LLM engine endpoints
│   │   │   ├── dto/
│   │   │   │   ├── ChatRequest.java             # Chat request DTO
│   │   │   │   └── ChatResponse.java            # Chat response DTO
│   │   │   └── services/
│   │   │       ├── ChatService.java             # Chat orchestration service
│   │   │       └── llm/
│   │   │           ├── LLMService.java          # LLM service interface
│   │   │           ├── OpenAIService.java       # OpenAI implementation
│   │   │           ├── GeminiService.java       # Gemini implementation
│   │   │           └── LLMProxyFactory.java     # Provider factory
│   │   └── resources/
│   │       └── application.properties           # Application configuration
├── pom.xml                                      # Maven dependencies
└── README.md                                    # This file
```

## API Endpoints

### Health Check
- **GET** `/api/health` - Returns backend status and version information

### Chat API (Main Endpoint)
- **POST** `/api/chat` - Main chat endpoint for writing assistance
- **GET** `/api/chat/health` - Chat service health check

### Chat Request Format
```json
{
  "provider": "openai",
  "prompt": "Your writing text here",
  "apiKey": "your-api-key-here"
}
```

### Chat Response Format
```json
{
  "content": "AI-generated writing improvement"
}
```

### LLM Engine (Internal)
- **POST** `/api/llm/generate` - Generate AI response using specified provider
- **GET** `/api/llm/providers` - Get list of available LLM providers
- **GET** `/api/llm/providers/{provider}/supported` - Check if provider is supported

### LLM Generate Request Format
```json
{
  "prompt": "Your prompt here",
  "provider": "openai",
  "apiKey": "your-api-key-here"
}
```

### Supported Providers
- **openai** / **gpt** - OpenAI GPT models
- **gemini** / **google** - Google Gemini models

## Configuration

The application runs on port 8080 by default. You can modify this in `src/main/resources/application.properties`.

## Development

This is a stateless MVP backend with minimal dependencies:
- **Spring Web**: For REST API endpoints
- **Lombok**: For clean, boilerplate-free DTOs

## Next Steps

As the project evolves, additional features will be added:
- User authentication and management
- AI service integration
- Chat session management
- Usage tracking
- Subscription management
