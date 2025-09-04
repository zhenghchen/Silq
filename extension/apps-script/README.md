# Silq AI - Google Apps Script Integration

This directory contains the Google Apps Script files that enable the Silq AI Chrome extension to interact with Google Docs. The Apps Script acts as a bridge between your Chrome extension and the active Google Doc.

## Files

- **`Code.gs`** - Main server-side script with all the Google Apps Script functions
- **`Sidebar.html`** - HTML interface for the sidebar that appears in Google Docs
- **`appsscript.json`** - Apps Script project configuration and permissions
- **`README.md`** - This setup guide

## Setup Instructions

### 1. Create a New Google Apps Script Project

1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Delete the default `Code.gs` content
4. Copy and paste the contents of `Code.gs` from this directory
5. Create a new HTML file named `Sidebar` (without .html extension)
6. Copy and paste the contents of `Sidebar.html` from this directory
7. Copy the contents of `appsscript.json` to replace the default manifest

### 2. Deploy the Apps Script

1. In the Apps Script editor, click "Deploy" → "New deployment"
2. Choose "Web app" as the type
3. Set the following:
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone with Google account
4. Click "Deploy"
5. Copy the web app URL - you'll need this for your Chrome extension

### 3. Test the Integration

1. Open a Google Doc
2. You should see a "Silq AI" menu in the toolbar
3. Click "Silq AI" → "Start" to open the sidebar
4. Test the "Get Context" button to ensure it can read the document
5. Try selecting some text and using the "Replace Selection" feature

## Key Functions

### `onOpen(e)`
- Standard trigger that runs when a Google Doc is opened
- Creates the "Silq AI" menu in the Google Docs UI

### `getDocumentContext()`
- Extracts the full document text and currently selected text
- Returns an object with document metadata and content
- Called by the sidebar to get context for AI processing

### `replaceCurrentSelection(newText)`
- Replaces selected text while preserving formatting
- Maintains bold, italic, color, font, and other text attributes
- Returns success/failure status with detailed messages

### `insertTextAtCursor(textToInsert)`
- Inserts text at the current cursor position
- Useful for adding new content without replacing existing text

### `getDocumentInfo()`
- Provides document metadata (ID, name, URL, permissions)
- Useful for debugging and context information

## Integration with Chrome Extension

The Chrome extension can communicate with this Apps Script in several ways:

1. **Direct API calls** - Call the web app URL with specific parameters
2. **Google Apps Script API** - Use the official Google Apps Script API
3. **Embedded iframe** - Embed the sidebar directly in your extension

## Security Considerations

- The Apps Script requires OAuth scopes for document access
- Users must authorize the script to access their Google Docs
- The web app is configured to allow access to anyone with a Google account
- Consider implementing user authentication for production use

## Troubleshooting

### Common Issues

1. **"Script not authorized"** - User needs to run the script once to authorize it
2. **"No text selected"** - User must select text before using replace function
3. **"Permission denied"** - Check OAuth scopes in `appsscript.json`

### Debug Mode

- Use `console.log()` statements in the Apps Script code
- Check the Apps Script execution log for errors
- Use the browser's developer tools to debug the sidebar HTML

## Next Steps

1. **Integrate with your backend** - Modify the `processWithAI()` function in `Sidebar.html` to call your Spring Boot backend
2. **Add user authentication** - Implement proper user management
3. **Enhance formatting** - Add more sophisticated text formatting preservation
4. **Add more features** - Implement document-wide search and replace, style suggestions, etc.

## API Integration Example

To integrate with your Spring Boot backend, modify the `processWithAI()` function in `Sidebar.html`:

```javascript
function processWithAI() {
  const userInput = document.getElementById('userInput').value.trim();
  const context = currentContext; // From getDocumentContext()
  
  // Call your backend API
  fetch('http://localhost:8080/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider: 'gemini', // or 'openai'
      prompt: userInput,
      apiKey: 'your-api-key',
      context: context // Include document context
    })
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById('aiResponse').value = data.content;
    currentAIResponse = data.content;
    // Enable buttons
    document.getElementById('insertBtn').disabled = false;
    document.getElementById('copyBtn').disabled = false;
  })
  .catch(error => {
    showStatus('Error calling AI API: ' + error.message, 'error');
  });
}
```

This completes the Google Apps Script integration for your Silq AI Chrome extension!
