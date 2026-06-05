const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa40SvRYqY5dDKS6cVHKrBvGlhKKjpLwRYFyPSGfRgMRWrYS9vxz8bqnFc6Mo4'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function requestPushPermission() {
  if (!('Notification' in window)) return null
  if (!('serviceWorker' in navigator)) return null

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
    return subscription
  } catch (err) {
    console.error('Push subscription failed:', err)
    return null
  }
}

export function showLocalNotification(title, body, icon = '/icon-192.png') {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  navigator.serviceWorker.ready.then(registration => {
    registration.showNotification(title, {
      body,
      icon,
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'infinityip-notification',
      renotify: true,
    })
  })
}

export function isPushSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
}

export function getPushPermissionStatus() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}