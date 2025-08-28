import { useState } from 'react';
import ApiKeyManager from './ApiKeyManager.tsx';

type SettingsSection = 'api-keys' | 'appearance' | 'account';

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('api-keys');

  const navigationItems = [
    { id: 'api-keys' as SettingsSection, label: 'API Keys', icon: '🔑' },
    // Future sections - commented out for MVP
    // { id: 'appearance' as SettingsSection, label: 'Appearance', icon: '🎨' },
    // { id: 'account' as SettingsSection, label: 'Account', icon: '👤' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'api-keys':
        return <ApiKeyManager />;
      // Future cases
      // case 'appearance':
      //   return <AppearanceSettings />;
      // case 'account':
      //   return <AccountSettings />;
      default:
        return <ApiKeyManager />;
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      backgroundColor: '#ffffff',
      color: '#1f2937',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
      fontSize: '14px',
      lineHeight: '1.5'
    }}>
      {/* Left Column - Navigation Sidebar */}
      <div style={{
        width: '220px',
        flexShrink: 0,
        borderRight: '1px solid #e0e0e0',
        backgroundColor: '#f9fafb',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#ffffff'
        }}>
          <h1 style={{
            margin: '0',
            fontSize: '16px',
            fontWeight: '600',
            color: '#111827'
          }}>
            Settings
          </h1>
        </div>

        {/* Navigation Menu */}
        <nav style={{
          padding: '8px',
          flex: '1'
        }}>
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                width: '100%',
                padding: '12px 16px',
                marginBottom: '4px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: activeSection === item.id ? '#7c3aed' : 'transparent',
                color: activeSection === item.id ? '#ffffff' : '#374151',
                fontSize: '14px',
                fontWeight: activeSection === item.id ? '500' : '400',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseOver={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseOut={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Right Column - Content Area */}
      <div style={{
        flex: '1',
        overflowY: 'auto',
        padding: '24px'
      }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default SettingsPage;
