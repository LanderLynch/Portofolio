(function () {
  const themeConfig = {
    defaultTheme: "light",
    storageKey: "portfolio-color-theme",
    supportedThemes: ["light"],
  };
  const supportedThemes = ["light"];
  const defaultTheme =
    typeof themeConfig.defaultTheme === "string"
      ? themeConfig.defaultTheme
      : "light";
  const storageKey = themeConfig.storageKey || "portfolio-color-theme";
  const supportedThemeSet = new Set(supportedThemes);

  function normalizeTheme(theme) {
    return supportedThemeSet.has(theme) ? theme : defaultTheme;
  }

  let storedTheme = defaultTheme;

  try {
    storedTheme = normalizeTheme(window.localStorage.getItem(storageKey));
  } catch (error) {
    storedTheme = defaultTheme;
  }

  window.portfolioThemeConfig = {
    defaultTheme,
    storageKey,
    supportedThemes: [...supportedThemes],
  };

  document.documentElement.setAttribute("data-theme", storedTheme);

  function injectBootLoader() {
    if (document.getElementById("boot-loader")) {
      return;
    }

    const loader = document.createElement("div");
    loader.id = "boot-loader";
    loader.setAttribute("aria-hidden", "true");
    loader.innerHTML = '<div class="boot-spinner"></div><div class="boot-logo-wrap"><span class="boot-logo-text">Loading</span></div>';
    document.documentElement.appendChild(loader);

    var logoImg = new Image();
    logoImg.className = "boot-logo-img";
    logoImg.alt = "";
    logoImg.onload = function () {
      var logoWrap = loader.querySelector(".boot-logo-wrap");
      if (logoWrap && !logoWrap.querySelector(".boot-logo-img")) {
        logoWrap.insertBefore(logoImg, logoWrap.firstChild);
      }
    };
    logoImg.src = "/project/assets/logo-preview/logo-lemon.png";

    const style = document.createElement("style");
    style.textContent = `
      #boot-loader {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1.2rem;
        background: var(--bg, #05101d);
        transition: opacity 0.4s ease;
      }
      .boot-spinner {
        width: 48px;
        height: 48px;
        border: 4px solid var(--border, rgba(148, 163, 184, 0.18));
        border-top-color: var(--accent, #60a5fa);
        border-radius: 50%;
        animation: boot-spin 0.8s linear infinite;
      }
      .boot-logo-wrap {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .boot-logo-img {
        width: 28px;
        height: 28px;
        object-fit: contain;
      }
      .boot-logo-text {
        color: var(--text, #e2e8f0);
        font-family: "Inter", "Segoe UI", sans-serif;
        font-size: 0.95rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      @keyframes boot-spin {
        to { transform: rotate(360deg); }
      }
      #boot-loader.is-done {
        opacity: 0;
        pointer-events: none;
      }
    `;
    document.documentElement.appendChild(style);

    let removed = false;
    function hideLoader() {
      if (removed) {
        return;
      }
      removed = true;
      loader.classList.add("is-done");
      window.setTimeout(() => {
        loader.remove();
        style.remove();
      }, 450);
    }

    if (document.readyState === "complete") {
      hideLoader();
      return;
    }

    window.addEventListener("load", hideLoader, { once: true });
    window.setTimeout(hideLoader, 4000);
  }

  injectBootLoader();
})();
