/** Service Worker registration & Push subscription helper */

const API_BASE = process.env.NEXT_PUBLIC_NOTIFICATION_MANAGEMENT_API_URL || 'http://localhost:8080';

export async function ensureServiceWorkerRegistered() {
  if (typeof window === 'undefined') return null;
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    // Wait until ready to ensure registration.active is available
    const ready = await navigator.serviceWorker.ready;
    return ready || reg;
  } catch (e) {
    console.error('SW registration failed:', e);
    return null;
  }
}

async function getVapidPublicKey(): Promise<Uint8Array | null> {
  try {
    const res = await fetch(`${API_BASE}/api/push/vapid-public-key`);
    if (!res.ok) return null;
    const data = await res.json();
    const base64 = data.publicKey;
    if (!base64) return null;
    return urlBase64ToUint8Array(base64);
  } catch {
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }
  return Notification.permission;
}

export async function subscribeUserToPush(authToken?: string, deviceId?: string) {
  if (typeof window === 'undefined') return null;
  if (!('serviceWorker' in navigator)) return null;
  try {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('Notifications permission not granted');
      return null;
    }
    const registration = await ensureServiceWorkerRegistered();
    if (!registration || !registration.pushManager) return null;

    // If already subscribed, reuse
    const existing = await registration.pushManager.getSubscription();
    let subscription = existing;
    if (!subscription) {
      const appServerKey = await getVapidPublicKey();
      if (!appServerKey) {
        console.warn('Missing VAPID public key; cannot subscribe');
        return null;
      }
      // Ensure the key is a plain Uint8Array backed by an ArrayBuffer for TS's BufferSource typing
      const appServerKeyView = new Uint8Array(appServerKey); // copy into a new Uint8Array backed by ArrayBuffer
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKeyView.buffer as ArrayBuffer,
      });
    }

    // Send subscription to backend
    try {
      await fetch(`${API_BASE}/api/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ subscription, deviceId }),
      });
    } catch (e) {
      console.error('Failed to send subscription to backend', e);
    }

    return subscription;
  } catch (e) {
    console.error('Push subscribe failed:', e);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
