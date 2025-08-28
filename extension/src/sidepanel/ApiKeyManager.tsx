import { useState, useEffect } from 'react';

interface ApiKey {
  id: string;
  provider: 'openai' | 'claude' | 'gemini';
  key: string;
}

const ApiKeyManager: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'claude' | 'gemini'>('openai');
  const [isLoading, setIsLoading] = useState(true);

  // Load API keys from Chrome storage on component mount
  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        const result = await chrome.storage.local.get(['apiKeys']);
        if (result.apiKeys) {
          setApiKeys(result.apiKeys);
        }
      } catch (error) {
        console.error('Error loading API keys:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApiKeys();
  }, []);



  // Add new API key
  const addApiKey = async () => {
    if (!newKey.trim()) return;

    const newApiKey: ApiKey = {
      id: Date.now().toString(),
      provider: selectedProvider,
      key: newKey.trim()
    };

    const updatedKeys = [...apiKeys, newApiKey];
    setApiKeys(updatedKeys);
    setNewKey('');
    setSelectedProvider('openai');

    // Auto-save to storage
    try {
      await chrome.storage.local.set({ apiKeys: updatedKeys });
    } catch (error) {
      console.error('Error saving API key:', error);
    }
  };

  // Delete API key
  const deleteApiKey = async (id: string) => {
    const updatedKeys = apiKeys.filter(key => key.id !== id);
    setApiKeys(updatedKeys);

    // Auto-save to storage
    try {
      await chrome.storage.local.set({ apiKeys: updatedKeys });
    } catch (error) {
      console.error('Error deleting API key:', error);
    }
  };

  // Get provider display name
  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'openai': return 'OpenAI';
      case 'claude': return 'Claude';
      case 'gemini': return 'Gemini';
      default: return provider;
    }
  };

  // Get provider icon (removed emojis for cleaner look)
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return 'O';
      case 'claude': return 'C';
      case 'gemini': return 'G';
      default: return '?';
    }
  };

  // Get provider color
  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai': return '#10a37f';
      case 'claude': return '#d97706';
      case 'gemini': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  // Mask API key for display
  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return `${key.substring(0, 4)}••••••••${key.substring(key.length - 4)}`;
  };

  // ApiKeyListItem Component
  const ApiKeyListItem: React.FC<{ apiKey: ApiKey; onDelete: (id: string) => void }> = ({ apiKey, onDelete }) => (
    <div style={{
      padding: '16px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          backgroundColor: getProviderColor(apiKey.provider),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: '600',
          color: '#ffffff'
        }}>
          {getProviderIcon(apiKey.provider)}
        </div>
        <div>
          <h4 style={{
            margin: '0',
            fontSize: '14px',
            fontWeight: '600',
            color: '#111827'
          }}>
            {getProviderName(apiKey.provider)}
          </h4>
          <p style={{
            margin: '0',
            fontSize: '12px',
            color: '#6b7280',
            fontFamily: 'monospace'
          }}>
            {maskApiKey(apiKey.key)}
          </p>
        </div>
      </div>
      <button
        onClick={() => onDelete(apiKey.id)}
        style={{
          padding: '6px 12px',
          border: '1px solid #ef4444',
          borderRadius: '6px',
          backgroundColor: '#ffffff',
          color: '#ef4444',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#ef4444';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.color = '#ef4444';
        }}
      >
        Delete
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px'
      }}>
        <div style={{
          width: '20px',
          height: '20px',
          border: '2px solid #e5e7eb',
          borderTop: '2px solid #7c3aed',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div>
      <h2 style={{
        margin: '0 0 24px 0',
        fontSize: '20px',
        fontWeight: '600',
        color: '#111827'
      }}>
        API Key Management
      </h2>

      {/* Add New Key Form */}
      <div style={{
        marginBottom: '32px',
        padding: '20px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: '#f9fafb'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#111827'
        }}>
          Add New API Key
        </h3>
        
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end'
        }}>
          <div style={{ flex: '0 0 120px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '12px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Provider
            </label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value as 'openai' | 'claude' | 'gemini')}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="openai">OpenAI</option>
              <option value="claude">Claude</option>
              <option value="gemini">Gemini</option>
            </select>
          </div>
          
          <div style={{ flex: '1', minWidth: '0' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '12px',
              fontWeight: '500',
              color: '#374151'
            }}>
              API Key
            </label>
            <input
              type="password"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Paste your API key here"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                backgroundColor: '#ffffff',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <button
            onClick={addApiKey}
            disabled={!newKey.trim()}
            style={{
              padding: '8px 16px',
              backgroundColor: newKey.trim() ? '#7c3aed' : '#f3f4f6',
              color: newKey.trim() ? '#ffffff' : '#9ca3af',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: newKey.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease'
            }}
          >
            Save Key
          </button>
        </div>
      </div>

      {/* Active API Keys List */}
      <div>
        <h2 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#111827'
        }}>
          API Keys
        </h2>
        
        {apiKeys.length === 0 ? (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: '#6b7280',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}>
            <p style={{ margin: '0', fontSize: '14px' }}>
              You have no saved API keys.
            </p>
          </div>
        ) : (
          <div>
            {apiKeys.map((apiKey) => (
              <ApiKeyListItem
                key={apiKey.id}
                apiKey={apiKey}
                onDelete={deleteApiKey}
              />
            ))}
          </div>
        )}
      </div>



      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ApiKeyManager;
