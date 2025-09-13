(function () {
  // Only run on eBay item pages
  if (
    window.location.hostname === "www.ebay.com" &&
    window.location.pathname.startsWith("/itm/")
  ) {
    const title = document.title || "";
    let searchValue = "";
    const checkboxes = {};
    let gradeSelect;
    let iframe;

    // Cache regex patterns for better performance
    const patterns = {
      slash: /([^\s\/]+)\s*\/\s*([^\s\/]+)/,
      threeDigit: /\b\d{2,3}\b/,
      enMatch: /\b[\w-]+-EN\d+\b/i,
      pokemonCache: new Map(),
      keywordCache: new Map(),
      codeCache: new Map(),
    };

    // Pre-compile keyword regexes
    const keywords = [
      "1st",
      "chinese",
      "japanese",
      "shadowless",
      "celebrations",
      "jumbo",
      "error",
      "crystal",
      "shining",
      "reverse",
      "expedition",
      "pokemon center",
      "sealed",
      "staff",
      "prerelease",
      "fan club",
      "felt hat",
    ];
    const keywordRegexes = keywords.map((kw) => ({
      kw,
      regex: new RegExp(kw, "i"),
    }));

    // Pre-compile code regexes
    const codes = ["swsh", "sm", "bw", "xy", "svp"];
    const codeRegexes = codes.map((code) => ({
      code,
      regex: new RegExp(`\\b${code}\\d+\\b`, "i"),
    }));

    // Pre-compile OP code regexes
    const opCodes = [
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
    ];
    const opRegexes = opCodes.map((code) => ({
      code,
      regex: new RegExp(`\\b${code}-\\d+\\b`, "i"),
    }));

    // -------- Optimized Search Value Generation --------
    function generateSearchValue() {
      // Use cached result if title hasn't changed
      if (patterns.titleCache === title && patterns.searchCache) {
        return patterns.searchCache;
      }

      let value = "";
      const foundPokemon = findPokemonName();
      const slashMatch = title.match(patterns.slash);

      if (slashMatch) {
        value = `${slashMatch[1]}/${slashMatch[2]}`;
      }

      if (foundPokemon) {
        value = foundPokemon + (value ? " " + value : "");
      }

      value += extractKeywords() + extractCodes();

      const threeDigit = title.match(patterns.threeDigit);
      if (threeDigit && !value.includes(threeDigit[0])) {
        value += ` ${threeDigit[0]}`;
      }

      value = handleSpecialCases(value);

      // Cache the result
      patterns.titleCache = title;
      patterns.searchCache = value;

      return value;
    }

    function findPokemonName() {
      if (!Array.isArray(window.pokemonList)) return "";

      // Use cached result
      if (patterns.pokemonCache.has(title)) {
        return patterns.pokemonCache.get(title);
      }

      for (const name of window.pokemonList) {
        if (title.toLowerCase().includes(name.toLowerCase())) {
          const rx = new RegExp(`\\b${name}\\b`, "i");
          if (rx.test(title)) {
            patterns.pokemonCache.set(title, name);
            return name;
          }
        }
      }

      patterns.pokemonCache.set(title, "");
      return "";
    }

    function extractKeywords() {
      if (patterns.keywordCache.has(title)) {
        return patterns.keywordCache.get(title);
      }

      let result = "";
      const lowerTitle = title.toLowerCase();

      for (const { kw, regex } of keywordRegexes) {
        if (lowerTitle.includes(kw.toLowerCase()) && regex.test(title)) {
          result += ` ${kw}`;
        }
      }

      patterns.keywordCache.set(title, result);
      return result;
    }

    function extractCodes() {
      if (patterns.codeCache.has(title)) {
        return patterns.codeCache.get(title);
      }

      let result = "";
      for (const { regex } of codeRegexes) {
        const match = title.match(regex);
        if (match) {
          result += ` ${match[0]}`;
          break; // Only take first match for performance
        }
      }

      patterns.codeCache.set(title, result);
      return result;
    }

    function handleSpecialCases(value) {
      // Check EN codes first (most common)
      const enMatch = title.match(patterns.enMatch);
      if (enMatch) return ` ${enMatch[0]}`;

      // Check OP codes
      for (const { regex } of opRegexes) {
        const opMatch = title.match(regex);
        if (opMatch) {
          let result = opMatch[0];
          if (title.toLowerCase().includes("manga")) {
            result += " manga";
          }
          return result;
        }
      }

      return value;
    }

    // -------- Optimized UI Creation --------
    function createSidebar() {
      const sidebar = document.createElement("div");
      sidebar.className = "pokemon-ebay-sidebar";

      // Use a single style assignment
      const sidebarStyles = {
        width: "100%",
        height: "auto",
        background: "rgba(30, 30, 40, 0.65)",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        boxSizing: "border-box",
        zIndex: "10002",
        margin: "0px",
        minHeight: "56px",
        maxWidth: "calc(100%)",
        flexWrap: "wrap",
        boxShadow: "0 4px 24px 0 rgba(0,0,0,0.18)",
        border: "1.5px solid rgba(255,255,255,0.18)",
        backdropFilter: "blur(10px)",
      };
      Object.assign(sidebar.style, sidebarStyles);

      // Create all elements in one batch
      const fragment = document.createDocumentFragment();
      createCheckboxes(fragment);
      createGradeDropdown(fragment);
      sidebar.appendChild(fragment);

      return sidebar;
    }

    function createCheckboxes(parent) {
      const labels = ["fuzzy", "psa", "bgs", "cgc", "tag"];
      const persisted = JSON.parse(
        localStorage.getItem("ebayGradingCheckboxes") || "{}"
      );

      labels.forEach((label) => {
        const wrapper = document.createElement("label");
        wrapper.style.cssText =
          "display: flex; align-items: center; margin-bottom: 0; margin-right: 8px;";

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.style.marginRight = "7px";
        cb.id = `cb-${label}`;
        cb.checked = !!persisted[label];
        checkboxes[label] = cb;

        const span = document.createElement("span");
        span.textContent = label.toUpperCase();
        span.style.cssText = "color: #fff; font-size: 13px;";

        wrapper.append(cb, span);
        parent.appendChild(wrapper);

        // Use single event listener with delegation instead
        cb.addEventListener("change", saveCheckboxState);
      });
    }

    function createGradeDropdown(parent) {
      const gradeWrapper = document.createElement("div");
      gradeWrapper.className = "pokemon-ebay-grade";
      gradeWrapper.style.cssText = "display: flex; align-items: center; margin-left: 8px;";

      const gradeLabel = document.createElement("span");
      gradeLabel.textContent = "Grade:";
      gradeLabel.style.cssText = "color: #4f8cff; font-weight: bold; letter-spacing: 0.5px; font-size: 13px; margin-right: 4px;";

      gradeSelect = document.createElement("select");
      gradeSelect.style.cssText = "font-size: 15px; padding: 4px 8px; border-radius: 8px; border: 1.5px solid #4f8cff; background: rgba(255,255,255,0.18); color: #fff; font-weight: bold; box-shadow: 0 2px 8px 0 rgba(79,140,255,0.1); margin-left: 8px; width: 70px;";

      // Create options more efficiently
      const gradeOptions = ["Any", "10", "9", "9/10", "8", "6/7", "4/5", "1/2/3"];
      gradeSelect.innerHTML = gradeOptions.map(g => `<option value="${g}">${g}</option>`).join('');

      // Load persisted grade
      const persistedGrade = localStorage.getItem("ebayGradeSelect");
      if (persistedGrade) gradeSelect.value = persistedGrade;

      gradeSelect.addEventListener("change", () => {
        localStorage.setItem("ebayGradeSelect", gradeSelect.value);
        updateIframe();
      });

      gradeWrapper.append(gradeLabel, gradeSelect);
      parent.appendChild(gradeWrapper);
    }

    function createToggleButton() {
      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = "Hide Panel";
      Object.assign(toggleBtn.style, {
        position: "fixed",
        bottom: "10px",
        right: "10px",
        zIndex: "10003",
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

    function createContainer() {
      const container = document.createElement("div");
      Object.assign(container.style, {
        position: "fixed",
        bottom: "0",
        right: "0",
        width: "33vw",
        height: "70vh",
        zIndex: "10001",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        background: "transparent",
      });

      return container;
    }

    function createIframe() {
      iframe = document.createElement("iframe");
      Object.assign(iframe.style, {
        width: "100%",
        height: "calc(70vh - 60px)",
        border: "2px solid rgba(0,0,0,0.12)",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        background: "rgba(255,255,255,0.5)",
        marginLeft: "0",
        marginTop: "0",
        zIndex: "10001",
        overflowX: "hidden",
        overflowY: "auto",
      });

      iframe.addEventListener("load", handleIframeLoad);
      return iframe;
    }

    // -------- Optimized Event Handlers --------
    let updateTimeout;
    function saveCheckboxState() {
      // Debounce rapid changes
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        const state = {};
        Object.keys(checkboxes).forEach((label) => {
          state[label] = checkboxes[label].checked;
        });
        localStorage.setItem("ebayGradingCheckboxes", JSON.stringify(state));
        updateIframe();
      }, 100);
    }

    function updateIframe() {
      const checkedLabels = Object.keys(checkboxes).filter(
        (label) => label !== "fuzzy" && checkboxes[label].checked
      );

      let extra = "";
      if (checkedLabels.length > 1) {
        extra = " (" + checkedLabels.join(", ") + ")";
      } else if (checkedLabels.length === 1) {
        extra = " " + checkedLabels[0];
      }

      let baseSearch = searchValue;
      if (checkboxes.fuzzy?.checked) {
        baseSearch = baseSearch.replace(/\s*\/.*$/, "").trim();
      }

      const fullSearch = (baseSearch + extra).trim();
      const gradeParam = buildGradeParam();

      iframe.src = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(
        fullSearch
      )}&LH_Sold=1&LH_Complete=1&_dcat=183454&_ipg=60${gradeParam}`;
    }

    // Pre-build grade param map for faster lookup
    const gradeMap = {
      "9/10": "9%7C10",
      "6/7": "6%7C7",
      "4/5": "4%7C5",
      "1/2/3": "1%7C2%7C3",
    };

    function buildGradeParam() {
      const gradeVal = gradeSelect.value;
      if (!gradeVal || gradeVal === "Any") return "";
      return `&Grade=${gradeMap[gradeVal] || encodeURIComponent(gradeVal)}`;
    }

    function handleIframeLoad() {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
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
        // Cross-origin, cannot inject style
      }

      // Scroll down with retries
      const scrollDown = (top) => {
        try {
          const win = iframe.contentWindow;
          if (win && typeof win.scrollTo === "function") {
            win.scrollTo({ top, left: 0, behavior: "smooth" });
          }
        } catch (e) {
          // Cross-origin, cannot scroll programmatically
        }
      };

      scrollDown(360);
      setTimeout(() => scrollDown(360), 200);
      setTimeout(() => scrollDown(360), 600);
    }

    function setupToggleFunctionality(container, toggleBtn) {
      if (localStorage.getItem("ebayPanelVisible") === "Show Panel") {
        container.style.display = "none";
        toggleBtn.textContent = "Show Panel";
      }

      toggleBtn.onclick = function () {
        const willShow = container.style.display === "none";
        container.style.display = willShow ? "flex" : "none";
        toggleBtn.textContent = willShow ? "Hide Panel" : "Show Panel";
        localStorage.setItem("ebayPanelVisible", toggleBtn.textContent);

        if (willShow) {
          setTimeout(() => {
            try {
              const win = iframe.contentWindow;
              if (win && typeof win.scrollTo === "function") {
                win.scrollTo({ top: 360, left: 0, behavior: "smooth" });
              }
            } catch (e) {
              // Cross-origin, cannot scroll programmatically
            }
          }, 100);
        }
      };
    }

    function addResponsiveStyles() {
      // Use insertRule for better performance
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

    function hideElements() {
      const ifhEl = document.getElementById("ifhContainer");
      if (ifhEl) ifhEl.style.display = "none";
    }

    function setupElementHiding() {
      const observer = new MutationObserver(hideElements);
      observer.observe(document.body, { childList: true, subtree: true });
      hideElements();
    }

    // -------- Optimized Main Initialization --------
    function init() {
      searchValue = generateSearchValue();

      // Create all elements in batch
      const fragment = document.createDocumentFragment();
      const sidebar = createSidebar();
      const toggleBtn = createToggleButton();
      const container = createContainer();
      iframe = createIframe();

      container.append(sidebar, iframe);
      fragment.append(container, toggleBtn);
      document.body.appendChild(fragment);

      setupToggleFunctionality(container, toggleBtn);
      addResponsiveStyles();
      setupElementHiding();

      // Use requestAnimationFrame for smoother initialization
      requestAnimationFrame(() => updateIframe());
    }

    // Use requestIdleCallback if available for non-critical initialization
    if (window.requestIdleCallback) {
      requestIdleCallback(init);
    } else {
      setTimeout(init, 0);
    }
  }
})();
