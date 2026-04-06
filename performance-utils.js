(function () {
  const IMAGE_NEAR_VIEWPORT_OFFSET = 280;

  function isNearViewport(element) {
    if (!element || typeof element.getBoundingClientRect !== "function") {
      return false;
    }

    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight + IMAGE_NEAR_VIEWPORT_OFFSET;
  }

  function applyResponsiveImageAttributes(image) {
    if (image.dataset.srcset && !image.hasAttribute("srcset")) {
      image.setAttribute("srcset", image.dataset.srcset);
    }

    if (image.dataset.sizes && !image.hasAttribute("sizes")) {
      image.setAttribute("sizes", image.dataset.sizes);
    }
  }

  function optimizeImage(image) {
    if (!(image instanceof HTMLImageElement) || image.dataset.perfOptimized === "true") {
      return;
    }

    applyResponsiveImageAttributes(image);

    if (!image.hasAttribute("decoding")) {
      image.decoding = "async";
    }

    if (!image.hasAttribute("fetchpriority") && !isNearViewport(image)) {
      image.setAttribute("fetchpriority", "low");
    }

    if (!image.hasAttribute("loading")) {
      image.loading = image.dataset.priority === "high" || isNearViewport(image) ? "eager" : "lazy";
    }

    image.dataset.perfOptimized = "true";
  }

  function hydrateDeferredImage(image) {
    if (!(image instanceof HTMLImageElement) || image.dataset.deferredHydrated === "true") {
      return;
    }

    if (image.dataset.src && !image.getAttribute("src")) {
      image.src = image.dataset.src;
    }

    applyResponsiveImageAttributes(image);
    optimizeImage(image);
    image.dataset.deferredHydrated = "true";
  }

  function applyImageOptimizations(root) {
    const scope = root || document;
    scope.querySelectorAll("img").forEach(optimizeImage);
  }

  function observeDeferredImages(root) {
    const scope = root || document;
    const deferredImages = Array.from(scope.querySelectorAll("img[data-src], img[data-srcset]")).filter((image) => image.dataset.deferredHydrated !== "true");

    if (!deferredImages.length) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      deferredImages.forEach(hydrateDeferredImage);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        hydrateDeferredImage(entry.target);
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: "240px 0px"
    });

    deferredImages.forEach((image) => observer.observe(image));
  }

  function observeMutations() {
    if (!("MutationObserver" in window)) {
      return;
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) {
            return;
          }

          if (node.matches("img")) {
            optimizeImage(node);
            if (node.dataset.src || node.dataset.srcset) {
              observeDeferredImages(node.parentElement || document);
            }
          }

          if (typeof node.querySelectorAll === "function") {
            applyImageOptimizations(node);
            observeDeferredImages(node);
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || window.location.protocol === "file:") {
      return;
    }

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/performance-sw.js").catch((error) => {
        console.warn("Performance service worker registration failed.", error);
      });
    }, { once: true });
  }

  function initPerformanceUtilities() {
    applyImageOptimizations(document);
    observeDeferredImages(document);
    observeMutations();
    registerServiceWorker();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPerformanceUtilities, { once: true });
  } else {
    initPerformanceUtilities();
  }

  window.portfolioPerformance = {
    applyImageOptimizations,
    observeDeferredImages
  };
})();
