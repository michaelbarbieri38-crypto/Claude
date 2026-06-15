// Content script: extracts page content when requested by popup.js via scripting.executeScript

function extractPageContent() {
  const title = document.title || '';
  const url = window.location.href || '';

  // Get readable text from the body, clean up excess whitespace
  let text = document.body ? document.body.innerText : '';
  // Collapse 3+ newlines into 2, trim leading/trailing whitespace
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  return { title, url, text };
}

// Export for use with chrome.scripting.executeScript
// This makes the function available to be called from popup.js
extractPageContent;
