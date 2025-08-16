const Popup: React.FC = () => {
  const handleOpenSidebar = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      await chrome.sidePanel.open({ tabId: tab.id });
      window.close(); // Close popup after opening side panel
    }
  };

  return (
    <div style={{ 
      width: '300px', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h2 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '18px' }}>
        Silq AI
      </h2>
      <button
        onClick={handleOpenSidebar}
        style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: '#4F46E5',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          fontFamily: 'inherit'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338CA'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4F46E5'}
      >
        Open Sidebar
      </button>
    </div>
  );
};

export default Popup;
