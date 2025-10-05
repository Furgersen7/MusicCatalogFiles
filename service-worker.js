const CACHE_NAME = "f7beats-v2";
const URLS_TO_CACHE = [
  "/",
  "https://images.squarespace-cdn.com/content/v1/54610117e4b08a5bd8f003ca/bf357a0f-71ec-47d5-9062-bea7ddb04a55/FURGERSEN7+LOGO.jpg?format=512w"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            if (response && response.status === 200 && response.type === "basic") {
              const respClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respClone));
            }
            return response;
          })
          .catch(() => caches.match("/"))
      );
    })
  );
});
