// F7BEATS MUSIC CATALOG — Service Worker (PWA)
// © 2025 Furgersen7 / BufordDesignLLC™

const CACHE_NAME = "f7beats-v2";
const FILES_TO_CACHE = [
  "/", // root page
  "/index.html", // main entry (rename if your file is f7beats_catalog.html)
  "https://images.squarespace-cdn.com/content/v1/54610117e4b08a5bd8f003ca/bf357a0f-71ec-47d5-9062-bea7ddb04a55/FURGERSEN7+LOGO.jpg?format=1500w",
  "https://www.youtube.com/iframe_api"
];

// 🧩 Install: cache essential files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .catch(err => console.error("Cache install failed:", err))
  );
  self.skipWaiting();
});

// 🔁 Activate: clear old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log("🧹 Deleting old cache:", key);
          return caches.delete(key);
        }
      }))
    )
  );
  self.clients.claim();
});

// ⚡ Fetch: serve from cache first, then network fallback
self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle http(s) requests
  if (url.origin.startsWith("http")) {
    event.respondWith(
      caches.match(req)
        .then(cachedRes => {
          if (cachedRes) return cachedRes; // Serve cached version
          return fetch(req)
            .then(fetchRes => {
              // Cache fetched resources (optional for dynamic assets)
              return caches.open(CACHE_NAME).then(cache => {
                cache.put(req, fetchRes.clone());
                return fetchRes;
              });
            })
            .catch(() => caches.match("/index.html")); // fallback if offline
        })
    );
  }
});

// 📴 Optional: listen for "offline" ping or analytics
self.addEventListener("message", event => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});
