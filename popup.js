// popup.js
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  const tab = tabs[0];
  if (tab && tab.url && tab.url.startsWith('https://www.ebay.com/itm/')) {
    document.getElementById('title').textContent = tab.title;
  } else {
    document.getElementById('title').textContent = 'Go to an eBay item page to see the title.';
  }
});
