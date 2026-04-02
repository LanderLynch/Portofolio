(function () {
  const storageKey = "portfolio-color-theme";
  const supportedThemes = new Set(["blue", "light", "galaxy"]);
  const themeButtons = Array.from(document.querySelectorAll("[data-theme-value]"));

  function normalizeTheme(theme) {
    return supportedThemes.has(theme) ? theme : "light";
  }

  function applyTheme(theme) {
    const nextTheme = normalizeTheme(theme);
    document.body.setAttribute("data-theme", nextTheme);

    themeButtons.forEach((button) => {
      const isActive = button.dataset.themeValue === nextTheme;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    localStorage.setItem(storageKey, nextTheme);
    return nextTheme;
  }

  const savedTheme = localStorage.getItem(storageKey);
  applyTheme(savedTheme);

  themeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      applyTheme(button.dataset.themeValue);
    });
  });

  window.addEventListener("storage", function (event) {
    if (event.key === storageKey) {
      applyTheme(event.newValue);
    }
  });
})();
