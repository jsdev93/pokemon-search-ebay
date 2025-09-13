(function () {
  // Only run on eBay item pages
  if (
    window.location.hostname === "www.ebay.com" &&
    window.location.pathname.startsWith("/itm/")
  ) {
    // Cache title once
    const title = document.title || "";

    // -------- Build searchValue (no logic changes) --------
    // Find Pokémon name from window.pokemonList if available
    let foundPokemon = "";
    if (Array.isArray(window.pokemonList)) {
      for (const name of window.pokemonList) {
        const rx = new RegExp(`\\b${name}\\b`, "i");
        if (rx.test(title)) {
          foundPokemon = name;
          break;
        }
      }
    }

    // Slash pattern match (e.g., 162/131)
    const slashMatch = title.match(/([^\s\/]+)\s*\/\s*([^\s\/]+)/);

    let searchValue = "";
    if (slashMatch) {
      searchValue = `${slashMatch[1]}/${slashMatch[2]}`;
    }

    // Always append foundPokemon if present
    if (foundPokemon) {
      searchValue = foundPokemon + (searchValue ? " " + searchValue : "");
    }

    // Keywords (append if present)
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
    keywords.forEach((kw) => {
      if (new RegExp(kw, "i").test(title)) {
        searchValue += ` ${kw}`;
      }
    });

    // Append whole word containing these codes
    ["swsh", "sm", "bw", "xy", "svp"].forEach((code) => {
      const m = title.match(new RegExp(`\\b\\w*${code}\\w*\\b`, "i"));
      if (m) searchValue += ` ${m[0]}`;
    });

    const threeDigit = title.match(/\b\d{2,3}\b/);
    if (threeDigit && !searchValue.includes(threeDigit[0])) {
      searchValue += ` ${threeDigit[0]}`;
    }

    // For Yugioh: if EN code present, use only that
    const enMatch = title.match(/\b[\w-]+-EN\d+\b/i);
    if (enMatch) {
      // Preserve original behavior (leading space)
      searchValue = ` ${enMatch[0]}`;
    }

    // One Piece OP codes (override searchValue if matched)
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
    for (const code of opCodes) {
      const rx = new RegExp(`\\b${code}-\\d+\\b`, "i");
      const opMatch = title.match(rx);
      if (opMatch) {
        searchValue = opMatch[0];
        if (/manga/i.test(title)) {
          searchValue += " manga";
        }
        break;
      }
    }

    // -------- Sidebar UI --------
    const sidebar = document.createElement("div");
    Object.assign(sidebar.style, {
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
    });

    const labels = ["fuzzy", "psa", "bgs", "cgc", "tag"];
    const checkboxes = {};
    // Load persisted checkbox states
    const persisted = JSON.parse(
      localStorage.getItem("ebayGradingCheckboxes") || "{}"
    );
    labels.forEach((label) => {
      const wrapper = document.createElement("label");
      Object.assign(wrapper.style, {
        display: "flex",
        alignItems: "center",
        marginBottom: "0",
        marginRight: "8px",
      });

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.style.marginRight = "7px";
      cb.id = `cb-${label}`;
      cb.checked = !!persisted[label];
      checkboxes[label] = cb;

      const span = document.createElement("span");
      span.textContent = label.toUpperCase();
      span.style.color = "#fff";
      span.style.fontSize = "13px";

      wrapper.appendChild(cb);
      wrapper.appendChild(span);
      sidebar.appendChild(wrapper);
    });

    // Grade dropdown
    const gradeWrapper = document.createElement("div");
    Object.assign(gradeWrapper.style, {
      display: "flex",
      alignItems: "center",
      marginLeft: "8px",
    });

    const gradeLabel = document.createElement("span");
    gradeLabel.textContent = "Grade:";
    Object.assign(gradeLabel.style, {
      color: "#4f8cff",
      fontWeight: "bold",
      letterSpacing: "0.5px",
      fontSize: "13px",
      marginRight: "4px",
    });

    const gradeSelect = document.createElement("select");
    Object.assign(gradeSelect.style, {
      fontSize: "15px",
      padding: "4px 8px",
      borderRadius: "8px",
      border: "1.5px solid #4f8cff",
      background: "rgba(255,255,255,0.18)",
      color: "#fff",
      fontWeight: "bold",
      boxShadow: "0 2px 8px 0 rgba(79,140,255,0.1)",
      marginLeft: "8px",
      width: "70px",
    });

    const gradeOptions = ["Any", "10", "9", "9/10", "8", "6/7", "4/5", "1/2/3"];
    gradeOptions.forEach((g) => {
      const opt = document.createElement("option");
      opt.value = g;
      opt.textContent = g;
      gradeSelect.appendChild(opt);
    });

    gradeWrapper.appendChild(gradeLabel);
    gradeWrapper.appendChild(gradeSelect);
    sidebar.appendChild(gradeWrapper);

    // Persist grade selection
    const persistedGrade = localStorage.getItem("ebayGradeSelect");
    if (persistedGrade) gradeSelect.value = persistedGrade;

    // -------- Container / Toggle / Iframe --------
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

    if (localStorage.getItem("ebayPanelVisible") === "Show Panel") {
      container.style.display = "none";
      toggleBtn.textContent = "Show Panel";
    } else {
      container.style.display = "flex";
      toggleBtn.textContent = "Hide Panel";
    }

    toggleBtn.onclick = function () {
      const willShow = container.style.display === "none";
      container.style.display = willShow ? "flex" : "none";
      toggleBtn.textContent = willShow ? "Hide Panel" : "Show Panel";
      localStorage.setItem("ebayPanelVisible", toggleBtn.textContent);
    };

    // Create iframe
    const iframe = document.createElement("iframe");
    Object.assign(iframe.style, {
      width: "100%",
      height: "calc(80vh - " + sidebar.offsetHeight + "px)",
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

    // -------- Single updateIframe (no logic changes) --------
    function updateIframe() {
      let extra = "";
      // Get all checked labels except fuzzy
      const checkedLabels = labels.filter(
        (label) =>
          label !== "fuzzy" && checkboxes[label] && checkboxes[label].checked
      );

      // If multiple labels are checked, group them with parentheses and commas
      if (checkedLabels.length > 1) {
        extra += " (" + checkedLabels.join(", ") + ")";
      } else if (checkedLabels.length === 1) {
        extra += " " + checkedLabels[0];
      }

      let gradeVal = gradeSelect.value;
      let baseSearch = searchValue;

      // Remove number and slash if fuzzy is checked
      if (checkboxes["fuzzy"] && checkboxes["fuzzy"].checked) {
        baseSearch = baseSearch.replace(/\s*\/.*$/, "").trim();
      }

      let fullSearch = (baseSearch + extra).trim();

      // Append grades to URL param (not into search string)
      let gradeParam = "";
      if (gradeVal && gradeVal !== "Any") {
        if (gradeVal === "9/10") {
          gradeParam = "&Grade=9%7C10";
        } else if (gradeVal === "6/7") {
          gradeParam = "&Grade=6%7C7";
        } else if (gradeVal === "4/5") {
          gradeParam = "&Grade=4%7C5";
        } else if (gradeVal === "1/2/3") {
          gradeParam = "&Grade=1%7C2%7C3";
        } else {
          gradeParam = `&Grade=${encodeURIComponent(gradeVal)}`;
        }
      }

      iframe.src = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(
        fullSearch
      )}&LH_Sold=1&LH_Complete=1&_dcat=183454&_ipg=60${gradeParam}`;
    }

    // Persist grade and update on change
    gradeSelect.addEventListener("change", () => {
      localStorage.setItem("ebayGradeSelect", gradeSelect.value);
      updateIframe();
    });

    // Add event listeners to checkboxes and persist
    labels.forEach((label) => {
      checkboxes[label].addEventListener("change", function () {
        const state = {};
        labels.forEach((l) => {
          state[l] = checkboxes[l].checked;
        });
        localStorage.setItem("ebayGradingCheckboxes", JSON.stringify(state));
        updateIframe();
      });
    });

    // Compose DOM
    container.appendChild(sidebar);
    container.appendChild(iframe);
    document.body.appendChild(container);
    document.body.appendChild(toggleBtn);

    // Initial load
    updateIframe();

    // Prevent horizontal scroll in iframe (try-catch for cross-origin)
    iframe.addEventListener("load", function () {
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

      // Try to scroll the iframe content down a bit
      try {
        const win = iframe.contentWindow;
        const scrollDown = (top) => {
          if (win && typeof win.scrollTo === "function") {
            win.scrollTo({ top, left: 0, behavior: "smooth" });
          }
        };
        // Initial and a couple of retries for late content shifts
        scrollDown(360);
        setTimeout(() => scrollDown(360), 200);
        setTimeout(() => scrollDown(360), 600);
      } catch (e) {
        // Cross-origin, cannot scroll programmatically
      }
    });

    // Responsive styles (unchanged)
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      @media (max-width: 700px) {
        .pokemon-ebay-sidebar {
          flex-direction: column !important;
          min-width: 0 !important;
          max-width: 100vw !important;
          width: 100vw !important;
          margin: 0 !important;
          padding: 8px 2vw !important;
          border-radius: 0 0 16px 16px !important;
          font-size: 12px !important;
        }
        .pokemon-ebay-sidebar label {
          margin: 4px 0 !important;
          width: 100%;
          justify-content: flex-start;
        }
        .pokemon-ebay-grade {
          margin-left: 0 !important;
          margin-top: 8px !important;
        }
      }
      @media (max-width: 700px), (max-width: 500px), (max-width: 400px) {
        .pokemon-ebay-sidebar {
          flex-wrap: wrap !important;
          align-items: flex-start !important;
          min-height: 120px !important;
          height: auto !important;
        }
        .pokemon-ebay-sidebar label {
          flex: 1 1 100%;
          min-width: 120px;
          margin-bottom: 6px !important;
        }
      }
    `;
    document.head.appendChild(styleTag);

    // Add classes (unchanged)
    sidebar.classList.add("pokemon-ebay-sidebar");
    gradeWrapper.classList.add("pokemon-ebay-grade");

    const hideElements = () => {
      const ifhEl = document.getElementById("ifhContainer");
      if (ifhEl) ifhEl.style.display = "none";
    };

    // Set up observer to hide elements whenever they appear
    const observer = new MutationObserver(() => {
      hideElements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    hideElements();
  }
})();
