const historyList = document.getElementById("history");
const emptyState = document.getElementById("empty-state");
const template = document.getElementById("history-item-template");
const refreshButton = document.getElementById("refresh");

refreshButton.addEventListener("click", loadHistory);

document.addEventListener("DOMContentLoaded", loadHistory);

async function loadHistory() {
  const { history = [] } = await chrome.storage.local.get({ history: [] });
  renderHistory(history);
}

function renderHistory(items) {
  historyList.innerHTML = "";

  if (!items.length) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  items.forEach((item) => {
    const node = template.content.firstElementChild.cloneNode(true);
    const sourceEl = node.querySelector(".history-item__source");
    const timeEl = node.querySelector(".history-item__time");
    const textEl = node.querySelector(".history-item__text");
    const linkEl = node.querySelector(".history-item__link");
    const summarizeButton = node.querySelector(".history-item__summarize");
    const summaryEl = node.querySelector(".history-item__summary");

    sourceEl.textContent = formatSource(item);
    timeEl.textContent = formatRelativeTime(item.timestamp || item.capturedAt);
    textEl.textContent = truncate(item.text, 300);
    linkEl.href = item.url;

    summarizeButton.addEventListener("click", () => {
      if (!summaryEl.dataset.generated) {
        summaryEl.textContent = summarize(item.text);
        summaryEl.dataset.generated = "true";
      }

      summaryEl.hidden = !summaryEl.hidden;
      summarizeButton.textContent = summaryEl.hidden ? "Summarize" : "Hide summary";
    });

    historyList.appendChild(node);
  });
}

function formatSource(item) {
  if (item.title) {
    return item.title;
  }

  try {
    const url = new URL(item.url);
    return url.hostname;
  } catch (error) {
    return item.url || "Unknown source";
  }
}

function formatRelativeTime(timestamp) {
  if (!timestamp) {
    return "Unknown time";
  }

  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSeconds = Math.round(diffMs / 1000);

  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }

  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  const diffWeeks = Math.round(diffDays / 7);
  if (diffWeeks < 4) {
    return `${diffWeeks}w ago`;
  }

  const diffMonths = Math.round(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths}mo ago`;
  }

  const diffYears = Math.round(diffDays / 365);
  return `${diffYears}y ago`;
}

function truncate(text, limit) {
  if (!text || text.length <= limit) {
    return text;
  }

  return `${text.slice(0, limit - 1)}…`;
}

function summarize(text) {
  const cleaned = text.replace(/\s+/g, " ").trim();

  if (!cleaned) {
    return "Nothing to summarize.";
  }

  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => sentence.length > 0);

  if (sentences.length === 0) {
    return truncate(cleaned, 200);
  }

  const summary = sentences.slice(0, 2).join(" ");
  return truncate(summary, 300);
}
