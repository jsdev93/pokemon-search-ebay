// background.js (MV3 service worker)
// Handles cross-origin fetch to eBay search page for preview snippets on Yahoo pages

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.type !== "peb_fetch_search") return; // ignore
  const { url } = msg;
  if (typeof url !== "string" || !url.startsWith("https://www.ebay.com/")) {
    sendResponse({ ok: false, error: "invalid-url" });
    return true;
  }

  // Check if URL has a valid search query to avoid CORS redirects
  const urlObj = new URL(url);
  const searchQuery = urlObj.searchParams.get("_nkw");
  if (!searchQuery || searchQuery.trim().length < 2) {
    sendResponse({ ok: false, error: "empty-search-query" });
    return true;
  }

  fetch(url, {
    credentials: "omit",
    cache: "no-store",
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Chrome Extension)",
    },
  })
    .then(async (res) => {
      // Check if we got redirected to categories page (indicates empty search)
      if (
        res.url.includes("/allcategories/") ||
        res.url.includes("/categories/")
      ) {
        sendResponse({ ok: false, error: "redirected-to-categories" });
        return;
      }
      const text = await res.text();
      sendResponse({ ok: true, status: res.status, html: text });
    })
    .catch((err) => {
      sendResponse({ ok: false, error: String((err && err.message) || err) });
    });
  return true; // async sendResponse
});
