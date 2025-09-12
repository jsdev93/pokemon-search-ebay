// content.js
(function() {
  // Only run on eBay item pages
  if (window.location.hostname === "www.ebay.com" && window.location.pathname.startsWith("/itm/")) {
    const title = document.title;
    // Create a floating div to display the title
    const div = document.createElement('div');
    div.textContent = `eBay Title: ${title}`;
    div.style.position = 'fixed';
    div.style.top = '10px';
    div.style.right = '10px';
    div.style.background = 'rgba(0,0,0,0.8)';
    div.style.color = 'white';
    div.style.padding = '10px 20px';
    div.style.borderRadius = '8px';
    div.style.zIndex = 9999;
    div.style.fontSize = '16px';
    div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    document.body.appendChild(div);
  }
})();
