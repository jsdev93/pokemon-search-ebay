(function () {
  // Memory-optimized page detection - cache results
  let _isEbayPage = null;
  let _isYahooPage = null;

  const isEbayItemPage = () => {
    if (_isEbayPage === null) {
      _isEbayPage =
        window.location.hostname === "www.ebay.com" &&
        window.location.pathname.startsWith("/itm/");
    }
    return _isEbayPage;
  };

  const isYahooAuctionPage = () => {
    if (_isYahooPage === null) {
      _isYahooPage =
        window.location.hostname === "buyee.jp" &&
        window.location.pathname.startsWith("/item/jdirectitems/auction/");
    }
    return _isYahooPage;
  };

  // Memory-optimized title extraction with early exit
  const getPageTitle = async () => {
    // Only log in debug mode to save memory
    const DEBUG = false;
    if (DEBUG)
      console.log("[Title Extraction Debug] Starting title extraction...");

    // Early exit for non-supported pages
    if (!isEbayItemPage() && !isYahooAuctionPage()) {
      return document.title || "";
    }

    if (isYahooAuctionPage()) {
      if (DEBUG) console.log("[Title Extraction Debug] On Yahoo auction page");

      const headerH1 = document.querySelector("#itemHeader h1");
      if (DEBUG)
        console.log("[Title Extraction Debug] HeaderH1 element:", headerH1);

      if (headerH1) {
        // Wait for Google Translate to finish processing
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const headerText = headerH1.textContent?.trim();
        if (DEBUG)
          console.log(
            "[Title Extraction Debug] Using HeaderH1 text:",
            headerText
          );
        if (headerText) return headerText;
      }
    }

    const docTitle = document.title || "";
    return docTitle;
  };

  if (isEbayItemPage() || isYahooAuctionPage()) {
    // Auto-click the image gallery button if on an eBay item page
    if (isEbayItemPage()) {
      const clickImageGallery = () => {
        const galleryButton = document.querySelector(
          '[aria-label="Opens image gallery"]'
        );
        if (galleryButton) {
          try {
            galleryButton.click();
            console.log("[Raw TCG Extension] Clicked image gallery button");
          } catch (error) {
            console.error(
              "[Raw TCG Extension] Error clicking gallery button:",
              error
            );
          }
        } else {
          // Retry a few times in case the button loads late
          let retryCount = 0;
          const maxRetries = 3;
          const retryInterval = setInterval(() => {
            const galleryBtn = document.querySelector(
              '[aria-label="Opens image gallery"]'
            );
            if (galleryBtn) {
              try {
                galleryBtn.click();
                console.log(
                  "[Raw TCG Extension] Clicked image gallery button (retry)"
                );
              } catch (error) {
                console.error(
                  "[Raw TCG Extension] Error clicking gallery button:",
                  error
                );
              }
              clearInterval(retryInterval);
            } else if (++retryCount >= maxRetries) {
              console.log(
                "[Raw TCG Extension] Gallery button not found after retries"
              );
              clearInterval(retryInterval);
            }
          }, 300);
        }
      };

      // Try to click immediately
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", clickImageGallery);
      } else {
        // DOM is already loaded, try clicking immediately
        clickImageGallery();
      }
    }

    // Remove eager shared-cache init, replace with lazy getter - MEMORY OPTIMIZED
    function getSharedCache() {
      if (!window.ebayExtensionSharedCache) {
        window.ebayExtensionSharedCache = {
          pokemon: new Map(),
          trainer: new Map(),
          keyword: new Map(),
          code: new Map(),
          maxSize: 50, // Reduced from 100 to save memory
          set(cacheName, key, value) {
            const cache = this[cacheName];
            if (cache.size >= this.maxSize) {
              // More aggressive cleanup - remove oldest 75% instead of just first entry
              const entries = Array.from(cache.entries());
              cache.clear();
              const keepCount = Math.floor(this.maxSize * 0.25);
              entries.slice(-keepCount).forEach(([k, v]) => cache.set(k, v));
            }
            cache.set(key, value);
          },
          get(cacheName, key) {
            return this[cacheName].get(key);
          },
          has(cacheName, key) {
            return this[cacheName].has(key);
          },
          // Add method to clear all caches
          clearAll() {
            this.pokemon.clear();
            this.trainer.clear();
            this.keyword.clear();
            this.code.clear();
          },
        };
      }
      return window.ebayExtensionSharedCache;
    }

    // -------- Configuration & State --------
    const CONFIG = {
      STORAGE_KEYS: {
        CHECKBOXES: "ebayGradingCheckboxes",
        GRADE: "ebayGradeSelect",
        PANEL_VISIBLE: "ebayPanelVisible",
      },
      SELECTORS: {
        IFH_CONTAINER: "#ifhContainer",
      },
      STYLES: {
        Z_INDEX: {
          CONTAINER: "10001",
          SIDEBAR: "10002",
          TOGGLE: "10003",
        },
      },
    };

    const state = {
      title: "", // Will be set asynchronously
      searchValue: "",
      checkboxes: {},
      gradeSelect: null,
      iframe: null,
      searchLinkEl: null, // used on Yahoo where ebay.com cannot be framed
      patterns: {
        slash: /([^\s\/]+)\s*\/\s*([^\s\/]+)/,
        threeDigit: /\b\d{2,3}\b/,
        // Allow alphanumerics after EN (e.g., BLAR-EN10K)
        enMatch: /\b[\w-]+-EN[0-9A-Z]+\b/i,
        ggMatch: /\bgg\d+\b/i,
        // Avoid allocating per-tab maps; use shared cache lazily instead
        // Keep only lightweight per-tab caches for title/search memo
        // pokemonCache/keywordCache/codeCache/trainerCache removed
      },
    };

    // Replace eager DATA/REGEXES with lazy factories
    let DATA;
    let REGEXES;
    function getDATA() {
      if (!DATA) {
        DATA = {
          keywords: [
            "1st",
            "chinese",
            "korean",
            "japanese",
            "shadowless",
            "celebrations",
            "jumbo",
            "error",
            "crystal",
            "reverse",
            "expedition",
            "anniversary",
            "pokemon center",
            "staff",
            "prerelease",
            "fan club",
            "felt hat",
            "vmax",
            "ghost",
            "gold",
            "silver",
            "starlight",
            "masaki",
            "ultimate",
            "no rarity",
            "Ex",
            "corocoro",
          ],
          codes: ["swsh", "sm", "bw", "xy", "svp"],
          opCodes: [
            "OP01",
            "OP02",
            "OP03",
            "OP04",
            "OP05",
            "OP06",
            "OP07",
            "OP08",
            "OP09",
            "OP10",
            "OP11",
            "OP12",
            "OP13",
            "ST13",
            "EB01",
            "EB02",
          ],
          labels: ["fuzzy", "psa", "bgs", "cgc", "tag"],
          gradeOptions: ["9/10", "10", "9", "8", "6/7", "4/5", "1/2/3", "Raw"],
          gradeMap: {
            "9/10": "9%7C10",
            "6/7": "6%7C7",
            "4/5": "4%7C5",
            "1/2/3": "1%7C2%7C3",
          },
        };
      }
      return DATA;
    }
    function getREGEXES() {
      if (!REGEXES) {
        const D = getDATA();
        REGEXES = {
          keywords: D.keywords.map((kw) => ({
            kw,
            regex: new RegExp(kw, "i"),
          })),
          codes: D.codes.map((code) => ({
            code,
            regex: new RegExp(`\\b${code}\\d+(?![A-Za-z+])\\b`, "i"),
          })),
          opCodes: D.opCodes.map((code) => ({
            code,
            regex: new RegExp(`\\b${code}(?:-\\d+)?\\b`, "i"),
          })),
        };
      }
      return REGEXES;
    }

    // -------- Search Value Generation --------
    class SearchValueGenerator {
      static async generate() {
        // Refresh title each time to capture late-populated titles (esp. Yahoo)
        state.title = await getPageTitle();
        if (
          state.patterns.titleCache === state.title &&
          state.patterns.searchCache
        ) {
          return state.patterns.searchCache;
        }

        let value = "";
        const foundPokemon = this.findPokemonName();
        const foundTrainer = this.findTrainerName();
        const slashMatch = this.getSlashMatch();

        if (slashMatch) value = slashMatch;
        if (foundPokemon) value = foundPokemon + (value ? " " + value : "");
        if (foundTrainer) value = foundTrainer + (value ? " " + value : "");

        value += this.extractKeywords() + this.extractCodes();
        value += this.getThreeDigitNumber(value);
        value = this.handleSpecialCases(value);

        // Cache result
        state.patterns.titleCache = state.title;
        state.patterns.searchCache = value;
        return value;
      }

      static getSlashMatch() {
        const match = state.title.match(state.patterns.slash);
        if (!match) return "";

        const hasNumber = /\d/.test(match[1]) || /\d/.test(match[2]);
        return hasNumber ? `${match[1]}/${match[2]}` : "";
      }

      static findPokemonName() {
        const result = this.findFromList(window.pokemonList, "pokemon", true);
        // Reduced debug logging to save memory
        const DEBUG = false;
        if (DEBUG) {
          console.log("[Pokemon Detection Debug]", {
            title: state.title,
            foundPokemon: result,
            titleLower: state.title.toLowerCase(),
            charizardTest: /\bcharizard\b/i.test(state.title),
          });
        }
        return result;
      }

      static findTrainerName() {
        return this.findFromList(window.trainerList, "trainer", false);
      }

      static findFromList(list, cacheType, useWordBoundary) {
        if (!Array.isArray(list)) return "";

        const sharedCache = getSharedCache();
        if (sharedCache.has(cacheType, state.title)) {
          return sharedCache.get(cacheType, state.title);
        }

        const lowerTitle = state.title.toLowerCase();

        for (const name of list) {
          const lowerName = name.toLowerCase();
          if (lowerTitle.includes(lowerName)) {
            if (useWordBoundary) {
              const rx = new RegExp(`\\b${name}\\b`, "i");
              if (!rx.test(state.title)) continue;
            }
            sharedCache.set(cacheType, state.title, name);
            return name;
          }
        }

        sharedCache.set(cacheType, state.title, "");
        return "";
      }

      static extractKeywords() {
        const sharedCache = getSharedCache();
        if (sharedCache.has("keyword", state.title)) {
          return sharedCache.get("keyword", state.title);
        }

        const lowerTitle = state.title.toLowerCase();
        let result = "";

        for (const { kw, regex } of getREGEXES().keywords) {
          if (
            lowerTitle.includes(kw.toLowerCase()) &&
            regex.test(state.title)
          ) {
            result += ` ${kw}`;
          }
        }

        sharedCache.set("keyword", state.title, result);
        return result;
      }

      static extractCodes() {
        const sharedCache = getSharedCache();
        if (sharedCache.has("code", state.title)) {
          return sharedCache.get("code", state.title);
        }

        let result = "";
        for (const { regex } of getREGEXES().codes) {
          const match = state.title.match(regex);
          if (match) {
            result += ` ${match[0]}`;
            break;
          }
        }

        sharedCache.set("code", state.title, result);
        return result;
      }

      static getThreeDigitNumber(currentValue) {
        const match = state.title.match(state.patterns.threeDigit);
        return match && !currentValue.includes(match[0]) ? ` ${match[0]}` : "";
      }

      static handleSpecialCases(value) {
        // EN codes take precedence
        const enMatch = state.title.match(state.patterns.enMatch);
        if (enMatch) {
          return `${enMatch[0]}${this.extractKeywords()}`;
        }

        // GG codes
        const ggMatch = state.title.match(state.patterns.ggMatch);
        if (ggMatch) {
          let result = ggMatch[0];
          const foundPokemon = this.findPokemonName();
          if (foundPokemon) result += ` ${foundPokemon}`;
          result += this.extractKeywords();
          return result;
        }

        // OP codes
        for (const { regex } of getREGEXES().opCodes) {
          const opMatch = state.title.match(regex);
          if (opMatch) {
            let result = opMatch[0];
            if (state.title.toLowerCase().includes("manga")) {
              result += " manga";
            }
            const foundTrainer = this.findTrainerName();
            if (foundTrainer) result += ` ${foundTrainer}`;
            result += this.extractKeywords();
            return result;
          }
        }

        return value;
      }
    }

    // -------- Styled Select Component (new) --------
    class StyledSelect {
      constructor({ options, value = "Raw" } = {}) {
        this.options = Array.isArray(options) ? options : [];
        this._value = this.options.includes(value)
          ? value
          : this.options[0] || "Raw";
        this._listeners = { change: new Set() };
        this._outsideHandler = null;

        this.el = document.createElement("div");
        this.el.className = "peb-select";
        this.el.setAttribute("role", "combobox");
        this.el.setAttribute("aria-expanded", "false");
        this.el.setAttribute("tabindex", "0");

        this.button = document.createElement("button");
        this.button.type = "button";
        this.button.className = "peb-select__button";
        this.button.setAttribute("aria-haspopup", "listbox");

        this.valueEl = document.createElement("span");
        this.valueEl.className = "peb-select__value";
        this.valueEl.textContent = this._value;

        const caret = document.createElement("span");
        caret.className = "peb-select__caret";
        caret.setAttribute("aria-hidden", "true");

        this.button.append(this.valueEl, caret);

        this.menu = document.createElement("ul");
        this.menu.className = "peb-select__menu";
        this.menu.setAttribute("role", "listbox");

        this._buildOptions();
        this.el.append(this.button, this.menu);

        // Events
        this.button.addEventListener("click", () => this.toggle());
        this.el.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            this.close();
          }
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            this.toggle();
          }
        });
      }

      _buildOptions() {
        this.menu.innerHTML = "";
        this.options.forEach((opt) => {
          const li = document.createElement("li");
          li.className =
            "peb-option" + (opt === this._value ? " is-selected" : "");
          li.setAttribute("role", "option");
          li.dataset.value = opt;
          li.textContent = opt;
          if (opt === this._value) li.setAttribute("aria-selected", "true");
          li.addEventListener("click", () => this.select(opt));
          this.menu.appendChild(li);
        });
      }

      open() {
        if (this.el.getAttribute("aria-expanded") === "true") return;
        this.el.setAttribute("aria-expanded", "true");
        this._outsideHandler = (e) => {
          if (!this.el.contains(e.target)) this.close();
        };
        document.addEventListener("click", this._outsideHandler, true);
      }

      close() {
        if (this.el.getAttribute("aria-expanded") === "false") return;
        this.el.setAttribute("aria-expanded", "false");
        if (this._outsideHandler) {
          document.removeEventListener("click", this._outsideHandler, true);
          this._outsideHandler = null;
        }
      }

      toggle() {
        const expanded = this.el.getAttribute("aria-expanded") === "true";
        expanded ? this.close() : this.open();
      }

      select(val) {
        if (this._value === val) {
          this.close();
          return;
        }
        this._value = val;
        this.valueEl.textContent = val;
        Array.from(this.menu.children).forEach((li) => {
          const isSel = li.dataset.value === val;
          li.classList.toggle("is-selected", isSel);
          if (isSel) li.setAttribute("aria-selected", "true");
          else li.removeAttribute("aria-selected");
        });
        this.close();
        this._emit("change");
      }

      addEventListener(type, handler) {
        if (!this._listeners[type]) this._listeners[type] = new Set();
        this._listeners[type].add(handler);
      }
      removeEventListener(type, handler) {
        this._listeners[type]?.delete(handler);
      }
      _emit(type) {
        this._listeners[type]?.forEach((h) => {
          try {
            h();
          } catch {}
        });
      }

      destroy() {
        this.close();
        this._listeners = { change: new Set() };
      }

      get value() {
        return this._value;
      }
      set value(v) {
        if (this.options.includes(v)) this.select(v);
      }
    }

    // -------- UI Creation --------
    class UICreator {
      static createSidebar() {
        const sidebar = document.createElement("div");
        sidebar.className = "pokemon-ebay-sidebar";
        Object.assign(sidebar.style, this.getSidebarStyles());

        const fragment = document.createDocumentFragment();
        this.createCheckboxes(fragment);
        this.createGradeDropdown(fragment);
        sidebar.appendChild(fragment);

        return sidebar;
      }

      static getSidebarStyles() {
        return {
          width: "100%",
          height: "auto",
          background:
            "linear-gradient(135deg, rgba(28,30,38,0.75), rgba(28,30,38,0.55))",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px 10px",
          padding: "10px 12px",
          boxSizing: "border-box",
          zIndex: CONFIG.STYLES.Z_INDEX.SIDEBAR,
          margin: "0px",
          minHeight: "56px",
          maxWidth: "calc(100%)",
          flexWrap: "wrap",
          boxShadow:
            "0 8px 30px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.16)",
          backdropFilter: "saturate(140%) blur(12px)",
          color: "#ffffff",
          fontFamily:
            'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Apple Color Emoji","Segoe UI Emoji"',
          letterSpacing: "0.2px",
          position: "relative",
        };
      }

      static createCheckboxes(parent) {
        const persisted = StorageManager.getCheckboxStates();

        getDATA().labels.forEach((label) => {
          const wrapper = document.createElement("label");
          wrapper.className = "peb-chip";

          const cb = document.createElement("input");
          cb.type = "checkbox";
          cb.className = "peb-chip__input";
          cb.id = `cb-${label}`;
          cb.checked = !!persisted[label];
          state.checkboxes[label] = cb;

          const span = document.createElement("span");
          span.textContent = label.toUpperCase();
          span.className = "peb-chip__text";

          wrapper.append(cb, span);
          parent.appendChild(wrapper);
          cb.addEventListener("change", EventHandlers.saveCheckboxState);
        });

        // Add persistence toggle
        const persistWrapper = document.createElement("label");
        persistWrapper.className = "peb-chip peb-chip--persist";
        persistWrapper.style.marginLeft = "auto";

        const persistCb = document.createElement("input");
        persistCb.type = "checkbox";
        persistCb.className = "peb-chip__input";
        persistCb.id = "cb-persist";
        persistCb.checked = StorageManager.getPersistenceEnabled();

        const persistSpan = document.createElement("span");
        persistSpan.textContent = "PERSIST";
        persistSpan.className = "peb-chip__text";

        persistWrapper.append(persistCb, persistSpan);
        parent.appendChild(persistWrapper);

        persistCb.addEventListener("change", () => {
          StorageManager.setPersistenceEnabled(persistCb.checked);
          if (!persistCb.checked) {
            // Clear existing data when persistence is disabled
            localStorage.removeItem(CONFIG.STORAGE_KEYS.CHECKBOXES);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.GRADE);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.PANEL_VISIBLE);
          }
        });
      }

      static createGradeDropdown(parent) {
        const gradeWrapper = document.createElement("div");
        gradeWrapper.className = "pokemon-ebay-grade";
        gradeWrapper.style.cssText =
          "display: flex; align-items: center; margin-left: 8px; gap: 6px;";

        const gradeLabel = document.createElement("span");
        gradeLabel.textContent = "Grade:";
        gradeLabel.style.cssText =
          "color: #4f8cff; font-weight: 800; letter-spacing: 0.35px; font-size: 12px;";

        const persistedGrade = StorageManager.getGrade();
        state.gradeSelect = new StyledSelect({
          options: getDATA().gradeOptions,
          value: persistedGrade || "9/10",
        });

        state.gradeSelect.addEventListener(
          "change",
          EventHandlers.onGradeChange
        );

        gradeWrapper.append(gradeLabel, state.gradeSelect.el);
        parent.appendChild(gradeWrapper);
      }

      static createToggleButton() {
        const toggleBtn = document.createElement("button");
        toggleBtn.textContent = "Hide Panel";
        toggleBtn.className = "peb-toggle";
        Object.assign(toggleBtn.style, {
          position: "fixed",
          bottom: "16px",
          right: "16px",
          zIndex: CONFIG.STYLES.Z_INDEX.TOGGLE,
        });
        return toggleBtn;
      }

      static createContainer() {
        const container = document.createElement("div");
        Object.assign(container.style, {
          position: "fixed",
          bottom: "4px",
          right: "4px",
          width: "min(520px, 36vw)",
          height: "min(60vh, 820px)",
          zIndex: CONFIG.STYLES.Z_INDEX.CONTAINER,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          background: "transparent",
        });
        return container;
      }

      static createIframe() {
        // On Yahoo Auctions, eBay blocks being embedded due to frame-ancestors/X-Frame-Options.
        // Provide a link that opens the search in a new tab instead of an iframe.
        if (typeof isYahooAuctionPage === "function" && isYahooAuctionPage()) {
          const wrap = document.createElement("div");
          Object.assign(wrap.style, {
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          });

          // Preview container
          const preview = document.createElement("div");
          preview.className = "peb-preview";
          Object.assign(preview.style, {
            width: "100%",
            maxHeight: "360px",
            overflow: "auto",
            background: "rgba(255,255,255,0.85)",
            borderRadius: "12px",
            border: "1px solid rgba(0,0,0,0.12)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
            padding: "8px",
            color: "#0b122b",
          });

          // Link fallback
          const link = document.createElement("a");
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = "Open results on eBay";
          link.className = "peb-open-link";
          Object.assign(link.style, {
            display: "block",
            textAlign: "center",
            fontWeight: 800,
            color: "#0b122b",
            background: "#ffffff",
            borderRadius: "12px",
            padding: "12px 10px",
            border: "1px solid rgba(0,0,0,0.12)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            textDecoration: "none",
          });

          state.searchLinkEl = link;
          PreviewManager.attach(preview);
          wrap.append(preview, link);
          return wrap;
        }

        state.iframe = document.createElement("iframe");
        Object.assign(state.iframe.style, {
          width: "100%",
          flex: "1 1 auto",
          minHeight: "280px",
          border: "none",
          borderRadius: "14px",
          boxShadow: "var(--peb-shadow, 0 8px 32px rgba(0,0,0,0.18))",
          background: "rgba(255,255,255,0.65)",
          marginLeft: "0",
          marginTop: "0",
          zIndex: CONFIG.STYLES.Z_INDEX.CONTAINER,
          overflowX: "hidden",
          overflowY: "auto",
        });
        state.iframe.addEventListener("load", EventHandlers.onIframeLoad);
        return state.iframe;
      }
    }

    // -------- Storage Management --------
    class StorageManager {
      static getPersistenceEnabled() {
        // Always store the persistence setting itself
        return localStorage.getItem("ebayPersistenceEnabled") !== "false";
      }

      static setPersistenceEnabled(enabled) {
        localStorage.setItem("ebayPersistenceEnabled", enabled.toString());
      }

      static getCheckboxStates() {
        if (!this.getPersistenceEnabled()) return {};
        return JSON.parse(
          localStorage.getItem(CONFIG.STORAGE_KEYS.CHECKBOXES) || "{}"
        );
      }

      static setCheckboxStates(states) {
        if (!this.getPersistenceEnabled()) return;
        localStorage.setItem(
          CONFIG.STORAGE_KEYS.CHECKBOXES,
          JSON.stringify(states)
        );
      }

      static getGrade() {
        if (!this.getPersistenceEnabled()) return null;
        return localStorage.getItem(CONFIG.STORAGE_KEYS.GRADE);
      }

      static setGrade(grade) {
        if (!this.getPersistenceEnabled()) return;
        localStorage.setItem(CONFIG.STORAGE_KEYS.GRADE, grade);
      }

      static getPanelVisibility() {
        if (!this.getPersistenceEnabled()) return null;
        return localStorage.getItem(CONFIG.STORAGE_KEYS.PANEL_VISIBLE);
      }

      static setPanelVisibility(visibility) {
        if (!this.getPersistenceEnabled()) return;
        localStorage.setItem(CONFIG.STORAGE_KEYS.PANEL_VISIBLE, visibility);
      }
    }

    // -------- Event Handlers --------
    class EventHandlers {
      static saveCheckboxState = this.debounce(() => {
        const states = {};
        Object.keys(state.checkboxes).forEach((label) => {
          states[label] = state.checkboxes[label].checked;
        });
        StorageManager.setCheckboxStates(states);
        IframeManager.update();
      }, 100);

      static onGradeChange = () => {
        StorageManager.setGrade(state.gradeSelect.value);
        IframeManager.update();
      };

      static onIframeLoad = () => {
        IframeStyler.applyStyles();
        IframeScroller.scrollDown();
      };

      static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
          const later = () => {
            clearTimeout(timeout);
            func(...args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
        };
      }
    }

    // -------- Iframe Management --------
    class IframeManager {
      static update() {
        const checkedLabels = Object.keys(state.checkboxes).filter(
          (label) => label !== "fuzzy" && state.checkboxes[label].checked
        );

        let extra = "";
        if (checkedLabels.length > 1) {
          extra = " (" + checkedLabels.join(", ") + ")";
        } else if (checkedLabels.length === 1) {
          extra = " " + checkedLabels[0];
        }

        let baseSearch = state.searchValue;
        if (state.checkboxes.fuzzy?.checked) {
          baseSearch = baseSearch.replace(/\/[^\s\/]+/, "").trim();
        }

        const fullSearch = (baseSearch + extra).trim();

        // Reduced logging to save memory - only log if debug is enabled
        const DEBUG = false;
        if (DEBUG) {
          console.log("baseSearch:", baseSearch, "fullSearch:", fullSearch);
        }

        const gradeParam = this.buildGradeParam();

        const langParam =
          typeof isYahooAuctionPage === "function" && isYahooAuctionPage()
            ? "&Language=Japanese"
            : "";
        const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(
          fullSearch
        )}&LH_Sold=1&LH_Complete=1&_dcat=183454&_ipg=60${gradeParam}${langParam}`;

        // If we're on Yahoo Auctions, populate the link and fetch preview
        if (typeof isYahooAuctionPage === "function" && isYahooAuctionPage()) {
          if (state.searchLinkEl) {
            state.searchLinkEl.href = url;
            state.searchLinkEl.textContent = `Open results on eBay: ${fullSearch}`;
          }
          PreviewManager.request(url);
          return;
        }

        state.iframe.src = url;
      }

      static buildGradeParam() {
        const gradeVal = state.gradeSelect.value;
        if (!gradeVal || gradeVal === "Raw") return "";
        return `&Grade=${
          getDATA().gradeMap[gradeVal] || encodeURIComponent(gradeVal)
        }`;
      }
    }

    // -------- Preview Manager (Yahoo only) --------
    class PreviewManager {
      static _container = null;
      static attach(container) {
        this._container = container;
      }

      static request(url) {
        if (!this._container) return;
        this._container.innerHTML = `<div style="padding:8px;color:#555">Loading preview…</div>`;
        try {
          chrome.runtime.sendMessage(
            { type: "peb_fetch_search", url },
            (res) => {
              if (!res || !res.ok || !res.html) {
                this._container.innerHTML = `<div style="padding:8px;color:#b00">Preview unavailable.</div>`;
                return;
              }
              const snippet = this._extract(res.html);
              this._container.innerHTML =
                snippet ||
                `<div style="padding:8px;color:#b00">No results to preview.</div>`;
            }
          );
        } catch (e) {
          this._container.innerHTML = `<div style="padding:8px;color:#b00">Preview error.</div>`;
        }
      }

      // Very lightweight extractor: show first 3 result items' titles and prices
      static _extract(html) {
        try {
          const doc = new DOMParser().parseFromString(html, "text/html");
          const items = Array.from(doc.querySelectorAll("li.s-item")).slice(
            0,
            3
          );
          if (!items.length) return "";
          const rows = items.map((li) => {
            const a = li.querySelector("a.s-item__link");
            const title = a?.textContent?.trim() || "Untitled";
            const price =
              li.querySelector("span.s-item__price")?.textContent?.trim() || "";
            const ship =
              li.querySelector("span.s-item__shipping")?.textContent?.trim() ||
              "";
            return (
              `<div style=\"padding:8px;border-bottom:1px solid rgba(0,0,0,0.08)\">` +
              `<div style=\"font-weight:800;\">${this._escape(title)}</div>` +
              `<div style=\"color:#333;margin-top:2px;\">${this._escape(
                price
              )} ${this._escape(ship)}</div>` +
              (a?.href
                ? `<div style=\"margin-top:4px\"><a href=\"${a.href}\" target=\"_blank\" rel=\"noopener\">View</a></div>`
                : "") +
              `</div>`
            );
          });
          return rows.join("");
        } catch (_) {
          return "";
        }
      }

      static _escape(s) {
        return String(s).replace(
          /[&<>"']/g,
          (c) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            }[c])
        );
      }
    }

    class IframeStyler {
      static applyStyles() {
        try {
          const doc =
            state.iframe.contentDocument || state.iframe.contentWindow.document;
          if (doc) {
            const style = doc.createElement("style");
            style.innerHTML = `
              html, body { overflow-x: hidden !important; }
              .s-feedback { display: none !important; }
              .gh-btt-button { display: none !important; }
            `;
            doc.head.appendChild(style);
          }
        } catch (e) {
          // Cross-origin restriction
        }
      }
    }

    class IframeScroller {
      static scrollDown() {
        const scroll = (top) => {
          try {
            const win = state.iframe.contentWindow;
            if (win && typeof win.scrollTo === "function") {
              win.scrollTo({ top, left: 0, behavior: "smooth" });
            }
          } catch (e) {
            // Cross-origin restriction
          }
        };

        scroll(360);
        setTimeout(() => scroll(360), 200);
        setTimeout(() => scroll(360), 600);
      }
    }

    // -------- Enhanced Memory Management --------
    class MemoryManager {
      static cleanup() {
        try {
          // Clear local references
          if (state.iframe) {
            state.iframe.removeEventListener(
              "load",
              EventHandlers.onIframeLoad
            );
            state.iframe = null;
          }

          // Remove event listeners
          Object.values(state.checkboxes).forEach((cb) => {
            if (cb && cb.removeEventListener) {
              cb.removeEventListener("change", EventHandlers.saveCheckboxState);
            }
          });

          if (state.gradeSelect) {
            state.gradeSelect.removeEventListener(
              "change",
              EventHandlers.onGradeChange
            );
            if (typeof state.gradeSelect.destroy === "function") {
              try {
                state.gradeSelect.destroy();
              } catch {}
            }
          }

          ElementHider.disconnect();

          // Clear state aggressively
          state.checkboxes = {};
          state.gradeSelect = null;
          state.iframe = null;
          state.searchLinkEl = null;
          state.title = "";
          state.searchValue = "";

          // Clear local caches
          state.patterns.titleCache = null;
          state.patterns.searchCache = null;

          // Clear shared cache periodically
          const sharedCache = getSharedCache();
          sharedCache.clearAll();

          // Clear global data caches
          DATA = null;
          REGEXES = null;
        } catch (error) {
          console.error("Memory cleanup error:", error);
        }
      }

      static limitCacheSize() {
        try {
          const sharedCache = getSharedCache();
          ["pokemon", "trainer", "keyword", "code"].forEach((cacheName) => {
            const cache = sharedCache[cacheName];
            if (cache && cache.size > 25) {
              // More aggressive limit
              const entries = Array.from(cache.entries());
              cache.clear();
              // Keep only the most recent 10 entries
              entries.slice(-10).forEach(([k, v]) => {
                cache.set(k, v);
              });
            }
          });
        } catch (error) {
          console.error("Cache limit error:", error);
        }
      }

      // New method for periodic cleanup
      static periodicCleanup() {
        this.limitCacheSize();

        // Force garbage collection hint (if available)
        if (window.gc) {
          try {
            window.gc();
          } catch {}
        }

        // Optional: Log memory usage for debugging (disabled by default)
        const DEBUG_MEMORY = false;
        if (DEBUG_MEMORY && performance.memory) {
          console.log("Memory usage:", {
            used:
              Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) +
              "MB",
            total:
              Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) +
              "MB",
          });
        }
      }
    }

    // -------- Enhanced Page Visibility Optimization --------
    class VisibilityManager {
      static init() {
        document.addEventListener(
          "visibilitychange",
          this.handleVisibilityChange
        );
        window.addEventListener("beforeunload", MemoryManager.cleanup);

        // Add periodic memory cleanup every 2 minutes
        this.cleanupInterval = setInterval(() => {
          if (document.hidden) {
            MemoryManager.periodicCleanup();
          }
        }, 120000); // 2 minutes
      }

      static handleVisibilityChange() {
        if (document.hidden) {
          // Tab is hidden, pause iframe updates and cleanup memory
          if (state.iframe) {
            state.iframe.style.display = "none";
            // Clear iframe src to save memory when hidden
            if (state.iframe.src) {
              state.iframe.dataset.lastSrc = state.iframe.src;
              state.iframe.src = "about:blank";
            }
          }
          // Run aggressive memory cleanup when hidden
          MemoryManager.periodicCleanup();
        } else {
          // Tab is visible, resume iframe
          if (state.iframe) {
            state.iframe.style.display = "block";
            // Restore iframe src when visible again
            if (state.iframe.dataset.lastSrc) {
              state.iframe.src = state.iframe.dataset.lastSrc;
              delete state.iframe.dataset.lastSrc;
            }
          }
        }
      }

      static disconnect() {
        if (this.cleanupInterval) {
          clearInterval(this.cleanupInterval);
          this.cleanupInterval = null;
        }
      }
    }

    // -------- App Controller --------
    class AppController {
      static async init() {
        // Ensure styles are present before creating the toggle so it's styled on load
        StyleManager.addResponsiveStyles();

        const toggleBtn = UICreator.createToggleButton();
        document.body.appendChild(toggleBtn);
        // Always open the panel immediately on page load
        await this.createPanel(toggleBtn);
        // Hide intrusive popups on load (e.g., Yahoo Auctions overlays)
        ElementHider.setup();
        return;
      }

      static setupShowPanelMode(toggleBtn) {
        toggleBtn.textContent = "Show Panel";
        toggleBtn.onclick = async () => {
          StorageManager.setPanelVisibility("Hide Panel");
          toggleBtn.textContent = "Hide Panel";
          await this.createPanel(toggleBtn);
        };
      }

      static async setupFullMode(toggleBtn) {
        await this.createPanel(toggleBtn);
      }

      static async createPanel(toggleBtn) {
        // Initialize visibility management
        VisibilityManager.init();

        state.searchValue = await SearchValueGenerator.generate();

        const sidebar = UICreator.createSidebar();
        const container = UICreator.createContainer();
        const iframe = UICreator.createIframe();

        container.append(sidebar, iframe);
        document.body.appendChild(container);

        this.setupToggleFunctionality(container, toggleBtn);

        // Style injection moved to init to style the toggle immediately
        // StyleManager.addResponsiveStyles();

        ElementHider.setup();
        requestAnimationFrame(() => IframeManager.update());
      }

      static setupToggleFunctionality(container, toggleBtn) {
        if (StorageManager.getPanelVisibility() === "Show Panel") {
          container.style.display = "none";
          toggleBtn.textContent = "Show Panel";
        }

        toggleBtn.onclick = () => {
          const willShow = container.style.display === "none";
          container.style.display = willShow ? "flex" : "none";
          toggleBtn.textContent = willShow ? "Hide Panel" : "Show Panel";
          StorageManager.setPanelVisibility(toggleBtn.textContent);

          if (willShow) {
            setTimeout(() => IframeScroller.scrollDown(), 100);
          }
        };
      }
    }

    // -------- Style Management --------
    class StyleManager {
      static addResponsiveStyles() {
        // Prevent duplicate injections when panel is created multiple times
        if (this._injected) return;
        this._injected = true;

        const style = document.createElement("style");
        style.textContent = `
          :root {
            --peb-accent: #4f8cff;
            --peb-border: rgba(255,255,255,0.16);
            --peb-shadow: 0 10px 28px rgba(0,0,0,0.28);
            --peb-txt: #ffffff;
            --peb-muted: rgba(255,255,255,0.75);
          }

          .pokemon-ebay-sidebar {
            color: var(--peb-txt);
          }

          /* Chip-like checkboxes */
          label.peb-chip {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 6px 10px;
            margin: 4px 6px;
            border-radius: 999px;
            background: rgba(255,255,255,0.12);
            border: 1px solid var(--peb-border);
            cursor: pointer;
            user-select: none;
            transition: background .2s ease, box-shadow .2s ease, transform .12s ease, border-color .2s ease, color .2s ease;
            will-change: transform;
          }
          label.peb-chip:hover {
            background: rgba(255,255,255,0.18);
            transform: translateY(-0.5px);
          }
          .peb-chip__input {
            position: absolute;
            opacity: 0;
            pointer-events: none;
            width: 1px;
            height: 1px;
          }
          .peb-chip__text {
            color: var(--peb-txt);
            font-size: 12px;
            letter-spacing: .35px;
            font-weight: 700;
          }
          label.peb-chip:has(.peb-chip__input:checked) {
            background: var(--peb-accent);
            border-color: transparent;
            box-shadow: 0 8px 18px rgba(79,140,255,0.35);
          }
          label.peb-chip:has(.peb-chip__input:checked) .peb-chip__text {
            color: #0b122b;
          }

          /* Grade styles */
          .pokemon-ebay-grade span { color: var(--peb-accent); }
          .pokemon-ebay-grade select {
            backdrop-filter: saturate(140%) blur(6px);
          }
          .pokemon-ebay-grade select:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(79,140,255,0.25);
          }

          /* Toggle button */
          .peb-toggle {
            padding: 10px 14px;
            border-radius: 10px;
            background: linear-gradient(135deg, var(--peb-accent), #6aa3ff);
            border: 1px solid rgba(255,255,255,0.2);
            color: #fff;
            font-weight: 800;
            font-size: 13px;
            box-shadow: 0 12px 24px rgba(79,140,255,0.35);
            backdrop-filter: saturate(140%) blur(8px);
            cursor: pointer;
            transition: transform .15s ease, box-shadow .2s ease, filter .2s ease, opacity .2s ease;
          }
          .peb-toggle:hover {
            transform: translateY(-1px);
            box-shadow: 0 16px 28px rgba(79,140,255,0.42);
          }
          .peb-toggle:active {
            transform: translateY(0);
            filter: brightness(.97);
          }

          @media (prefers-color-scheme: light) {
            :root {
              --peb-border: rgba(0,0,0,0.08);
              --peb-txt: #0b122b;
              --peb-muted: rgba(0,0,0,0.6);
            }
            .pokemon-ebay-sidebar {
              color: var(--peb-txt);
              background: linear-gradient(135deg, rgba(255,255,255,0.85), rgba(255,255,255,0.7)) !important;
              border-color: rgba(0,0,0,0.06) !important;
            }
            .peb-chip__text { color: #0b122b; }
            label.peb-chip:has(.peb-chip__input:checked) .peb-chip__text { color: #fff; }
          }

          @media (max-width: 700px) {
            .pokemon-ebay-sidebar {
              flex-direction: column !important;
              flex-wrap: wrap !important;
              align-items: flex-start !important;
              min-width: 0 !important;
              max-width: 100vw !important;
              width: 100vw !important;
              margin: 0 !important;
              padding: 10px 3vw !important;
              border-radius: 0 0 16px 16px !important;
              font-size: 12px !important;
              min-height: 120px !important;
              height: auto !important;
            }
            .pokemon-ebay-sidebar label {
              margin: 4px 0 !important;
              width: 100%;
              justify-content: flex-start;
              flex: 1 1 100%;
              min-width: 120px;
              margin-bottom: 6px !important;
            }
            .pokemon-ebay-grade {
              margin-left: 0 !important;
              margin-top: 8px !important;
            }
          }`;
        document.head.appendChild(style);

        // NEW: styles for the custom select
        const selectStyle = document.createElement("style");
        selectStyle.textContent = `
          .peb-select {
            position: relative;
            min-width: 92px;
            user-select: none;
          }
          .peb-select__button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 10px;
            border-radius: 10px;
            border: 1px solid var(--peb-accent);
            background: rgba(255,255,255,0.12);
            color: var(--peb-txt);
            font-weight: 700;
            font-size: 13px;
            box-shadow: 0 2px 10px 0 rgba(79,140,255,0.15);
            cursor: pointer;
            outline: none;
          }
          .peb-select__button:focus-visible {
            box-shadow: 0 0 0 3px rgba(79,140,255,0.25);
          }
          .peb-select__value { min-width: 28px; text-align: center; }
          .peb-select__caret {
            width: 0; height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 6px solid var(--peb-txt);
            opacity: .9;
            transition: transform .15s ease;
          }
          .peb-select[aria-expanded="true"] .peb-select__caret {
            transform: rotate(180deg);
          }
          .peb-select__menu {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            z-index: 10004;
            min-width: 120px;
            max-height: 280px;
            overflow-y: hidden;
            background: linear-gradient(135deg, rgba(28,30,38,0.98), rgba(28,30,38,0.9));
            border: 1px solid var(--peb-border);
            border-radius: 10px;
            box-shadow: 0 12px 28px rgba(0,0,0,0.35);
            padding: 6px;
            display: none;
          }
          .peb-select[aria-expanded="true"] .peb-select__menu { display: block; }
          .peb-option {
            list-style: none;
            padding: 8px 10px;
            border-radius: 8px;
            color: var(--peb-txt);
            font-weight: 700;
            font-size: 13px;
            cursor: pointer;
            transition: background .15s ease, color .15s ease;
            white-space: nowrap;
          }
          .peb-option:hover { background: rgba(255,255,255,0.12); }
          .peb-option.is-selected {
            background: var(--peb-accent);
            color: #0b122b;
          }

          @media (prefers-color-scheme: light) {
            .peb-select__menu {
              background: linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,255,255,0.92));
              border-color: rgba(0,0,0,0.08);
            }
            .peb-option { color: #0b122b; }
            .peb-select__caret { border-top-color: #0b122b; }
          }
        `;
        document.head.appendChild(selectStyle);
      }
    }

    // -------- Element Management --------
    class ElementHider {
      static _observer;
      static setup() {
        if (this._observer) return;
        this._observer = new MutationObserver(this.hideElements);
        this._observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
        this.hideElements();
      }

      static hideElements() {
        const ifhEl = document.getElementById("ifhContainer");
        if (ifhEl) ifhEl.style.display = "none";

        // Close/hide Yahoo Auctions popup overlay by class
        try {
          const nodes = document.querySelectorAll(".sc-2f291401-1");
          nodes.forEach((el) => {
            // Attempt to click a close button if present
            const btn = el.querySelector(
              'button,[aria-label="Close"],[data-action="close"]'
            );
            try {
              btn?.click();
            } catch {}
            // Force-hide as fallback
            el.style.setProperty("display", "none", "important");
            el.style.setProperty("visibility", "hidden", "important");
            el.style.setProperty("pointer-events", "none", "important");
          });
        } catch {}

        // Auto-click first image inside Yahoo Auctions preview container once
        try {
          if (
            typeof isYahooAuctionPage === "function" &&
            isYahooAuctionPage() &&
            !ElementHider._imgClicked
          ) {
            const img = document.querySelector("div.sc-86725324-3.dOfFuq img");
            if (img) {
              try {
                img.click();
              } catch {}
              ElementHider._imgClicked = true;
            }
          }
        } catch {}
      }

      static disconnect() {
        this._observer?.disconnect();
        this._observer = null;
      }
    }

    // -------- Initialize App --------
    if (window.requestIdleCallback) {
      requestIdleCallback(async () => await AppController.init());
    } else {
      setTimeout(async () => await AppController.init(), 0);
    }
  }
})();
