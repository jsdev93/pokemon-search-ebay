// background.js (MV3 service worker)
// Handles cross-origin fetch to eBay search page for preview snippets on Yahoo pages

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.type !== "peb_fetch_search") return; // ignore
  const { url } = msg;
  if (typeof url !== "string" || !url.startsWith("https://www.ebay.com/")) {
    sendResponse({ ok: false, error: "invalid-url" });
    return true;
  }

  fetch(url, { credentials: "omit", cache: "no-store" })
    .then(async (res) => {
      const text = await res.text();
      sendResponse({ ok: true, status: res.status, html: text });
    })
    .catch((err) => {
      sendResponse({ ok: false, error: String((err && err.message) || err) });
    });
  return true; // async sendResponse
});
