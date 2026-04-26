(function () {
  const revealSelector = ".project-card, .certification-card, .certificate-card";
  const resolutionScaleConfig = {
    minWidth: 1024,
    maxWidth: 1920,
    minZoom: 70,
    maxZoom: 80,
    resizeDelay: 120,
  };
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

  function debounce(callback, delay) {
    let timer = 0;

    return function debouncedCallback() {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        window.requestAnimationFrame(callback);
      }, delay);
    };
  }

  function calculateResolutionZoom(width = window.innerWidth) {
    const { minWidth, maxWidth, minZoom, maxZoom } = resolutionScaleConfig;

    if (width <= minWidth) {
      return minZoom;
    }

    if (width >= maxWidth) {
      return maxZoom;
    }

    const progress = (width - minWidth) / (maxWidth - minWidth);
    return Math.round((minZoom + (maxZoom - minZoom) * progress) * 10) / 10;
  }

  function injectResolutionScaleStyle() {
    if (document.getElementById("portfolio-resolution-scale-style")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "portfolio-resolution-scale-style";
    style.textContent = `
      html.portfolio-resolution-scale body {
        zoom: var(--page-zoom, 0.8) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function applyResolutionScale() {
    const zoomPercent = calculateResolutionZoom();
    const zoomValue = String(zoomPercent / 100);

    document.documentElement.classList.add("portfolio-resolution-scale");
    document.documentElement.style.setProperty("--page-zoom", zoomValue);
    document.documentElement.style.setProperty("--global-scale", zoomValue);

    if (document.body) {
      document.body.classList.add("zoom-ready");
      document.body.style.setProperty("--page-zoom", zoomValue);
      document.body.style.setProperty("--global-scale", zoomValue);
    }

    window.portfolioResolutionScale = {
      apply: applyResolutionScale,
      calculateZoomPercent: calculateResolutionZoom,
      getZoomPercent: () => zoomPercent,
    };

    return zoomPercent;
  }

  function injectPremiumFont() {
    const fontHref =
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";

    if (document.querySelector(`link[href="${fontHref}"]`)) {
      return;
    }

    const googlePreconnect = document.createElement("link");
    googlePreconnect.rel = "preconnect";
    googlePreconnect.href = "https://fonts.googleapis.com";

    const gstaticPreconnect = document.createElement("link");
    gstaticPreconnect.rel = "preconnect";
    gstaticPreconnect.href = "https://fonts.gstatic.com";
    gstaticPreconnect.crossOrigin = "";

    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = fontHref;

    document.head.append(googlePreconnect, gstaticPreconnect, fontLink);
  }

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

  injectResolutionScaleStyle();
  applyResolutionScale();
  window.addEventListener(
    "resize",
    debounce(applyResolutionScale, resolutionScaleConfig.resizeDelay),
    { passive: true },
  );

  injectPremiumFont();
  document.documentElement.setAttribute("data-theme", storedTheme);

  function initTopLoadingLine() {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const loadingLine = document.createElement("div");
    loadingLine.className = "portfolio-loading-line";
    loadingLine.setAttribute("aria-hidden", "true");
    document.body.prepend(loadingLine);

    requestAnimationFrame(() => {
      loadingLine.classList.add("is-running");
    });

    window.addEventListener(
      "load",
      () => {
        loadingLine.classList.add("is-complete");
        window.setTimeout(() => loadingLine.remove(), 360);
      },
      { once: true },
    );
  }

  function markVisible(element, index) {
    element.style.transitionDelay = `${Math.min(index, 8) * 55}ms`;
    element.classList.add("is-visible");
    window.setTimeout(() => {
      element.style.transitionDelay = "";
    }, 700);
  }

  function initScrollReveals() {
    const revealItems = Array.from(document.querySelectorAll(revealSelector));

    if (!revealItems.length) {
      return;
    }

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    document.documentElement.classList.add("portfolio-reveal-ready");

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach(markVisible);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const index = revealItems.indexOf(entry.target);
          markVisible(entry.target, index);
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12,
      },
    );

    revealItems.forEach((item) => observer.observe(item));

    if ("MutationObserver" in window) {
      const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (!(node instanceof HTMLElement)) {
              return;
            }

            const newItems = [
              ...(node.matches(revealSelector) ? [node] : []),
              ...node.querySelectorAll(revealSelector),
            ];

            newItems.forEach((item) => {
              revealItems.push(item);
              observer.observe(item);
            });
          });
        });
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }

  function initPremiumUi() {
    applyResolutionScale();
    initTopLoadingLine();
    initScrollReveals();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPremiumUi, { once: true });
  } else {
    initPremiumUi();
  }
})();
