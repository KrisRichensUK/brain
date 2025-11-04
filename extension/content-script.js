(function () {
  function handleCopy(event) {
    try {
      const selection = window.getSelection();
      const selectedText = selection ? selection.toString() : "";
      let clipboardText = "";

      if (event && event.clipboardData) {
        clipboardText = event.clipboardData.getData("text/plain");
      }

      const text = (clipboardText || selectedText || "").trim();

      if (!text) {
        return;
      }

      chrome.runtime.sendMessage({
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
})();
