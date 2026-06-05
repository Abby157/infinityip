const CACHE_NAME = 'infinityip-v5'

self.addEventListener('install', event => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})

// Handle push notifications
self.addEventListener('push', event => {
  const data = event.data?.json() || {}
  const title = data.title || 'Infinity IP'
  const options = {
    body:    data.body || 'You have a new notification',
    icon:    '/icon-192.png',
    badge:   '/icon-192.png',
    vibrate: [200, 100, 200],
    tag:     'infinityip-notification',
    renotify: true,
    data:    { url: data.url || '/' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      const url = event.notification.data?.url || '/'
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})