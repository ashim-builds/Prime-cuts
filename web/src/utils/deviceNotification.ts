/**
 * Universal Native Device Notification Utility for Prime Cuts
 * Works across Windows, macOS (Safari/Chrome), Android, and iOS (iPhone/iPad PWA)
 */

export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

let sharedAudioCtx: AudioContext | null = null;

export function playAlertChime() {
  try {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) return;

    if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
      sharedAudioCtx = new AudioCtxClass();
    }

    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }

    const audioCtx = sharedAudioCtx;
    const now = audioCtx.currentTime;

    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.3, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.0, now + 0.1); // A5
    gain2.gain.setValueAtTime(0, now + 0.1);
    gain2.gain.linearRampToValueAtTime(0.35, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.6);
  } catch (err) {
    console.warn("[Audio] Alert chime note:", err);
  }
}

/**
 * Detect Apple iOS Device
 */
export function isIOS(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/**
 * Detect if running as an installed standalone PWA on Home Screen
 */
export function isStandalonePWA(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Requests Notification permission safely across modern browsers and Safari
 * (MUST be called synchronously from user click gesture to satisfy Safari/WebKit security policy)
 */
export async function safeRequestPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }

  // Modern Promise-based requestPermission
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    // Legacy callback-based fallback for older WebKit / Safari
    return new Promise<NotificationPermission>((resolve) => {
      try {
        Notification.requestPermission((result) => {
          resolve(result);
        });
      } catch {
        resolve("denied");
      }
    });
  }
}

/**
 * Triggers an instant native notification that shows in Windows/macOS/Android/iOS notification tray
 */
export async function triggerDeviceNotification(
  title: string,
  options: {
    body: string;
    url?: string;
    icon?: string;
    badge?: string;
    tag?: string;
  }
) {
  if (typeof window === "undefined") return;

  // 1. Play audio chime
  playAlertChime();

  if (!("Notification" in window)) {
    console.warn("[Notification] Browser does not support Notification API.");
    return;
  }

  if (Notification.permission !== "granted") {
    console.warn("[Notification] Notification permission is not granted. Current state:", Notification.permission);
    return;
  }

  const origin = window.location.origin;
  const iconUrl = options.icon
    ? options.icon.startsWith("http")
      ? options.icon
      : `${origin}${options.icon}`
    : `${origin}/icon-192x192.png`;
  const badgeUrl = options.badge
    ? options.badge.startsWith("http")
      ? options.badge
      : `${origin}${options.badge}`
    : `${origin}/icon-192x192.png`;

  const notificationOptions: NotificationOptions = {
    body: options.body,
    icon: iconUrl,
    badge: badgeUrl,
    data: { url: options.url || "/" },
    tag: options.tag || `prime-cuts-${Date.now()}`,
    requireInteraction: true,
  };

  // Attempt 1: Service Worker showNotification (Required on iOS Safari / macOS WebKit / Chrome PWA)
  if ("serviceWorker" in navigator) {
    try {
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        reg = await navigator.serviceWorker.register("/sw.js");
      }
      const activeReg = await navigator.serviceWorker.ready;
      if (activeReg && activeReg.showNotification) {
        await activeReg.showNotification(title, notificationOptions);
        return;
      }
    } catch (swErr) {
      console.warn("[Notification] SW showNotification fallback:", swErr);
    }
  }

  // Attempt 2: Direct browser Notification constructor fallback (Windows / Desktop Chrome / Firefox)
  try {
    const notif = new Notification(title, notificationOptions);
    notif.onclick = () => {
      window.focus();
      if (options.url) {
        window.location.href = options.url;
      }
      notif.close();
    };
  } catch (directErr) {
    console.warn("[Notification] Direct Notification constructor notice (normal on iOS):", directErr);
  }
}

/**
 * Subscribes the current device to push notifications and syncs with backend MySQL
 * Compatible with Apple iOS 16.4+, macOS Safari, Chrome, Edge, and Android
 */
export async function registerDevicePushSubscription(type: "customer" | "admin", userId?: string) {
  if (typeof window === "undefined") {
    throw new Error("Push notifications are not supported in this environment.");
  }

  // Special helpful message for iOS Safari in non-standalone browser tab
  if (isIOS() && !isStandalonePWA()) {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      throw new Error(
        "On iPhone/iPad: Tap the Share button (⎋ / ⬆) at the bottom of Safari, tap 'Add to Home Screen', then open Prime Cuts from your home screen to enable notifications."
      );
    }
  }

  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    throw new Error("Push notifications are not supported on this browser.");
  }

  // CRITICAL FOR SAFARI/APPLE: Request permission FIRST directly inside the user gesture
  const permission = await safeRequestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was denied. Please allow notifications in browser site settings.");
  }

  // Fetch VAPID Key
  const vapidRes = await fetch("/api/push/vapid");
  if (!vapidRes.ok) throw new Error("Failed to fetch VAPID key from server.");
  const { publicKey } = await vapidRes.json();

  let reg = await navigator.serviceWorker.getRegistration();
  if (!reg) {
    reg = await navigator.serviceWorker.register("/sw.js");
  }

  const activeReg = await navigator.serviceWorker.ready;

  // Clean old mismatched subscription if any
  const existingSub = await activeReg.pushManager.getSubscription();
  if (existingSub) {
    try {
      await existingSub.unsubscribe();
    } catch (e) {
      console.warn("[Push] Old sub cleanup warning:", e);
    }
  }

  let sub: PushSubscription;
  try {
    sub = await activeReg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  } catch (subErr) {
    const staleSub = await activeReg.pushManager.getSubscription();
    if (staleSub) await staleSub.unsubscribe();
    sub = await activeReg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const subJson = sub.toJSON();

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subscription: subJson,
      type,
      userId: userId || undefined,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to register subscription on backend server.");
  }

  // Trigger confirmation on the device
  await triggerDeviceNotification("🥩 Prime Cuts Alerts Active!", {
    body: "Notifications are now active on your Apple/Windows device. You will receive live order updates here.",
    url: type === "admin" ? "/admin" : "/orders",
  });

  return sub;
}

