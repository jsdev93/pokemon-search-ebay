(function () {
  // Only run on eBay item pages
  if (
    window.location.hostname === "www.ebay.com" &&
    window.location.pathname.startsWith("/itm/")
  ) {
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
      title: document.title || "",
      searchValue: "",
      checkboxes: {},
      gradeSelect: null,
      iframe: null,
      patterns: {
        slash: /([^\s\/]+)\s*\/\s*([^\s\/]+)/,
        threeDigit: /\b\d{2,3}\b/,
        enMatch: /\b[\w-]+-EN\d+\b/i,
        pokemonCache: new Map(),
        keywordCache: new Map(),
        codeCache: new Map(),
        trainerCache: new Map(),
      },
    };

    // -------- Data Configuration --------
    const DATA = {
      keywords: [
        "1st",
        "chinese",
        "japanese",
        "shadowless",
        "celebrations",
        "jumbo",
        "error",
        "crystal",
        "reverse",
        "expedition",
        "pokemon center",
        "sealed",
        "staff",
        "prerelease",
        "fan club",
        "felt hat",
        "vmax",
        "ghost",
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
        "ST13",
        "EB01",
        "EB02",
      ],
      labels: ["fuzzy", "psa", "bgs", "cgc", "tag"],
      gradeOptions: ["Any", "10", "9", "9/10", "8", "6/7", "4/5", "1/2/3"],
      gradeMap: {
        "9/10": "9%7C10",
        "6/7": "6%7C7",
        "4/5": "4%7C5",
        "1/2/3": "1%7C2%7C3",
      },
    };

    // Pre-compile regexes
    const REGEXES = {
      keywords: DATA.keywords.map((kw) => ({ kw, regex: new RegExp(kw, "i") })),
      codes: DATA.codes.map((code) => ({
        code,
        regex: new RegExp(`\\b${code}\\d+\\b`, "i"),
      })),
      opCodes: DATA.opCodes.map((code) => ({
        code,
        regex: new RegExp(`\\b${code}-\\d+\\b`, "i"),
      })),
    };

    // -------- Search Value Generation --------
    class SearchValueGenerator {
      static generate() {
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
        return this.findFromList(
          window.pokemonList,
          state.patterns.pokemonCache,
          true
        );
      }

      static findTrainerName() {
        return this.findFromList(
          window.trainerList,
          state.patterns.trainerCache,
          false
        );
      }

      static findFromList(list, cache, useWordBoundary) {
        if (!Array.isArray(list)) return "";
        if (cache.has(state.title)) return cache.get(state.title);

        const lowerTitle = state.title.toLowerCase();

        for (const name of list) {
          const lowerName = name.toLowerCase();
          if (lowerTitle.includes(lowerName)) {
            if (useWordBoundary) {
              const rx = new RegExp(`\\b${name}\\b`, "i");
              if (!rx.test(state.title)) continue;
            }
            cache.set(state.title, name);
            return name;
          }
        }

        cache.set(state.title, "");
        return "";
      }

      static extractKeywords() {
        if (state.patterns.keywordCache.has(state.title)) {
          return state.patterns.keywordCache.get(state.title);
        }

        const lowerTitle = state.title.toLowerCase();
        let result = "";

        for (const { kw, regex } of REGEXES.keywords) {
          if (
            lowerTitle.includes(kw.toLowerCase()) &&
            regex.test(state.title)
          ) {
            result += ` ${kw}`;
          }
        }

        state.patterns.keywordCache.set(state.title, result);
        return result;
      }

      static extractCodes() {
        if (state.patterns.codeCache.has(state.title)) {
          return state.patterns.codeCache.get(state.title);
        }

        let result = "";
        for (const { regex } of REGEXES.codes) {
          const match = state.title.match(regex);
          if (match) {
            result += ` ${match[0]}`;
            break;
          }
        }

        state.patterns.codeCache.set(state.title, result);
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

        // OP codes
        for (const { regex } of REGEXES.opCodes) {
          const opMatch = state.title.match(regex);
          if (opMatch) {
            let result = opMatch[0];
            if (state.title.toLowerCase().includes("manga")) {
              result += " manga";
            }
            return result;
          }
        }

        return value;
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
          background: "rgba(30, 30, 40, 0.65)",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          boxSizing: "border-box",
          zIndex: CONFIG.STYLES.Z_INDEX.SIDEBAR,
          margin: "0px",
          minHeight: "56px",
          maxWidth: "calc(100%)",
          flexWrap: "wrap",
          boxShadow: "0 4px 24px 0 rgba(0,0,0,0.18)",
          border: "1.5px solid rgba(255,255,255,0.18)",
          backdropFilter: "blur(10px)",
        };
      }

      static createCheckboxes(parent) {
        const persisted = StorageManager.getCheckboxStates();

        DATA.labels.forEach((label) => {
          const wrapper = document.createElement("label");
          wrapper.style.cssText =
            "display: flex; align-items: center; margin-bottom: 0; margin-right: 8px;";

          const cb = document.createElement("input");
          cb.type = "checkbox";
          cb.style.marginRight = "7px";
          cb.id = `cb-${label}`;
          cb.checked = !!persisted[label];
          state.checkboxes[label] = cb;

          const span = document.createElement("span");
          span.textContent = label.toUpperCase();
          span.style.cssText = "color: #fff; font-size: 13px;";

          wrapper.append(cb, span);
          parent.appendChild(wrapper);
          cb.addEventListener("change", EventHandlers.saveCheckboxState);
        });
      }

      static createGradeDropdown(parent) {
        const gradeWrapper = document.createElement("div");
        gradeWrapper.className = "pokemon-ebay-grade";
        gradeWrapper.style.cssText =
          "display: flex; align-items: center; margin-left: 8px;";

        const gradeLabel = document.createElement("span");
        gradeLabel.textContent = "Grade:";
        gradeLabel.style.cssText =
          "color: #4f8cff; font-weight: bold; letter-spacing: 0.5px; font-size: 13px; margin-right: 4px;";

        state.gradeSelect = document.createElement("select");
        state.gradeSelect.style.cssText =
          "font-size: 15px; padding: 4px 8px; border-radius: 8px; border: 1.5px solid #4f8cff; background: rgba(255,255,255,0.18); color: #fff; font-weight: bold; box-shadow: 0 2px 8px 0 rgba(79,140,255,0.1); margin-left: 8px; width: 70px;";

        state.gradeSelect.innerHTML = DATA.gradeOptions
          .map((g) => `<option value="${g}">${g}</option>`)
          .join("");

        const persistedGrade = StorageManager.getGrade();
        if (persistedGrade) state.gradeSelect.value = persistedGrade;

        state.gradeSelect.addEventListener(
          "change",
          EventHandlers.onGradeChange
        );
        gradeWrapper.append(gradeLabel, state.gradeSelect);
        parent.appendChild(gradeWrapper);
      }

      static createToggleButton() {
        const toggleBtn = document.createElement("button");
        toggleBtn.textContent = "Hide Panel";
        Object.assign(toggleBtn.style, {
          position: "fixed",
          bottom: "10px",
          right: "10px",
          zIndex: CONFIG.STYLES.Z_INDEX.TOGGLE,
          padding: "8px 16px",
          borderRadius: "8px",
          border: "none",
          background: "#444",
          color: "#fff",
          fontSize: "16px",
          cursor: "pointer",
        });
        return toggleBtn;
      }

      static createContainer() {
        const container = document.createElement("div");
        Object.assign(container.style, {
          position: "fixed",
          bottom: "0",
          right: "0",
          width: "33vw",
          height: "70vh",
          zIndex: CONFIG.STYLES.Z_INDEX.CONTAINER,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          background: "transparent",
        });
        return container;
      }

      static createIframe() {
        state.iframe = document.createElement("iframe");
        Object.assign(state.iframe.style, {
          width: "100%",
          height: "calc(70vh - 60px)",
          border: "2px solid rgba(0,0,0,0.12)",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          background: "rgba(255,255,255,0.5)",
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
      static getCheckboxStates() {
        return JSON.parse(
          localStorage.getItem(CONFIG.STORAGE_KEYS.CHECKBOXES) || "{}"
        );
      }

      static setCheckboxStates(states) {
        localStorage.setItem(
          CONFIG.STORAGE_KEYS.CHECKBOXES,
          JSON.stringify(states)
        );
      }

      static getGrade() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.GRADE);
      }

      static setGrade(grade) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.GRADE, grade);
      }

      static getPanelVisibility() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.PANEL_VISIBLE);
      }

      static setPanelVisibility(visibility) {
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
          baseSearch = baseSearch.replace(/\s*\/.*$/, "").trim();
        }

        const fullSearch = (baseSearch + extra).trim();
        const gradeParam = this.buildGradeParam();

        state.iframe.src = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(
          fullSearch
        )}&LH_Sold=1&LH_Complete=1&_dcat=183454&_ipg=60${gradeParam}`;
      }

      static buildGradeParam() {
        const gradeVal = state.gradeSelect.value;
        if (!gradeVal || gradeVal === "Any") return "";
        return `&Grade=${
          DATA.gradeMap[gradeVal] || encodeURIComponent(gradeVal)
        }`;
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

    // -------- App Controller --------
    class AppController {
      static init() {
        const toggleBtn = UICreator.createToggleButton();
        document.body.appendChild(toggleBtn);

        if (StorageManager.getPanelVisibility() === "Show Panel") {
          this.setupShowPanelMode(toggleBtn);
          return;
        }

        this.setupFullMode(toggleBtn);
      }

      static setupShowPanelMode(toggleBtn) {
        toggleBtn.textContent = "Show Panel";
        toggleBtn.onclick = () => {
          StorageManager.setPanelVisibility("Hide Panel");
          toggleBtn.textContent = "Hide Panel";
          this.createPanel(toggleBtn);
        };
      }

      static setupFullMode(toggleBtn) {
        this.createPanel(toggleBtn);
      }

      static createPanel(toggleBtn) {
        state.searchValue = SearchValueGenerator.generate();

        const sidebar = UICreator.createSidebar();
        const container = UICreator.createContainer();
        const iframe = UICreator.createIframe();

        container.append(sidebar, iframe);
        document.body.appendChild(container);

        this.setupToggleFunctionality(container, toggleBtn);
        StyleManager.addResponsiveStyles();
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
        const style = document.createElement("style");
        style.textContent = `
          @media (max-width: 700px) {
            .pokemon-ebay-sidebar {
              flex-direction: column !important;
              flex-wrap: wrap !important;
              align-items: flex-start !important;
              min-width: 0 !important;
              max-width: 100vw !important;
              width: 100vw !important;
              margin: 0 !important;
              padding: 8px 2vw !important;
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
      }
    }

    // -------- Element Management --------
    class ElementHider {
      static setup() {
        const observer = new MutationObserver(this.hideElements);
        observer.observe(document.body, { childList: true, subtree: true });
        this.hideElements();
      }

      static hideElements() {
        const ifhEl = document.getElementById("ifhContainer");
        if (ifhEl) ifhEl.style.display = "none";
      }
    }

    // -------- Initialize App --------
    if (window.requestIdleCallback) {
      requestIdleCallback(() => AppController.init());
    } else {
      setTimeout(() => AppController.init(), 0);
    }
  }
})();
