# eBay 9-10 Extension

A lightweight helper for eBay item pages that opens a side panel with sold/complete comps, auto-generating the search from the item title.

## Features

- Auto search parsing: Pokémon/Trainer names, keywords, set codes, and numbers.
- EN/OP code precedence with “manga” suffix when present.
- Checkboxes for labels (PSA, BGS, CGC, TAG) and a grade selector with eBay-compatible mapping.
- Toggle button to show/hide the panel; state persisted via localStorage.
- Responsive UI; minimal iframe styling and auto-scroll.

## Behavior details

- Title parsing prefers:
  1. EN codes: e.g., ABC-EN123
  2. OP codes: e.g., OP09-004 (adds “manga” if title contains “manga”)
  3. Otherwise: Pokémon/Trainer + keywords + codes + a 2–3 digit number if unique
- Example: “Shanks (004) (Manga) OP09-004 …” yields search “OP09-004 manga” (not “004”).
- Fuzzy checkbox: strips “/…” from the base search (helps broaden results).
- Grade param: maps 9/10, 6/7, 4/5, 1/2/3; “Any” sends no grade filter.

## Installation (Chrome/Edge)

1. Open `chrome://extensions` (or `edge://extensions`).
2. Enable Developer mode.
3. Load unpacked → select this folder.

## Usage

- Navigate to an eBay item page (`www.ebay.com/itm/…`).
- Click “Show Panel” (bottom-right).
- Adjust checkboxes and grade; the iframe refreshes automatically.

## Persistence

- `localStorage` keys:
  - `ebayGradingCheckboxes`
  - `ebayGradeSelect`
  - `ebayPanelVisible`

## Performance

- Lazy, per-tab shared cache (Maps) capped at 100 entries per type with simple eviction.
- Memory footprint is small per tab; caches trim when the tab is hidden.

## Troubleshooting

- Panel appears only on `www.ebay.com` item pages.
- If the panel doesn’t show, refresh and click “Show Panel”.
- Some parsing relies on optional `window.pokemonList`/`window.trainerList`; absent lists are skipped.

## Notes

- OP codes supported: OP01–OP13; also ST13, EB01, EB02.
- Category filter: `_dcat=183454`, sold & completed, 60 items per page.
