const STATIC_CACHE = "portfolio-static-v8";
const RUNTIME_CACHE = "portfolio-runtime-v8";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/styles.css?v=20260410-5",
  "/theme-palettes.css?v=20260410-4",
  "/theme-controls.js?v=20260319-1",
  "/language-controls.js?v=20260410-2",
  "/project-card-utils.js",
  "/performance-utils.js",
  "/zoom-controls.css",
  "/zoom-controls.js",
  "/theme-init.js"
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
          .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
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
    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const request = event.request;
  const destination = request.destination;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (["image", "style", "script", "font"].includes(destination)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
