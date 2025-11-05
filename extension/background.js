const MAX_HISTORY_ITEMS = 40;

async function saveClipboardEntry(entry) {
  const storage = await chrome.storage.local.get({ history: [] });
  const history = storage.history;

  const filtered = history.filter(
    (item) => item.text !== entry.text || item.url !== entry.url
  );

  filtered.unshift(entry);

  if (filtered.length > MAX_HISTORY_ITEMS) {
    filtered.length = MAX_HISTORY_ITEMS;
  }

  await chrome.storage.local.set({ history: filtered });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== "clipboard-copy") {
    return false;
  }

  const now = Date.now();
  const entry = {
    text: message.payload.text.slice(0, 5000),
    url: message.payload.url,
    title: message.payload.title,
    timestamp: message.payload.timestamp || now,
    capturedAt: now
  };

  return saveClipboardEntry(entry).catch((error) => {
    console.error("Snapshot History: failed to persist clipboard entry", error);
  });
});
