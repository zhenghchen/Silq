/**
 * Silq AI - Google Apps Script Bridge
 * 
 * This script provides the server-side functionality to bridge between
 * the Chrome extension sidebar and the active Google Doc. It handles
 * document context extraction, text replacement, and sidebar management.
 */

/**
 * Standard trigger function that runs when the Google Doc is opened.
 * Creates a custom menu in the Google Docs UI to launch the Silq AI sidebar.
 * 
 * @param {Object} e - The event object passed by Google Apps Script
 */
function onOpen(e) {
  // Create a custom menu in the Google Docs UI
  DocumentApp.getUi()
    .createMenu('Silq AI')
    .addItem('Start', 'showSidebar')
    .addToUi();
}

/**
 * Opens the Silq AI sidebar in the Google Docs interface.
 * This function is called when the user clicks "Start" in the custom menu.
 */
function showSidebar() {
  // Create and show the sidebar with our HTML content
  const html = HtmlService.createTemplateFromFile('Sidebar')
    .evaluate()
    .setTitle('Silq AI Writing Assistant')
    .setWidth(400);
  
  DocumentApp.getUi().showSidebar(html);
}

/**
 * Utility function to include HTML files in the template.
 * This allows us to include external CSS/JS files in our sidebar HTML.
 * 
 * @param {string} filename - The name of the file to include
 * @return {string} The content of the included file
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Extracts the current document context including full text and selected text.
 * This function is called by the sidebar to get the writing context for AI processing.
 * 
 * @return {Object} An object containing:
 *   - fullText: The complete text content of the document
 *   - selectedText: The currently selected text (empty string if nothing selected)
 *   - cursorPosition: The position of the cursor in the document
 *   - documentId: The unique ID of the current document
 */
function getDocumentContext() {
  try {
    const doc = DocumentApp.getActiveDocument();
    const body = doc.getBody();
    
    // Get the full text of the document
    const fullText = body.getText();
    
    // Get the current selection
    const selection = DocumentApp.getActiveDocument().getSelection();
    let selectedText = '';
    let cursorPosition = 0;
    
    if (selection) {
      const rangeElements = selection.getRangeElements();
      
      if (rangeElements.length > 0) {
        // Get selected text from all selected ranges
        selectedText = rangeElements
          .map(rangeElement => {
            const element = rangeElement.getElement();
            if (element.getType() === DocumentApp.ElementType.TEXT) {
              const textElement = element.asText();
              const startOffset = rangeElement.getStartOffset();
              const endOffset = rangeElement.getEndOffset();
              return textElement.getText().substring(startOffset, endOffset);
            }
            return '';
          })
          .join('');
        
        // Calculate approximate cursor position
        const firstElement = rangeElements[0].getElement();
        if (firstElement.getType() === DocumentApp.ElementType.TEXT) {
          cursorPosition = rangeElements[0].getStartOffset();
        }
      }
    }
    
    return {
      fullText: fullText,
      selectedText: selectedText,
      cursorPosition: cursorPosition,
      documentId: doc.getId(),
      documentName: doc.getName(),
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error getting document context:', error);
    return {
      fullText: '',
      selectedText: '',
      cursorPosition: 0,
      documentId: '',
      documentName: '',
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Replaces the currently selected text with new text while preserving formatting.
 * This function intelligently maintains the original formatting (bold, italics, 
 * color, font, etc.) of the selected text by applying it to the replacement text.
 * 
 * @param {string} newText - The new text to replace the selection with
 * @return {Object} An object containing:
 *   - success: Boolean indicating if the replacement was successful
 *   - message: Descriptive message about the operation
 *   - replacedText: The text that was replaced
 *   - newText: The text that was inserted
 */
function replaceCurrentSelection(newText) {
  try {
    const doc = DocumentApp.getActiveDocument();
    const selection = doc.getSelection();
    
    if (!selection) {
      return {
        success: false,
        message: 'No text selected. Please select some text to replace.',
        replacedText: '',
        newText: newText
      };
    }
    
    const rangeElements = selection.getRangeElements();
    
    if (rangeElements.length === 0) {
      return {
        success: false,
        message: 'No text selected. Please select some text to replace.',
        replacedText: '',
        newText: newText
      };
    }
    
    let totalReplacedText = '';
    let formattingPreserved = false;
    
    // Process each selected range
    rangeElements.forEach((rangeElement, index) => {
      const element = rangeElement.getElement();
      
      if (element.getType() === DocumentApp.ElementType.TEXT) {
        const textElement = element.asText();
        const startOffset = rangeElement.getStartOffset();
        const endOffset = rangeElement.getEndOffset();
        const selectedText = textElement.getText().substring(startOffset, endOffset);
        
        // Store the formatting attributes of the first character
        const firstCharAttributes = {
          bold: textElement.isBold(startOffset),
          italic: textElement.isItalic(startOffset),
          underline: textElement.isUnderline(startOffset),
          strikethrough: textElement.isStrikethrough(startOffset),
          fontFamily: textElement.getFontFamily(startOffset),
          fontSize: textElement.getFontSize(startOffset),
          foregroundColor: textElement.getForegroundColor(startOffset),
          backgroundColor: textElement.getBackgroundColor(startOffset),
          linkUrl: textElement.getLinkUrl(startOffset)
        };
        
        // Delete the selected text
        textElement.deleteText(startOffset, endOffset - 1);
        
        // Insert the new text
        textElement.insertText(startOffset, newText);
        
        // Apply the original formatting to the new text
        const newTextLength = newText.length;
        if (newTextLength > 0) {
          // Apply formatting attributes
          if (firstCharAttributes.bold) {
            textElement.setBold(startOffset, startOffset + newTextLength - 1, true);
          }
          if (firstCharAttributes.italic) {
            textElement.setItalic(startOffset, startOffset + newTextLength - 1, true);
          }
          if (firstCharAttributes.underline) {
            textElement.setUnderline(startOffset, startOffset + newTextLength - 1, true);
          }
          if (firstCharAttributes.strikethrough) {
            textElement.setStrikethrough(startOffset, startOffset + newTextLength - 1, true);
          }
          if (firstCharAttributes.fontFamily) {
            textElement.setFontFamily(startOffset, startOffset + newTextLength - 1, firstCharAttributes.fontFamily);
          }
          if (firstCharAttributes.fontSize) {
            textElement.setFontSize(startOffset, startOffset + newTextLength - 1, firstCharAttributes.fontSize);
          }
          if (firstCharAttributes.foregroundColor) {
            textElement.setForegroundColor(startOffset, startOffset + newTextLength - 1, firstCharAttributes.foregroundColor);
          }
          if (firstCharAttributes.backgroundColor) {
            textElement.setBackgroundColor(startOffset, startOffset + newTextLength - 1, firstCharAttributes.backgroundColor);
          }
          if (firstCharAttributes.linkUrl) {
            textElement.setLinkUrl(startOffset, startOffset + newTextLength - 1, firstCharAttributes.linkUrl);
          }
          
          formattingPreserved = true;
        }
        
        totalReplacedText += selectedText;
      }
    });
    
    return {
      success: true,
      message: `Successfully replaced "${totalReplacedText}" with "${newText}". ${formattingPreserved ? 'Formatting preserved.' : 'No formatting to preserve.'}`,
      replacedText: totalReplacedText,
      newText: newText,
      formattingPreserved: formattingPreserved
    };
    
  } catch (error) {
    console.error('Error replacing selection:', error);
    return {
      success: false,
      message: `Error replacing text: ${error.toString()}`,
      replacedText: '',
      newText: newText,
      error: error.toString()
    };
  }
}

/**
 * Inserts text at the current cursor position without replacing existing text.
 * This is useful for adding new content without affecting the current selection.
 * 
 * @param {string} textToInsert - The text to insert at the cursor position
 * @return {Object} An object containing the result of the insertion
 */
function insertTextAtCursor(textToInsert) {
  try {
    const doc = DocumentApp.getActiveDocument();
    const cursor = doc.getCursor();
    
    if (!cursor) {
      return {
        success: false,
        message: 'No cursor position found. Please click in the document to set a cursor position.',
        insertedText: textToInsert
      };
    }
    
    const element = cursor.getElement();
    
    if (element.getType() === DocumentApp.ElementType.TEXT) {
      const textElement = element.asText();
      const offset = cursor.getOffset();
      
      textElement.insertText(offset, textToInsert);
      
      return {
        success: true,
        message: `Successfully inserted "${textToInsert}" at cursor position.`,
        insertedText: textToInsert
      };
    } else {
      // If cursor is not in a text element, append to the document body
      const body = doc.getBody();
      body.appendParagraph(textToInsert);
      
      return {
        success: true,
        message: `Successfully appended "${textToInsert}" to the document.`,
        insertedText: textToInsert
      };
    }
    
  } catch (error) {
    console.error('Error inserting text:', error);
    return {
      success: false,
      message: `Error inserting text: ${error.toString()}`,
      insertedText: textToInsert,
      error: error.toString()
    };
  }
}

/**
 * Gets information about the current document for debugging and context.
 * This function provides metadata about the document that can be useful
 * for the AI processing and user interface.
 * 
 * @return {Object} Document metadata including ID, name, URL, and other info
 */
function getDocumentInfo() {
  try {
    const doc = DocumentApp.getActiveDocument();
    
    return {
      documentId: doc.getId(),
      documentName: doc.getName(),
      documentUrl: doc.getUrl(),
      lastUpdated: doc.getLastUpdated(),
      editors: doc.getEditors().map(editor => editor.getEmail()),
      viewers: doc.getViewers().map(viewer => viewer.getEmail()),
      isEditable: doc.getAccess() === DocumentApp.Access.EDIT,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error getting document info:', error);
    return {
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}
