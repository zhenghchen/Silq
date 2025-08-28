import { useState, useRef, useEffect } from 'react';
import SettingsPage from './SettingsPage.tsx';

interface ApiKey {
  id: string;
  provider: 'openai' | 'claude' | 'gemini';
  key: string;
}

// ModelSelector Component
interface ModelSelectorProps {
  savedKeys: ApiKey[];
  activeProvider: string;
  onProviderChange: (provider: string) => void;
}

const ALL_PROVIDERS = ['openai', 'claude', 'gemini'];

const ModelSelector: React.FC<ModelSelectorProps> = ({ savedKeys, activeProvider, onProviderChange }) => {
  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'openai': return 'OpenAI';
      case 'claude': return 'Claude';
      case 'gemini': return 'Gemini';
      default: return provider;
    }
  };

  const hasKeyForProvider = (provider: string) => {
    return savedKeys.some(key => key.provider === provider);
  };

  return (
    <select
      value={activeProvider}
      onChange={(e) => onProviderChange(e.target.value)}
      style={{
        position: 'absolute',
        left: '8px',
        bottom: '8px',
        padding: '4px 8px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '11px',
        fontFamily: 'inherit',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        color: '#374151',
        minWidth: '80px',
        zIndex: 1
      }}
    >
      {ALL_PROVIDERS.map((provider) => {
        const hasKey = hasKeyForProvider(provider);
        return (
          <option
            key={provider}
            value={provider}
            disabled={!hasKey}
            style={{
              color: hasKey ? '#374151' : '#9ca3af'
            }}
          >
            {hasKey ? getProviderName(provider) : `${getProviderName(provider)} (No Key)`}
          </option>
        );
      })}
    </select>
  );
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SidePanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'chat' | 'settings'>('chat');
  const [savedKeys, setSavedKeys] = useState<ApiKey[]>([]);
  const [activeProvider, setActiveProvider] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load API keys from Chrome storage
  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        const result = await chrome.storage.local.get(['apiKeys']);
        if (result.apiKeys) {
          setSavedKeys(result.apiKeys);
          // Set active provider to the first available key
          if (result.apiKeys.length > 0) {
            setActiveProvider(result.apiKeys[0].provider);
          }
        }
      } catch (error) {
        console.error('Error loading API keys:', error);
      }
    };

    loadApiKeys();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // TODO: Replace with actual AI API call
    // For now, simulate a response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'This is a placeholder response. The AI API integration will be added next.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      color: '#1f2937',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
      fontSize: '14px',
      lineHeight: '1.5'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="icons/logo-header.png"
            style={{
              width: '24px',
              height: '24px'
            }}
          />
        </div>
        <button
          onClick={() => setCurrentView(currentView === 'chat' ? 'settings' : 'chat')}
          style={{
            padding: '8px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {currentView === 'chat' ? (
            // Gear/Settings Icon for Chat view
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6b7280"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
          ) : (
            // Back Arrow Icon for Settings view
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6b7280"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Content Area */}
      {currentView === 'chat' ? (
        <>
          {/* Messages Container */}
          <div style={{
            flex: '1',
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
        {messages.length === 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#6b7280',
            textAlign: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src="icons/logo-welcome.png"
                style={{
                  width: '48px',
                  height: '48px'
                }}
              />
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#111827' }}>
                Welcome to Silq AI
              </h3>
              <p style={{ margin: '0', fontSize: '14px' }}>
                Your AI-powered writing assistant
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%'
            }}>
              <div style={{
                backgroundColor: message.role === 'user' ? '#7c3aed' : '#f3f4f6',
                color: message.role === 'user' ? '#ffffff' : '#374151',
                borderRadius: '12px',
                padding: '8px 12px',
                border: message.role === 'user' ? 'none' : '1px solid #e5e7eb'
              }}>
                <div style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: '1.5',
                  fontSize: '14px'
                }}>
                  {message.content}
                </div>
              </div>
              <div style={{
                fontSize: '11px',
                color: '#9ca3af',
                marginTop: '4px',
                textAlign: message.role === 'user' ? 'right' : 'left',
                paddingLeft: message.role === 'user' ? '0' : '4px',
                paddingRight: message.role === 'user' ? '4px' : '0'
              }}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{
              alignSelf: 'flex-start',
              maxWidth: '85%'
            }}>
              <div style={{
                backgroundColor: '#f3f4f6',
                borderRadius: '12px',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid #d1d5db',
                  borderTop: '2px solid #7c3aed',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span style={{ color: '#6b7280', fontSize: '14px' }}>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            position: 'relative',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            transition: 'border-color 0.2s ease'
          }}>
            <ModelSelector
              savedKeys={savedKeys}
              activeProvider={activeProvider}
              onProviderChange={setActiveProvider}
            />
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your writing..."
              disabled={isLoading}
              style={{
                width: '100%',
                minHeight: '44px',
                maxHeight: '120px',
                padding: '12px 16px',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#374151',
                fontSize: '14px',
                lineHeight: '1.5',
                resize: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              style={{
                position: 'absolute',
                right: '8px',
                bottom: '8px',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: inputValue.trim() && !isLoading ? '#7c3aed' : '#f3f4f6',
                color: inputValue.trim() && !isLoading ? 'white' : '#9ca3af',
                cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                transition: 'background-color 0.2s ease'
              }}
            >
              →
            </button>
          </div>
          <div style={{
            fontSize: '11px',
            color: '#9ca3af',
            textAlign: 'center'
          }}>
            Press Enter to send, Shift+Enter for new line
          </div>
        </form>
      </div>
        </>
      ) : (
        <SettingsPage />
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SidePanel;