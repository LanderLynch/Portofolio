(function () {
  let windows = Array.from(document.querySelectorAll("[data-window]"));
  const desktopStage = document.querySelector(".desktop-stage");
  const triggers = Array.from(document.querySelectorAll("[data-window-target]"));
  const clock = document.getElementById("desktop-clock");
  const taskbarRecents = document.getElementById("taskbar-recents");
  const windowLabels = {
    about: "About",
    projects: "Project",
    skills: "Skill tree",
    experience: "Experience",
    achievement: "Achievement",
    browser: "Browser",
    guestbook: "Guestbook"
  };
  const browserInstances = new Map();
  let topZ = 100;
  let activeDrag = null;
  let activeResize = null;
  let nextBrowserWindowId = 2;

  function getDesktopScale() {
    return Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--desktop-zoom")) || 1;
  }

  function focusWindow(windowElement) {
    if (!windowElement) {
      return;
    }

    topZ += 1;
    windows.forEach((item) => item.classList.remove("is-focused"));
    windowElement.classList.add("is-focused");
    windowElement.style.zIndex = String(topZ);
    syncRecentActive(windowElement.dataset.window);
  }

  function syncRecentActive(activeName) {
    taskbarRecents?.querySelectorAll("[data-taskbar-window]").forEach((button) => {
      const windowElement = document.querySelector(`[data-window="${button.dataset.taskbarWindow}"]`);
      const isOpen = windowElement?.classList.contains("is-open");
      button.classList.toggle("is-active", isOpen && button.dataset.taskbarWindow === activeName);
    });
  }

  function addRecentWindow(name) {
    if (!taskbarRecents || !name) {
      return;
    }

    const existingButton = taskbarRecents.querySelector(`[data-taskbar-window="${name}"]`);
    if (existingButton) {
      taskbarRecents.prepend(existingButton);
      syncRecentActive(name);
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "recent-window-btn";
    button.dataset.taskbarWindow = name;
    button.textContent = windowLabels[name] || name;
    button.setAttribute("aria-label", `Open ${windowLabels[name] || name} window`);
    button.addEventListener("click", () => openWindow(name));
    taskbarRecents.prepend(button);
    syncRecentActive(name);
  }

  function removeRecentWindow(name) {
    taskbarRecents?.querySelector(`[data-taskbar-window="${name}"]`)?.remove();
    syncRecentActive(null);
  }

  function openWindow(name) {
    const windowElement = document.querySelector(`[data-window="${name}"]`);

    if (!windowElement) {
      return;
    }

    windowElement.classList.remove("is-closing");
    windowElement.classList.add("is-open");
    focusWindow(windowElement);
    addRecentWindow(name);
  }

  function closeWindow(windowElement) {
    if (!windowElement || !windowElement.classList.contains("is-open")) {
      return;
    }

    windowElement.classList.remove("is-open", "is-maximized");
    windowElement.classList.add("is-closing");
    removeRecentWindow(windowElement.dataset.window);

    window.setTimeout(() => {
      windowElement.classList.remove("is-closing", "is-focused");
      syncRecentActive(null);
    }, 260);
  }

  function toggleMaximize(windowElement) {
    if (!windowElement) {
      return;
    }

    if (windowElement.classList.contains("is-maximized")) {
      const restore = windowElement.dataset.restoreFrame ? JSON.parse(windowElement.dataset.restoreFrame) : null;
      windowElement.classList.remove("is-maximized");

      if (restore) {
        windowElement.style.left = restore.left;
        windowElement.style.top = restore.top;
        windowElement.style.width = restore.width;
        windowElement.style.height = restore.height;
      }

      focusWindow(windowElement);
      return;
    }

    const bounds = getViewportBounds();
    const rootStyles = getComputedStyle(document.documentElement);
    const topBarHeight = Number.parseFloat(rootStyles.getPropertyValue("--top-bar-height")) || 38;
    const taskbarHeight = Number.parseFloat(rootStyles.getPropertyValue("--taskbar-height")) || 76;
    const margin = 24;
    const top = topBarHeight + 14;
    const bottomSpace = taskbarHeight + 24;
    const maxWidth = Math.min(1440, bounds.width - margin * 2);
    const nextWidth = Math.max(Math.min(windowElement.offsetWidth, maxWidth), Math.min(maxWidth, bounds.width - margin * 2));
    const nextHeight = Math.max(320, bounds.height - top - bottomSpace);
    const nextLeft = Math.max(margin, (bounds.width - nextWidth) / 2);

    windowElement.dataset.restoreFrame = JSON.stringify({
      left: windowElement.style.left || `${windowElement.offsetLeft}px`,
      top: windowElement.style.top || `${windowElement.offsetTop}px`,
      width: windowElement.style.width || `${windowElement.offsetWidth}px`,
      height: windowElement.style.height || `${windowElement.offsetHeight}px`
    });

    windowElement.classList.add("is-maximized");
    windowElement.style.left = `${nextLeft}px`;
    windowElement.style.top = `${top}px`;
    windowElement.style.width = `${nextWidth}px`;
    windowElement.style.height = `${nextHeight}px`;
    focusWindow(windowElement);
  }

  function getBrowserTabTitle(link) {
    if (link.dataset.browserTab) {
      return link.dataset.browserTab;
    }

    return link.textContent.trim() || link.getAttribute("href") || "Portfolio Page";
  }

  function isPortfolioPageLink(link) {
    const href = link.getAttribute("href") || "";

    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return false;
    }

    const path = href.split(/[?#]/)[0];
    return path.endsWith(".html") || /^https?:\/\//i.test(href);
  }

  function createBrowserInstance(windowElement) {
    const name = windowElement.dataset.window;
    const instance = {
      name,
      windowElement,
      tabs: [],
      activeTabId: null,
      nextTabId: 1,
      tabbar: windowElement.querySelector(".browser-tabbar"),
      frame: windowElement.querySelector(".browser-frame"),
      address: windowElement.querySelector(".browser-address-input")
    };

    instance.address?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") {
        return;
      }

      event.preventDefault();
      navigateActiveTab(instance, instance.address.value);
    });

    instance.frame?.addEventListener("load", () => {
      try {
        prepareFrameDocument(instance);
      } catch (error) {
        // Cross-origin pages may block frame access. That is expected for some sites.
      }
    });

    browserInstances.set(name, instance);
    return instance;
  }

  function getBrowserInstance(name = "browser") {
    const existing = browserInstances.get(name);

    if (existing) {
      return existing;
    }

    const windowElement = document.querySelector(`[data-window="${name}"]`);
    return windowElement ? createBrowserInstance(windowElement) : null;
  }

  function renderBrowserTabs(instance) {
    if (!instance?.tabbar) {
      return;
    }

    instance.tabbar.replaceChildren();

    instance.tabs.forEach((tab) => {
      const tabButton = document.createElement("button");
      tabButton.type = "button";
      tabButton.className = `browser-tab${tab.id === instance.activeTabId ? " is-active" : ""}`;
      tabButton.dataset.browserTabId = String(tab.id);
      tabButton.setAttribute("role", "tab");
      tabButton.setAttribute("aria-selected", String(tab.id === instance.activeTabId));

      const title = document.createElement("span");
      title.className = "browser-tab-title";
      title.textContent = tab.title;

      const closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.className = "browser-tab-close";
      closeButton.setAttribute("aria-label", `Close ${tab.title}`);
      closeButton.textContent = "x";

      closeButton.addEventListener("click", (event) => {
        event.stopPropagation();
        closeBrowserTab(instance, tab.id);
      });

      bindTabDrag(tabButton, instance, tab.id);
      tabButton.append(title, closeButton);
      instance.tabbar.appendChild(tabButton);
    });
  }

  function activateBrowserTab(instance, tabId) {
    const tab = instance?.tabs.find((item) => item.id === tabId);

    if (!instance || !tab || !instance.frame || !instance.address) {
      return;
    }

    instance.activeTabId = tab.id;
    instance.frame.src = tab.href;
    instance.address.value = tab.href;
    renderBrowserTabs(instance);
    openWindow(instance.name);
  }

  function addBrowserTab(instance, href, title) {
    const tab = {
      id: instance.nextTabId,
      href,
      title: title || href
    };

    instance.nextTabId += 1;
    instance.tabs.push(tab);
    activateBrowserTab(instance, tab.id);
    return tab;
  }

  function openBrowserTab(href, title, browserName = "browser") {
    const instance = getBrowserInstance(browserName);

    if (!instance) {
      return;
    }

    addBrowserTab(instance, href, title);
  }

  function closeBrowserTab(instance, tabId) {
    const tabIndex = instance.tabs.findIndex((tab) => tab.id === tabId);

    if (tabIndex === -1) {
      return null;
    }

    const wasActive = instance.tabs[tabIndex].id === instance.activeTabId;
    const removed = instance.tabs.splice(tabIndex, 1)[0];

    if (!instance.tabs.length) {
      instance.activeTabId = null;
      instance.frame?.removeAttribute("src");
      if (instance.address) {
        instance.address.value = "Open a portfolio page";
      }
      renderBrowserTabs(instance);
      return removed;
    }

    if (wasActive) {
      const nextTab = instance.tabs[Math.max(0, tabIndex - 1)];
      activateBrowserTab(instance, nextTab.id);
      return removed;
    }

    renderBrowserTabs(instance);
    return removed;
  }

  function normalizeAddress(value) {
    const rawValue = String(value || "").trim();

    if (!rawValue) {
      return "";
    }

    if (rawValue.toLowerCase() === "google") {
      return "https://www.google.com/webhp?igu=1";
    }

    if (/^https?:\/\//i.test(rawValue)) {
      return rawValue;
    }

    if (rawValue.endsWith(".html") || rawValue.startsWith("project/") || rawValue.startsWith("./") || rawValue.startsWith("../")) {
      return rawValue;
    }

    if (/^[^\s]+\.[^\s]+$/.test(rawValue)) {
      return `https://${rawValue}`;
    }

    return `https://www.google.com/search?igu=1&q=${encodeURIComponent(rawValue)}`;
  }

  function navigateActiveTab(instance, value) {
    const href = normalizeAddress(value);
    const tab = instance.tabs.find((item) => item.id === instance.activeTabId);

    if (!href) {
      return;
    }

    if (!tab) {
      addBrowserTab(instance, href, value.trim() || href);
      return;
    }

    tab.href = href;
    tab.title = value.trim() || href;
    activateBrowserTab(instance, tab.id);
  }

  function prepareFrameDocument(instance) {
    if (!instance.frame?.contentDocument) {
      return;
    }

    const doc = instance.frame.contentDocument;
    const style = doc.createElement("style");
    style.textContent = `
      .back-btn,
      a[href*="index.html"].cta-btn,
      a[href*="index.html"].action-btn {
        display: none !important;
      }
    `;
    doc.head.appendChild(style);

    doc.querySelectorAll('a[href*="index.html"]').forEach((link) => {
      const text = link.textContent.trim().toLowerCase();
      if (
        text.includes("back to portfolio") ||
        text.includes("back to portofolio") ||
        text.includes("back to home") ||
        text.includes("back to projects") ||
        text.includes("kembali")
      ) {
        link.remove();
      }
    });

    doc.addEventListener("click", (event) => {
      const link = event.target.closest?.("a[href]");

      if (!link || !isPortfolioPageLink(link)) {
        return;
      }

      event.preventDefault();
      openBrowserTab(link.getAttribute("href"), getBrowserTabTitle(link), instance.name);
    });
  }

  function bindTabDrag(tabButton, instance, tabId) {
    let drag = null;

    function removeGhost() {
      drag?.ghost?.remove();
      if (drag) {
        drag.ghost = null;
      }
    }

    function moveGhost(event) {
      if (!drag?.ghost) {
        return;
      }

      drag.ghost.style.left = `${event.clientX}px`;
      drag.ghost.style.top = `${event.clientY}px`;
    }

    tabButton.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || event.target.closest(".browser-tab-close")) {
        return;
      }

      drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        moved: false
      };
      tabButton.setPointerCapture(event.pointerId);
    });

    tabButton.addEventListener("pointermove", (event) => {
      if (!drag || event.pointerId !== drag.pointerId) {
        return;
      }

      const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
      if (distance > 10) {
        drag.moved = true;
        tabButton.classList.add("is-dragging");
        if (!drag.ghost) {
          const tab = instance.tabs.find((item) => item.id === tabId);
          drag.ghost = document.createElement("div");
          drag.ghost.className = "tab-drag-ghost";
          drag.ghost.textContent = tab?.title || "Tab";
          document.body.appendChild(drag.ghost);
        }
        moveGhost(event);
      }
    });

    tabButton.addEventListener("pointerup", (event) => {
      if (!drag || event.pointerId !== drag.pointerId) {
        return;
      }

      tabButton.classList.remove("is-dragging");
      removeGhost();
      tabButton.releasePointerCapture(event.pointerId);

      const tabbarRect = instance.tabbar.getBoundingClientRect();
      const isOutsideTabbar =
        event.clientY < tabbarRect.top - 20 ||
        event.clientY > tabbarRect.bottom + 42 ||
        event.clientX < tabbarRect.left - 40 ||
        event.clientX > tabbarRect.right + 40;

      if (drag.moved && isOutsideTabbar) {
        detachBrowserTab(instance, tabId, event.clientX, event.clientY);
      } else {
        activateBrowserTab(instance, tabId);
      }

      drag = null;
    });

    tabButton.addEventListener("pointercancel", () => {
      tabButton.classList.remove("is-dragging");
      removeGhost();
      drag = null;
    });
  }

  function createBrowserWindowElement(name, title) {
    const section = document.createElement("section");
    section.className = "desktop-window browser-window";
    section.dataset.window = name;
    section.setAttribute("aria-labelledby", `${name}-title`);
    section.innerHTML = `
      <div class="window-titlebar">
        <div class="traffic-lights">
          <button class="traffic maximize" type="button" data-window-maximize aria-label="Maximize Browser"></button>
          <button class="traffic close" type="button" data-window-close aria-label="Close Browser"></button>
        </div>
        <p id="${name}-title">${title || "Portfolio Browser"}</p>
      </div>
      <div class="browser-shell">
        <div class="browser-tabbar" role="tablist" aria-label="Open page tabs"></div>
        <div class="browser-addressbar">
          <span class="browser-lock" aria-hidden="true"></span>
          <input class="browser-address-input" type="text" value="Open a portfolio page" aria-label="Browser address or search" />
        </div>
        <iframe class="browser-frame" title="Portfolio page preview"></iframe>
      </div>
    `;
    return section;
  }

  function detachBrowserTab(instance, tabId, clientX, clientY) {
    const tab = closeBrowserTab(instance, tabId);

    if (!tab || !desktopStage) {
      return;
    }

    const name = `browser-${nextBrowserWindowId}`;
    nextBrowserWindowId += 1;
    windowLabels[name] = tab.title;

    const windowElement = createBrowserWindowElement(name, tab.title);
    desktopStage.appendChild(windowElement);
    windows.push(windowElement);
    setupWindow(windowElement);

    const scale = getDesktopScale();
    windowElement.style.left = `${Math.max(24, clientX / scale - 220)}px`;
    windowElement.style.top = `${Math.max(54, clientY / scale - 32)}px`;
    windowElement.style.width = "900px";
    windowElement.style.height = "620px";

    const detachedInstance = getBrowserInstance(name);
    addBrowserTab(detachedInstance, tab.href, tab.title);
  }

  function getViewportBounds() {
    const desktopScale = getDesktopScale();
    const desktopRect = document.querySelector(".desktop-stage")?.getBoundingClientRect();

    return {
      width: (desktopRect?.width || window.innerWidth) / desktopScale,
      height: (desktopRect?.height || window.innerHeight) / desktopScale
    };
  }

  function getBoundedPosition(left, top, windowElement) {
    const desktopRect = document.querySelector(".desktop-stage")?.getBoundingClientRect();
    const windowRect = windowElement.getBoundingClientRect();
    const desktopScale = getDesktopScale();
    const viewportWidth = (desktopRect?.width || window.innerWidth) / desktopScale;
    const viewportHeight = (desktopRect?.height || window.innerHeight) / desktopScale;
    const width = windowRect.width / desktopScale;
    const height = windowRect.height / desktopScale;
    const minVisible = 120;

    return {
      left: Math.min(Math.max(left, -width + minVisible), viewportWidth - minVisible),
      top: Math.min(Math.max(top, 42), viewportHeight - Math.min(90, height))
    };
  }

  function startWindowDrag(event, windowElement) {
    if (
      event.button !== 0 ||
      event.target.closest(".traffic")
    ) {
      return;
    }

    windowElement.classList.remove("is-maximized");
    const desktopScale = getDesktopScale();
    const left = windowElement.offsetLeft;
    const top = windowElement.offsetTop;

    activeDrag = {
      pointerId: event.pointerId,
      windowElement,
      startX: event.clientX / desktopScale,
      startY: event.clientY / desktopScale,
      left,
      top,
      scale: desktopScale
    };

    windowElement.classList.add("is-dragging");
    windowElement.setPointerCapture(event.pointerId);
    focusWindow(windowElement);
  }

  function moveWindowDrag(event) {
    if (!activeDrag || event.pointerId !== activeDrag.pointerId) {
      return;
    }

    const nextLeft = activeDrag.left + event.clientX / activeDrag.scale - activeDrag.startX;
    const nextTop = activeDrag.top + event.clientY / activeDrag.scale - activeDrag.startY;
    const bounded = getBoundedPosition(nextLeft, nextTop, activeDrag.windowElement);

    activeDrag.windowElement.style.left = `${bounded.left}px`;
    activeDrag.windowElement.style.top = `${bounded.top}px`;
  }

  function endWindowDrag(event) {
    if (!activeDrag || event.pointerId !== activeDrag.pointerId) {
      return;
    }

    activeDrag.windowElement.classList.remove("is-dragging");
    activeDrag.windowElement.releasePointerCapture(event.pointerId);
    activeDrag = null;
  }

  function createResizeHandles(windowElement) {
    if (windowElement.dataset.resizeReady === "true") {
      return;
    }

    ["n", "e", "s", "w", "ne", "nw", "se", "sw"].forEach((direction) => {
      const handle = document.createElement("span");
      handle.className = `resize-handle resize-handle-${direction}`;
      handle.dataset.resizeDirection = direction;
      handle.setAttribute("aria-hidden", "true");
      windowElement.appendChild(handle);
    });

    windowElement.dataset.resizeReady = "true";
  }

  function startWindowResize(event, windowElement, direction) {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    windowElement.classList.remove("is-maximized");

    const desktopScale = getDesktopScale();
    const rect = windowElement.getBoundingClientRect();

    activeResize = {
      pointerId: event.pointerId,
      windowElement,
      direction,
      scale: desktopScale,
      startX: event.clientX / desktopScale,
      startY: event.clientY / desktopScale,
      left: windowElement.offsetLeft,
      top: windowElement.offsetTop,
      width: rect.width / desktopScale,
      height: rect.height / desktopScale,
      minWidth: Number.parseFloat(getComputedStyle(windowElement).minWidth) || 360,
      minHeight: Number.parseFloat(getComputedStyle(windowElement).minHeight) || 240
    };

    windowElement.classList.add("is-dragging");
    event.target.setPointerCapture(event.pointerId);
    focusWindow(windowElement);
  }

  function moveWindowResize(event) {
    if (!activeResize || event.pointerId !== activeResize.pointerId) {
      return;
    }

    const bounds = getViewportBounds();
    const deltaX = event.clientX / activeResize.scale - activeResize.startX;
    const deltaY = event.clientY / activeResize.scale - activeResize.startY;
    let nextLeft = activeResize.left;
    let nextTop = activeResize.top;
    let nextWidth = activeResize.width;
    let nextHeight = activeResize.height;
    const dir = activeResize.direction;

    if (dir.includes("e")) {
      nextWidth = activeResize.width + deltaX;
    }
    if (dir.includes("s")) {
      nextHeight = activeResize.height + deltaY;
    }
    if (dir.includes("w")) {
      nextWidth = activeResize.width - deltaX;
      nextLeft = activeResize.left + deltaX;
    }
    if (dir.includes("n")) {
      nextHeight = activeResize.height - deltaY;
      nextTop = activeResize.top + deltaY;
    }

    if (nextWidth < activeResize.minWidth) {
      if (dir.includes("w")) {
        nextLeft -= activeResize.minWidth - nextWidth;
      }
      nextWidth = activeResize.minWidth;
    }

    if (nextHeight < activeResize.minHeight) {
      if (dir.includes("n")) {
        nextTop -= activeResize.minHeight - nextHeight;
      }
      nextHeight = activeResize.minHeight;
    }

    const maxWidth = bounds.width - Math.max(24, nextLeft);
    const maxHeight = bounds.height - Math.max(50, nextTop) - 18;
    nextWidth = Math.min(nextWidth, maxWidth);
    nextHeight = Math.min(nextHeight, maxHeight);
    nextLeft = Math.min(Math.max(nextLeft, 0), bounds.width - activeResize.minWidth);
    nextTop = Math.min(Math.max(nextTop, 42), bounds.height - activeResize.minHeight);

    activeResize.windowElement.style.left = `${nextLeft}px`;
    activeResize.windowElement.style.top = `${nextTop}px`;
    activeResize.windowElement.style.width = `${nextWidth}px`;
    activeResize.windowElement.style.height = `${nextHeight}px`;
  }

  function endWindowResize(event) {
    if (!activeResize || event.pointerId !== activeResize.pointerId) {
      return;
    }

    activeResize.windowElement.classList.remove("is-dragging");
    activeResize = null;
  }

  function setupWindow(windowElement) {
    if (!windowElement || windowElement.dataset.windowReady === "true") {
      return;
    }

    createResizeHandles(windowElement);
    windowElement.addEventListener("pointerdown", () => focusWindow(windowElement));
    windowElement.querySelector(".window-titlebar")?.addEventListener("pointerdown", (event) => {
      startWindowDrag(event, windowElement);
    });
    windowElement.querySelectorAll("[data-resize-direction]").forEach((handle) => {
      handle.addEventListener("pointerdown", (event) => {
        startWindowResize(event, windowElement, handle.dataset.resizeDirection);
      });
      handle.addEventListener("pointermove", moveWindowResize);
      handle.addEventListener("pointerup", endWindowResize);
      handle.addEventListener("pointercancel", endWindowResize);
    });
    windowElement.addEventListener("pointermove", moveWindowDrag);
    windowElement.addEventListener("pointerup", endWindowDrag);
    windowElement.addEventListener("pointercancel", endWindowDrag);

    windowElement.querySelector("[data-window-close]")?.addEventListener("click", () => {
      closeWindow(windowElement);
    });

    windowElement.querySelector("[data-window-maximize]")?.addEventListener("click", () => {
      toggleMaximize(windowElement);
    });

    if (windowElement.classList.contains("browser-window")) {
      createBrowserInstance(windowElement);
    }

    windowElement.dataset.windowReady = "true";
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      if (trigger.closest(".desktop-icons")) {
        return;
      }

      openWindow(trigger.dataset.windowTarget);
    });
  });

  document.querySelectorAll(".desktop-icons button, .desktop-icons a").forEach((icon) => {
    icon.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      document.querySelectorAll(".desktop-icons .is-selected").forEach((item) => item.classList.remove("is-selected"));
      icon.classList.add("is-selected");

      const href = icon.getAttribute("href");
      if (href) {
        window.open(href, "_blank", "noopener,noreferrer");
      }
    });

    icon.addEventListener("dblclick", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (icon.matches("a[href]")) {
        return;
      }

      if (icon.dataset.windowTarget) {
        openWindow(icon.dataset.windowTarget);
      }
    });
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");

    if (!link || !isPortfolioPageLink(link)) {
      return;
    }

    event.preventDefault();
    openBrowserTab(link.getAttribute("href"), getBrowserTabTitle(link));
  });

  windows.forEach(setupWindow);

  function setupGuestbook() {
    const form = document.getElementById("guestbook-form");
    const nameInput = document.getElementById("guestbook-name");
    const messageInput = document.getElementById("guestbook-message");
    const notesElement = document.getElementById("guestbook-notes");

    if (!form || !nameInput || !messageInput || !notesElement) {
      return;
    }

    const storageKey = "jona-portfolio-guestbook";
    const getNotes = () => {
      try {
        return JSON.parse(localStorage.getItem(storageKey) || "[]");
      } catch (error) {
        return [];
      }
    };

    const renderNotes = () => {
      const notes = getNotes();
      notesElement.replaceChildren();

      if (!notes.length) {
        const empty = document.createElement("div");
        empty.className = "guestbook-note";
        empty.innerHTML = "<strong>Jona OS</strong><p>No notes yet. Be the first one here.</p>";
        notesElement.appendChild(empty);
        return;
      }

      notes.forEach((note) => {
        const item = document.createElement("article");
        item.className = "guestbook-note";
        const name = document.createElement("strong");
        const message = document.createElement("p");
        name.textContent = note.name;
        message.textContent = note.message;
        item.append(name, message);
        notesElement.appendChild(item);
      });
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = nameInput.value.trim();
      const message = messageInput.value.trim();

      if (!name || !message) {
        return;
      }

      const notes = getNotes();
      notes.unshift({ name, message });
      localStorage.setItem(storageKey, JSON.stringify(notes.slice(0, 8)));
      form.reset();
      renderNotes();
    });

    renderNotes();
  }

  function updateClock() {
    if (!clock) {
      return;
    }

    const now = new Date();
    clock.dateTime = now.toISOString();
    clock.textContent = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(now);
  }

  addRecentWindow("about");
  setupGuestbook();
  updateClock();
  window.setInterval(updateClock, 30000);
})();
