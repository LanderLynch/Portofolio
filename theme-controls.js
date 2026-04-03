(function () {
  const storageKey = "portfolio-color-theme";
  const supportedThemes = ["blue", "light", "galaxy"];
  const supportedThemeSet = new Set(supportedThemes);
  let hasBoundThemeEvents = false;
  let hasInitializedThemeControls = false;

  function normalizeTheme(theme) {
    return supportedThemeSet.has(theme) ? theme : "light";
  }

  function getStoredTheme() {
    try {
      return normalizeTheme(window.localStorage.getItem(storageKey));
    } catch (error) {
      return "light";
    }
  }

  function persistTheme(theme) {
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch (error) {
      // Ignore storage access errors and keep the in-memory theme applied.
    }
  }

  function syncThemeAttributes(theme) {
    const nextTheme = normalizeTheme(theme);
    document.documentElement.setAttribute("data-theme", nextTheme);

    if (document.body) {
      document.body.setAttribute("data-theme", nextTheme);
    }

    return nextTheme;
  }

  function syncThemeButtons(theme, root) {
    const nextTheme = normalizeTheme(theme);
    const scope = root || document;

    scope.querySelectorAll("[data-theme-value]").forEach((button) => {
      const isActive = button.dataset.themeValue === nextTheme;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function applyTheme(theme, options) {
    const persistSelection = options?.persist !== false;
    const nextTheme = syncThemeAttributes(theme);

    syncThemeButtons(nextTheme);

    if (persistSelection) {
      persistTheme(nextTheme);
    }

    document.dispatchEvent(
      new CustomEvent("portfolio-theme-change", {
        detail: { theme: nextTheme },
      }),
    );

    return nextTheme;
  }

  function handleThemeSelection(event) {
    const themeButton = event.target.closest("[data-theme-value]");

    if (!themeButton) {
      return;
    }

    applyTheme(themeButton.dataset.themeValue);
  }

  function bindThemeControls() {
    if (hasBoundThemeEvents) {
      return;
    }

    document.addEventListener("click", handleThemeSelection);
    hasBoundThemeEvents = true;
  }

  function handleStorageSync(event) {
    if (event.key === storageKey) {
      applyTheme(event.newValue, { persist: false });
    }
  }

  function initThemeControls() {
    const activeTheme = applyTheme(getStoredTheme(), { persist: false });

    bindThemeControls();

    if (!hasInitializedThemeControls) {
      window.addEventListener("storage", handleStorageSync);
      hasInitializedThemeControls = true;
    }

    return activeTheme;
  }

  window.portfolioTheme = {
    applyTheme,
    getStoredTheme,
    initThemeControls,
    normalizeTheme,
    storageKey,
    supportedThemes: [...supportedThemes],
    syncThemeButtons,
  };

  initThemeControls();
})();
