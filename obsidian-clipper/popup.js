(() => {
  const titleEl = document.getElementById('page-title');
  const folderInput = document.getElementById('folder-input');
  const clipBtn = document.getElementById('clip-btn');
  const statusEl = document.getElementById('status');
  const optionsLink = document.getElementById('options-link');

  let currentTab = null;

  // Open options page
  optionsLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  // Initialize popup
  async function init() {
    // Load saved settings
    const { apiKey, defaultFolder } = await chrome.storage.sync.get(['apiKey', 'defaultFolder']);
    folderInput.value = defaultFolder || 'Clippings';

    // Get active tab info
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;

    if (tab && tab.title) {
      titleEl.textContent = tab.title;
      titleEl.title = tab.title; // full title on hover
    } else {
      titleEl.textContent = '(no title)';
    }

    if (!apiKey) {
      showStatus('warning', 'No API key set. Go to Settings to configure.');
    }

    clipBtn.disabled = false;
  }

  // Handle clip button click
  clipBtn.addEventListener('click', async () => {
    setLoading(true);
    clearStatus();

    try {
      const { apiKey, defaultFolder } = await chrome.storage.sync.get(['apiKey', 'defaultFolder']);

      if (!apiKey) {
        showStatus('error', 'API key not set. Please go to Settings.');
        setLoading(false);
        return;
      }

      const folder = folderInput.value.trim() || defaultFolder || 'Clippings';

      // Extract page content using scripting API
      let pageData;
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          func: extractPageContent,
        });
        pageData = results[0]?.result;
      } catch (err) {
        // Fallback: use tab metadata only (e.g. on chrome:// pages)
        pageData = {
          title: currentTab.title || '',
          url: currentTab.url || '',
          text: '(Content could not be extracted from this page.)',
        };
      }

      if (!pageData) {
        throw new Error('Failed to extract page content.');
      }

      // Send to background service worker
      const response = await chrome.runtime.sendMessage({
        action: 'clip',
        title: pageData.title,
        url: pageData.url,
        text: pageData.text,
        folder,
        apiKey,
      });

      if (response.success) {
        showStatus('success', `Saved to Obsidian!\n${response.folder}/${response.filename}`);
      } else {
        showStatus('error', response.error || 'Unknown error occurred.');
      }
    } catch (err) {
      showStatus('error', err.message || String(err));
    } finally {
      setLoading(false);
    }
  });

  // Injected into page via chrome.scripting.executeScript — must be self-contained
  function extractPageContent() {
    const title = document.title || '';
    const url = window.location.href || '';
    let text = document.body ? document.body.innerText : '';
    text = text.replace(/\n{3,}/g, '\n\n').trim();
    return { title, url, text };
  }

  function setLoading(loading) {
    clipBtn.disabled = loading;
    clipBtn.textContent = loading ? 'Saving…' : 'Save to Obsidian';
  }

  function showStatus(type, message) {
    statusEl.textContent = message;
    statusEl.className = `status status-${type}`;
    statusEl.classList.remove('hidden');
  }

  function clearStatus() {
    statusEl.textContent = '';
    statusEl.className = 'status hidden';
  }

  init().catch((err) => {
    titleEl.textContent = 'Error loading page info';
    console.error(err);
  });
})();
