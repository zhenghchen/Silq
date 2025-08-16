# Chrome Extension Writing Assistant - Project Scope

## Project Overview
A Chrome extension that provides AI-powered writing assistance through a sidebar interface. Users can get writing suggestions, edits, and content generation based on their current writing context.

## Core Features

### 1. Chrome Extension Architecture
- **Sidebar Interface**: Resizable sidebar (400px default, 300-600px range) positioned on the right side
- **Context Detection**: Captures 2-3 paragraphs around cursor when user prompts (not real-time)
- **Platform Support**: Textboxes (textarea, input[type=text], contenteditable) and Google Docs
- **Hotkey Support**: Ctrl+Shift+W to toggle sidebar
- **Preview Panel**: Shows AI suggestions before insertion with Insert/Replace options

### 2. User Authentication & Management
- **Required Account Creation**: All users must create accounts to store API keys and settings
- **Profile Management**: Store user preferences, API keys, and subscription status
- **Session Management**: JWT-based authentication with secure token storage

### 3. AI Integration Strategy
- **Free Tier**: Users provide their own API key (OpenAI, Anthropic, Google AI)
- **Paid Tier**: Managed AI service with GPT-4, DeepSeek, and Gemini
- **Context Processing**: Only captures context when user makes a request to reduce token costs

## Technical Architecture

### Frontend (Chrome Extension)
```
extension/
├── manifest.json
├── src/
│   ├── components/
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx              # Main sidebar container
│   │   │   ├── ChatInterface.tsx        # Chat UI with AI
│   │   │   ├── PreviewPanel.tsx         # AI suggestions preview
│   │   │   ├── ContextDisplay.tsx       # Shows captured context
│   │   │   └── ResizeHandle.tsx         # Sidebar resize functionality
│   │   ├── Popup/
│   │   │   ├── Popup.tsx                # Extension popup
│   │   │   ├── Settings.tsx             # User settings
│   │   │   └── Auth.tsx                 # Login/Register forms
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Loading.tsx
│   │       └── Modal.tsx
│   ├── content-script/
│   │   ├── contentScript.ts             # Main content script
│   │   ├── contextDetector.ts           # Context capture logic
│   │   ├── textInserter.ts              # Text insertion functionality
│   │   └── platformHandlers/
│   │       ├── googleDocs.ts            # Google Docs specific handling
│   │       └── textboxHandler.ts        # Standard text input handling
│   ├── background/
│   │   ├── background.ts                # Extension background script
│   │   ├── hotkeyManager.ts             # Hotkey handling
│   │   └── storage.ts                   # Local storage management
│   ├── services/
│   │   ├── aiService.ts                 # AI API integration
│   │   ├── apiService.ts                # Backend API calls
│   │   ├── authService.ts               # Authentication logic
│   │   └── storageService.ts            # Chrome storage wrapper
│   ├── types/
│   │   └── index.ts                     # TypeScript type definitions
│   └── utils/
│       ├── contextUtils.ts              # Context processing utilities
│       └── textUtils.ts                 # Text manipulation helpers
├── public/
│   ├── icons/
│   │   ├── icon16.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   └── index.html
└── dist/
```

### Backend (Spring Boot)
```
backend/
├── src/main/java/com/writingassistant/
│   ├── controller/
│   │   ├── AuthController.java          # Login, register, logout
│   │   ├── ChatController.java          # Chat history and sessions
│   │   ├── SubscriptionController.java  # Stripe integration
│   │   ├── UserController.java          # Profile management
│   │   └── UsageController.java         # Usage tracking
│   ├── service/
│   │   ├── AIService.java               # AI provider management
│   │   ├── UserService.java             # User business logic
│   │   ├── SubscriptionService.java     # Subscription management
│   │   ├── UsageService.java            # Usage tracking logic
│   │   └── EncryptionService.java       # API key encryption
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── ChatSessionRepository.java
│   │   ├── ChatMessageRepository.java
│   │   ├── SubscriptionRepository.java
│   │   └── UsageLogRepository.java
│   ├── model/
│   │   ├── User.java
│   │   ├── ChatSession.java
│   │   ├── ChatMessage.java
│   │   ├── Subscription.java
│   │   └── UsageLog.java
│   ├── config/
│   │   ├── SecurityConfig.java          # JWT and CORS configuration
│   │   ├── StripeConfig.java            # Stripe integration
│   │   ├── AIConfig.java                # AI provider configuration
│   │   └── DatabaseConfig.java          # PostgreSQL configuration
│   ├── dto/
│   │   ├── AuthRequest.java
│   │   ├── AuthResponse.java
│   │   ├── ChatRequest.java
│   │   ├── ChatResponse.java
│   │   └── UserProfileDto.java
│   └── exception/
│       ├── GlobalExceptionHandler.java
│       └── CustomExceptions.java
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/                    # Flyway migrations
└── pom.xml
```

## Database Schema (PostgreSQL)

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    api_key_encrypted TEXT,               -- For free tier users
    subscription_status VARCHAR(50) DEFAULT 'free',
    subscription_plan VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User settings
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sidebar_position VARCHAR(10) DEFAULT 'right',
    sidebar_width INTEGER DEFAULT 400,
    preferred_ai_provider VARCHAR(50),
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat sessions
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    platform VARCHAR(100),                -- 'google_docs', 'textbox', etc.
    url TEXT,                             -- Page URL where session was created
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,            -- 'user' or 'assistant'
    content TEXT NOT NULL,
    context TEXT,                         -- Captured context from page
    tokens_used INTEGER,
    ai_provider VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    plan_type VARCHAR(50),                -- 'basic', 'pro', 'enterprise'
    status VARCHAR(50),                   -- 'active', 'canceled', 'past_due'
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    tokens_used INTEGER,
    ai_provider VARCHAR(50),
    cost DECIMAL(10,4),
    request_type VARCHAR(50),             -- 'free_tier', 'paid_tier'
    created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

### User Management
```
GET  /api/user/profile
PUT  /api/user/profile
PUT  /api/user/api-key
GET  /api/user/settings
PUT  /api/user/settings
```

### Chat & AI
```
POST /api/chat/send
GET  /api/chat/sessions
GET  /api/chat/sessions/{id}/messages
DELETE /api/chat/sessions/{id}
```

### Subscription
```
POST /api/subscription/create
POST /api/subscription/cancel
POST /api/subscription/webhook
GET  /api/subscription/status
```

### Usage
```
GET  /api/usage/stats
GET  /api/usage/history
```

## Development Phases

### Phase 1: Foundation (Weeks 1-3)
- [ ] Chrome extension basic setup with React + TypeScript
- [ ] Sidebar UI with basic chat interface
- [ ] Context detection for textboxes and Google Docs
- [ ] Basic text insertion functionality
- [ ] Spring Boot backend setup
- [ ] User authentication (register/login)
- [ ] Database schema implementation

### Phase 2: Core Features (Weeks 4-6)
- [ ] AI integration (OpenAI for free tier)
- [ ] Preview panel with edit capabilities
- [ ] Resizable sidebar with position settings
- [ ] Hotkey support (Ctrl+Shift+W)
- [ ] Chat history and session management
- [ ] User settings and profile management
- [ ] API key encryption and storage

### Phase 3: Advanced Features (Weeks 7-9)
- [ ] Multi-AI provider support (GPT-4, DeepSeek, Gemini)
- [ ] Platform-specific optimizations
- [ ] Usage tracking and analytics
- [ ] Error handling and user feedback
- [ ] Performance optimization

### Phase 4: Monetization & Polish (Weeks 10-12)
- [ ] Stripe integration for paid subscriptions
- [ ] Subscription management and billing
- [ ] Usage limits and tier restrictions
- [ ] UI/UX improvements
- [ ] Testing and bug fixes
- [ ] Production deployment

## Technical Specifications

### Context Detection Logic
```typescript
interface ContextCapture {
  text: string;           // 2-3 paragraphs around cursor
  cursorPosition: number; // Position in the text
  elementType: string;    // 'textarea', 'input', 'contenteditable', 'google_docs'
  platform: string;       // 'google_docs', 'textbox', etc.
  url: string;           // Current page URL
}
```

### AI Request Structure
```typescript
interface AIRequest {
  context: ContextCapture;
  userPrompt: string;
  userId: string;
  sessionId?: string;
  aiProvider: string;     // 'openai', 'anthropic', 'google', 'managed'
}
```

### Security Requirements
- API keys encrypted using AES-256-GCM
- JWT tokens with 24-hour expiration
- HTTPS for all communications
- Rate limiting: 100 requests/hour for free tier, 1000/hour for paid
- Input sanitization and XSS prevention
- CORS configuration for Chrome extension

### Performance Requirements
- Sidebar open/close: < 200ms
- Context capture: < 100ms
- AI response: < 5 seconds
- Text insertion: < 50ms

## AWS Infrastructure

### Services
- **EC2** (t3.medium): Spring Boot application
- **RDS** (PostgreSQL): Database
- **Elastic Beanstalk**: Deployment and scaling
- **CloudFront**: Static assets and caching
- **Route 53**: Domain management
- **S3**: File storage (if needed)

### Estimated Monthly Costs
- EC2: $30-50/month
- RDS: $15-25/month
- CloudFront: $5-10/month
- Other services: $10-20/month
- **Total: ~$60-105/month**

## Success Metrics
- User registration conversion: > 20%
- Free to paid conversion: > 5%
- User retention (30 days): > 40%
- Average response time: < 3 seconds
- User satisfaction score: > 4.0/5.0

## Risk Mitigation
- **AI API Rate Limits**: Implement fallback providers
- **Context Detection Failures**: Graceful degradation with user feedback
- **Performance Issues**: Lazy loading and caching strategies
- **Security Breaches**: Regular security audits and encryption
- **User Adoption**: Beta testing with target users

## Future Enhancements
- Support for more platforms (Notion, Medium, etc.)
- Advanced AI features (tone adjustment, style matching)
- Team collaboration features
- Mobile app companion
- API for third-party integrations
