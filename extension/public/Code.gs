/**
 * This function runs automatically when the user opens a document.
 * It creates the custom menu for our Add-on.
 */
function onOpen() {
  DocumentApp.getUi()
    .createAddOnMenu() // Use createAddOnMenu() for best practice
    .addItem('Start Assistant', 'showSidebar')
    .addToUi();
}

/**
 * This function is called by the "homepageTrigger" in our appsscript.json.
 * It creates and displays the HTML for our React sidebar.
 */
function showSidebar() {
  // The HTML filename must EXACTLY match the output from Vite.
  // Your build output showed "sidepanel.html", so we use "sidepanel".
  const html = HtmlService.createHtmlOutputFromFile('sidepanel')
      .setTitle('Silq AI Assistant');
  DocumentApp.getUi().showSidebar(html);
}

/**
 * A placeholder for our future AI function. This is what our
 * React app will call to get the selected text from the document.
 */
function getSelectedText() {
  // We will fill this in next.
  return "This function is ready!";
}