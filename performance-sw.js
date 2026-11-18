const STATIC_CACHE = "portfolio-static-v32";
const RUNTIME_CACHE = "portfolio-runtime-v32";
const IMAGE_CACHE = "portfolio-images-v1";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/changelog.html",
  "/css/styles.css?v=20260413-6",
  "/css/theme-palettes.css?v=20260413-7",
  "/js/theme-controls.js?v=20260319-1",
  "/js/language-controls.js?v=20260410-2",
  "/js/project-card-utils.js",
  "/js/performance-utils.js",
  "/js/performance-main.js",
  "/project/scripts/photography-archive.js",
  "/webmeji-main/webmeji.css",
  "/webmeji-main/config.js",
  "/webmeji-main/webmeji.js",
  "/css/zoom-controls.css",
  "/js/zoom-controls.js",
  "/js/theme-init.js",
  "/js/firebase-config.js",
  "/js/admin-panel.js",
  "/js/testimonials-guestbook.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE, IMAGE_CACHE].includes(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cachedResponse);

  return cachedResponse || networkPromise;
}

async function cacheFirstWithRefresh(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    fetch(request).then(resp => {
      if (resp && resp.ok) cache.put(request, resp.clone());
    }).catch(() => {});
    return cachedResponse;
  }
  return fetch(request).then(resp => {
    if (resp && resp.ok) cache.put(request, resp.clone());
    return resp;
  });
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const request = event.request;
  const destination = request.destination;
  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (destination === "image") {
    event.respondWith(cacheFirstWithRefresh(request, IMAGE_CACHE));
    return;
  }

  if (["style", "script", "font"].includes(destination)) {
    const isFirebaseModule = url.pathname.includes("firebase-config") || url.pathname.includes("admin-panel") || url.pathname.includes("testimonials-guestbook");
    if (isFirebaseModule) {
      event.respondWith(networkFirst(request));
      return;
    }
    event.respondWith(staleWhileRevalidate(request));
  }
});
