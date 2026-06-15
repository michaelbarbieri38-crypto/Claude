(() => {
  const apiKeyInput = document.getElementById('api-key');
  const defaultFolderInput = document.getElementById('default-folder');
  const saveBtn = document.getElementById('save-btn');
  const statusEl = document.getElementById('status');

  // Load existing settings
  async function init() {
    const { apiKey, defaultFolder } = await chrome.storage.sync.get(['apiKey', 'defaultFolder']);
    if (apiKey) apiKeyInput.value = apiKey;
    if (defaultFolder) defaultFolderInput.value = defaultFolder;
  }

  // Save settings
  saveBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const defaultFolder = defaultFolderInput.value.trim() || 'Clippings';

    saveBtn.disabled = true;
    clearStatus();

    try {
      await chrome.storage.sync.set({ apiKey, defaultFolder });
      showStatus('success', 'Settings saved!');
    } catch (err) {
      showStatus('error', 'Failed to save settings: ' + (err.message || String(err)));
    } finally {
      saveBtn.disabled = false;
    }
  });

  // Allow saving with Enter key in either field
  [apiKeyInput, defaultFolderInput].forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveBtn.click();
    });
  });

  function showStatus(type, message) {
    statusEl.textContent = message;
    statusEl.className = `status status-${type}`;
    statusEl.classList.remove('hidden');
    setTimeout(clearStatus, 3000);
  }

  function clearStatus() {
    statusEl.textContent = '';
    statusEl.className = 'status hidden';
  }

  init().catch(console.error);
})();
