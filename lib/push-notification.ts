"use client";

/**
 * Registers the Service Worker for desktop push notifications
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    return reg;
  } catch (err) {
    console.warn("ServiceWorker registration error:", err);
    return null;
  }
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      await registerServiceWorker();
    }
    return permission;
  } catch (err) {
    console.warn("Notification.requestPermission error:", err);
    return Notification.permission;
  }
}

/**
 * Displays a native desktop/PC push notification
 */
export async function showDesktopNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    url?: string;
  }
): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission !== "granted") {
    return false;
  }

  const notifOptions = {
    body: options?.body || "You have a new update.",
    icon: options?.icon || "/logo.png",
    badge: "/favicon.ico",
    data: {
      url: options?.url || "/notifications",
    },
  };

  // 1. Try Service Worker showNotification (Best for Windows/Desktop notifications)
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && typeof reg.showNotification === "function") {
        await reg.showNotification(title, notifOptions);
        return true;
      }
    } catch (err) {
      console.warn("Service Worker showNotification error, falling back:", err);
    }
  }

  // 2. Direct Notification fallback
  try {
    const n = new window.Notification(title, {
      body: notifOptions.body,
      icon: notifOptions.icon,
    });
    n.onclick = () => {
      window.focus();
      if (options?.url) {
        window.location.href = options.url;
      }
    };
    return true;
  } catch (err) {
    console.warn("window.Notification fallback error:", err);
    return false;
  }
}
