const FILES_TO_CACHE = [
    './index.html',
    './css/styles.css',
    './js/index.js',
    './js/idb.js',
    './manifest.json',
    './icons/icon-512x512.png',
    './icons/icon-192x192.png'
];

const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// self.addEventListener("fetch", event => {
//   // non GET requests are not cached and requests to other origins are not cached
//   if (
//     event.request.method !== "GET" ||
//     !event.request.url.startsWith(self.location.origin)
//   ) {
//     event.respondWith(fetch(event.request));
//     return;
//   }

//   // handle runtime GET requests for data from /api routes
//   if (event.request.url.includes("/api/images")) {
//     // make network request and fallback to cache if network request fails (offline)
//     event.respondWith(
//       caches.open(DATA_CACHE_NAME).then(cache => {
//         return fetch(event.request)
//           .then(response => {
//             cache.put(event.request, response.clone());
//             return response;
//           })
//           .catch(() => caches.match(event.request));
//       })
//     );
//     return;
//   }

//   // use cache first for all other requests for performance
//   event.respondWith(
//     caches.match(event.request).then(cachedResponse => {
//       if (cachedResponse) {
//         return cachedResponse;
//       }

//       // request is not in cache. make network request and cache the response
//       return caches.open(DATA_CACHE_NAME).then(cache => {
//         return fetch(event.request).then(response => {
//           return cache.put(event.request, response.clone()).then(() => {
//             return response;
//           });
//         });
//       });
//     })
//   );
// });
