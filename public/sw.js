const CACHE_NAME = 'infinityip-v2'

// On install — skip waiting immediately
self.addEventListener('install', event => {
  self.skipWaiting()
})

// On activate — delete ALL old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    )
  )
  self.clients.claim()
})

// Fetch — always go to network, never cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})