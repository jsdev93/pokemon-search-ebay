# Raw Pokemon Card Search for eBay

## Description

Displays an iframe on a selected product that automatically searches for raw Pokemon cards on eBay based on the current item's title.

## Features

- Automatically activates on eBay item pages (`www.ebay.com/itm/*`)
- Parses the product title to construct a search for raw Pokemon cards
- Sidebar with grading checkboxes (PSA, BGS, CGC, TAG, Fuzzy)
- Grade select dropdown (with 9&10 option)
- Toggle to show/hide the panel
- Modern, glassmorphic UI
- Persistent settings via localStorage

## Installation

1. Clone or download this repository.
2. In Chrome, go to `chrome://extensions/` and enable Developer mode.
3. Click "Load unpacked" and select the `ebay-9-10-extension` folder.

## Usage

- Visit any eBay item page (e.g., `https://www.ebay.com/itm/1234567890`).
- The extension will display a sidebar and iframe with search results for raw Pokemon cards matching the product title.
- Use the sidebar to filter by grading company or grade, or enable fuzzy search.

## Development

- Main logic: `scripts/content.js`
- Manifest: `manifest.json`
- Icons: `assets/`
- Popup: `pages/popup.html`

## License

MIT
