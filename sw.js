const CACHE_NAME = "utilhub-v22-nova-flow-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.webmanifest"
];

// INSTALACIÓN
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        for (const file of APP_FILES) {
          try {
            await cache.add(file);
          } catch (error) {
            console.warn("No se pudo guardar en caché:", file);
          }
        }
      })
      .then(() => self.skipWaiting())
  );
});

// ACTIVACIÓN
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// PETICIONES
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type === "opaque"
            ) {
              return networkResponse;
            }

            const responseClone = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              })
              .catch(() => {});

            return networkResponse;
          })
          .catch(() => {
            if (request.mode === "navigate") {
              return caches.match("./index.html");
            }

            return new Response(
              "Sin conexión",
              {
                status: 503,
                headers: {
                  "Content-Type": "text/plain; charset=utf-8"
                }
              }
            );
          });
      })
  );
});

// MENSAJES DESDE LA WEB
self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      })
    );
  }
});
