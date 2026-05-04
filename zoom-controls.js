(function () {
  const zoomControl = document.getElementById("page-zoom-control");
  const zoomToggle = document.getElementById("page-zoom-toggle");
  const zoomPanel = document.getElementById("page-zoom-panel");
  const zoomOut = document.getElementById("page-zoom-out");
  const zoomIn = document.getElementById("page-zoom-in");
  const zoomValue = document.getElementById("page-zoom-value");

  if (!zoomControl || !zoomToggle || !zoomPanel || !zoomOut || !zoomIn || !zoomValue) {
    return;
  }

  const storageKey = "portfolio-shared-page-zoom";
  const defaultZoom = 80;
  const minZoom = 60;
  const maxZoom = 120;
  const step = 10;

  function clampZoom(value) {
    return Math.min(maxZoom, Math.max(minZoom, value));
  }

  function applyZoom(value) {
    const zoom = clampZoom(value);
    document.body.classList.add("zoom-ready");
    document.body.style.setProperty("--page-zoom", String(zoom / 100));
    zoomValue.textContent = `${zoom}%`;
    localStorage.setItem(storageKey, String(zoom));
    return zoom;
  }

  function setPanelState(isOpen) {
    zoomControl.classList.toggle("open", isOpen);
    zoomToggle.setAttribute("aria-expanded", String(isOpen));
    zoomPanel.setAttribute("aria-hidden", String(!isOpen));
  }

  let currentZoom = applyZoom(defaultZoom);

  zoomToggle.addEventListener("click", function () {
    setPanelState(!zoomControl.classList.contains("open"));
  });

  zoomOut.addEventListener("click", function () {
    currentZoom = applyZoom(currentZoom - step);
  });

  zoomIn.addEventListener("click", function () {
    currentZoom = applyZoom(currentZoom + step);
  });

  zoomValue.addEventListener("click", function () {
    currentZoom = applyZoom(defaultZoom);
  });

  document.addEventListener("click", function (event) {
    if (!zoomControl.contains(event.target)) {
      setPanelState(false);
    }
  });
})();
