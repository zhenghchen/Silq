// Background service worker
console.log('Silq AI background script loaded');

// Configure side panel behavior to open on action click
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
