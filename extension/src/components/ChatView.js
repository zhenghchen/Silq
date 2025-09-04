import React, { useState } from 'react';

/**
 * ChatView Component - Primary UI for the suggestion feature
 * 
 * Manages the complete user workflow for AI-powered text suggestions:
 * - User input for commands/prompts
 * - AI suggestion generation
 * - Suggestion display and acceptance/rejection
 * - Loading states and error handling
 */
const ChatView = () => {
  // State management
  const [userInput, setUserInput] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handles the generation of AI suggestions
   * Gets context from Google Docs and calls the backend API
   */
  const handleGenerateSuggestion = async () => {
    if (!userInput.trim()) {
      setError('Please enter a command or prompt');
      return;
    }

    // Set loading state and clear previous data
    setIsLoading(true);
    setError('');
    setSuggestion('');

    try {
      // 1. Get API key and active provider from Chrome storage
      const settings = await chrome.storage.local.get(['apiKeys', 'activeProvider']);
      const activeProvider = settings.activeProvider || 'gemini'; // Default to gemini
      const apiKeys = settings.apiKeys || [];
      const activeApiKey = apiKeys.find(k => k.provider === activeProvider)?.key;

      if (!activeApiKey) {
        throw new Error(`API key for the active provider (${activeProvider}) is not set. Please set it in the settings.`);
      }

      // 2. Get context from Google Docs using the bridge
      const contextData = await new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(error => reject(new Error(`Failed to get document context: ${error.message || error}`)))
          .getDocumentContext();
      });

      // 3. Prepare the payload for the backend API
      // Build a comprehensive prompt that includes context and user command
      let prompt = userInput.trim();
      
      // Add context if available
      if (contextData.fullText || contextData.selectedText) {
        prompt = `Context from document:\n${contextData.fullText || ''}\n\nSelected text: ${contextData.selectedText || ''}\n\nUser request: ${userInput.trim()}`;
      }
      
      const payload = {
        prompt: prompt,
        provider: activeProvider,
        apiKey: activeApiKey
      };

      console.log('Sending payload:', JSON.stringify(payload, null, 2));

      // 4. Call the backend API
      const response = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Backend request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Set the suggestion from the backend response
      if (result.response) {
        setSuggestion(result.response);
      } else {
        throw new Error('No response received from backend');
      }

    } catch (err) {
      // Handle errors from either the bridge call or the fetch
      const errorMessage = err.message || 'Failed to generate suggestion. Please try again.';
      setError(errorMessage);
      console.error('Error generating suggestion:', err);
    } finally {
      // Ensure loading state is always reset
      setIsLoading(false);
    }
  };

  /**
   * Handles accepting the suggestion
   * Uses the bridge to replace text in Google Docs and resets UI state
   */
  const handleAcceptSuggestion = () => {
    if (!suggestion) {
      console.warn('No suggestion to accept');
      return;
    }

    // Use the bridge to replace the current selection with the suggestion
    google.script.run
      .withSuccessHandler(() => {
        console.log('Suggestion accepted and applied to document');
        // Reset UI state after successful replacement
        setSuggestion('');
        setUserInput('');
      })
      .withFailureHandler((error) => {
        console.error('Failed to apply suggestion to document:', error);
        setError('Failed to apply suggestion to document. Please try again.');
      })
      .replaceCurrentSelection(suggestion);
  };

  /**
   * Handles rejecting the suggestion
   * Simply clears the suggestion state
   */
  const handleRejectSuggestion = () => {
    setSuggestion('');
  };

  /**
   * Handles input changes
   */
  const handleInputChange = (e) => {
    setUserInput(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  /**
   * Handles Enter key press in textarea
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        handleGenerateSuggestion();
      }
    }
  };

  return (
    <div style={{
      padding: '20px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '16px'
      }}>
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#111827'
        }}>
          AI Writing Assistant
        </h3>
        <p style={{
          margin: '0',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          Describe what you want to write or improve
        </p>
      </div>

      {/* User Input Section */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Your Command
          </label>
          <textarea
            value={userInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="e.g., 'make this more ominous', 'write a professional email', 'improve this paragraph'"
            disabled={isLoading}
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              backgroundColor: isLoading ? '#f9fafb' : '#ffffff',
              color: isLoading ? '#9ca3af' : '#374151',
              resize: 'vertical',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateSuggestion}
          disabled={isLoading || !userInput.trim()}
          style={{
            padding: '12px 24px',
            backgroundColor: isLoading || !userInput.trim() ? '#f3f4f6' : '#7c3aed',
            color: isLoading || !userInput.trim() ? '#9ca3af' : '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: isLoading || !userInput.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit'
          }}
          onMouseOver={(e) => {
            if (!isLoading && userInput.trim()) {
              e.target.style.backgroundColor = '#6d28d9';
            }
          }}
          onMouseOut={(e) => {
            if (!isLoading && userInput.trim()) {
              e.target.style.backgroundColor = '#7c3aed';
            }
          }}
        >
          {isLoading ? 'Generating...' : 'Generate Suggestion'}
        </button>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#6b7280'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #e5e7eb',
              borderTop: '2px solid #7c3aed',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontSize: '14px' }}>Generating suggestion...</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          color: '#991b1b',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Suggestion Box */}
      {suggestion && (
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #7dd3fc',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <h4 style={{
              margin: '0',
              fontSize: '14px',
              fontWeight: '600',
              color: '#0369a1'
            }}>
              AI Suggestion
            </h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleAcceptSuggestion}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  fontFamily: 'inherit'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
              >
                ✓ Accept
              </button>
              <button
                onClick={handleRejectSuggestion}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  fontFamily: 'inherit'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
              >
                ✗ Reject
              </button>
            </div>
          </div>
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '12px',
            fontSize: '14px',
            lineHeight: '1.5',
            color: '#374151',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {suggestion}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div style={{
        fontSize: '12px',
        color: '#9ca3af',
        textAlign: 'center',
        padding: '12px',
        borderTop: '1px solid #e5e7eb'
      }}>
        Press Enter to generate, Shift+Enter for new line
      </div>

      {/* CSS for spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ChatView;
