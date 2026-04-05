(function () {
  const themeConfig = window.portfolioThemeConfig || {
    defaultTheme: "light",
    storageKey: "portfolio-color-theme",
    supportedThemes: ["blue", "light", "galaxy"],
  };
  const supportedThemes = Array.isArray(themeConfig.supportedThemes)
    ? [...themeConfig.supportedThemes]
    : ["blue", "light", "galaxy"];
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
})();
