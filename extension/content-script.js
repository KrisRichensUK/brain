(function () {
  function getTextFromClipboardEvent(event) {
    if (!event || !event.clipboardData) {
      return "";
    }

    try {
      return event.clipboardData.getData("text/plain") || "";
    } catch (error) {
      return "";
    }
  }

  function getSelectionText() {
    const selection = window.getSelection();
    if (selection) {
      const text = selection.toString();
      if (text) {
        return text;
      }
    }

    const activeElement = document.activeElement;
    if (!activeElement) {
      return "";
    }

    const isInput =
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement;

    if (isInput) {
      const { selectionStart, selectionEnd, value = "" } = activeElement;
      if (
        typeof selectionStart === "number" &&
        typeof selectionEnd === "number" &&
        selectionEnd > selectionStart
      ) {
        return value.slice(selectionStart, selectionEnd);
      }

      return value;
    }

    if (activeElement.isContentEditable) {
      return activeElement.textContent || "";
    }

    return "";
  }

  async function handleCopy(event) {
    try {
      const text = (getTextFromClipboardEvent(event) || getSelectionText() || "").trim();

      if (!text) {
        return;
      }

      await chrome.runtime.sendMessage({
        type: "clipboard-copy",
        payload: {
          text,
          url: window.location.href,
          title: document.title,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error("Snapshot History: failed to capture copy event", error);
    }
  }

  document.addEventListener("copy", handleCopy, true);
  document.addEventListener("cut", handleCopy, true);
})();
