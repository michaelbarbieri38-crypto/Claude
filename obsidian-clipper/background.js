// Background service worker: handles messages from popup and calls Obsidian REST API

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'clip') {
    handleClip(message).then(sendResponse).catch((err) => {
      sendResponse({ success: false, error: err.message || String(err) });
    });
    return true; // Keep the message channel open for async response
  }
});

async function handleClip({ title, url, text, folder, apiKey }) {
  if (!apiKey) {
    throw new Error('No API key set. Please configure it in the extension options.');
  }

  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const filename = sanitizeFilename(title || 'Untitled') + '.md';
  const safeFolder = (folder || 'Clippings').replace(/^\/|\/$/g, ''); // strip leading/trailing slashes

  const noteContent = buildNote({ title, url, date, text });

  const apiUrl = `http://localhost:27123/vault/${encodeURIComponent(safeFolder)}/${encodeURIComponent(filename)}`;

  let response;
  try {
    response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'text/markdown',
      },
      body: noteContent,
    });
  } catch (networkErr) {
    throw new Error(
      'Could not connect to Obsidian. Make sure Obsidian is open and the Local REST API plugin is running on port 27123.'
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Obsidian API error ${response.status}: ${body || response.statusText}`);
  }

  return { success: true, filename, folder: safeFolder };
}

function sanitizeFilename(title) {
  return title
    .replace(/[\\/:*?"<>|]/g, '-') // Windows-unsafe chars
    .replace(/[\x00-\x1f\x7f]/g, '') // control chars
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/ /g, '-')
    .replace(/-{2,}/g, '-')
    .slice(0, 200); // max length
}

function buildNote({ title, url, date, text }) {
  const escapedTitle = title.replace(/"/g, '\\"');
  return `---
title: "${escapedTitle}"
url: ${url}
date: ${date}
tags: [clipped]
---

# ${title}

> Source: ${url}
> Clipped: ${date}

${text}
`;
}
