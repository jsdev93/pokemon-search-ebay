// background.js (MV3 service worker)
// Handles cross-origin fetch to eBay search page for preview snippets on Yahoo pages
// Also handles translation requests for Japanese titles

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Handle eBay search fetch requests
  if (msg && msg.type === "peb_fetch_search") {
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
  }

  // Handle translation requests
  if (msg && msg.type === "translate_text") {
    const { text, from, to } = msg;

    if (!text || typeof text !== "string") {
      sendResponse({ translatedText: text });
      return true;
    }

    // Use Google Translate API
    const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from || "ja"}&tl=${to || "en"}&dt=t&q=${encodeURIComponent(text)}`;

    fetch(translateUrl)
      .then(async (res) => {
        const data = await res.json();
        if (data && data[0] && data[0][0] && data[0][0][0]) {
          const translatedText = data[0].map((item) => item[0]).join("");
          sendResponse({ translatedText: translatedText });
        } else {
          sendResponse({ translatedText: text }); // fallback to original
        }
      })
      .catch((err) => {
        console.warn("[Background Translation Error]:", err);
        sendResponse({ translatedText: text }); // fallback to original
      });

    return true; // async sendResponse
  }

  // Ignore other message types
  return false;
});
