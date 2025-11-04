# Snapshot History Chrome Extension

Snapshot History captures the text you copy from websites and keeps a lightweight, browser-integrated clipboard history. Quickly revisit the source page or generate a concise summary of what you copied without leaving the browser.

## Features
- Automatically records copy events from any page you visit.
- Stores the copied text, page title, and timestamp in a searchable history.
- Re-open the original page directly from the popup.
- Generate on-device summaries of copied snippets for quick recall.
- Works entirely locally using Chrome storage—no external services required.

## Getting Started
1. Open **chrome://extensions** in Chrome.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select the `extension` directory in this repository.
4. Pin the "Snapshot History" extension and open it from the toolbar to review your recent copies.

## Development Notes
- Clipboard captures rely on the `copy` event within the active tab. Only text copied while browsing is stored.
- The extension keeps the 40 most recent snippets to avoid unbounded storage usage.
- Summaries are generated locally by selecting the first few sentences of the copied text.
