"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { registerServiceWorker, showDesktopNotification } from "@/lib/push-notification";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();

  useEffect(() => {
    // 1. Initialize socket connection
    const socket = getSocket();

    // 2. Register Service Worker for Desktop Push
    registerServiceWorker();

    if (!socket) return;

    // 3. Global socket listener for native desktop notifications
    const handleGlobalNotification = (payload: any) => {
      const notif = payload?.data;
      if (!notif) return;

      const titleStr =
        typeof notif.title === "object"
          ? notif.title[language] || notif.title.en || notif.title.es || "Roadtripeado"
          : notif.title || "Roadtripeado";

      const contentStr =
        typeof notif.content === "object"
          ? notif.content[language] || notif.content.en || notif.content.es || ""
          : notif.content || "";

      showDesktopNotification(titleStr, {
        body: contentStr,
        url: notif.actionUrl || "/notifications",
      });
    };

    socket.on("notification", handleGlobalNotification);

    return () => {
      socket.off("notification", handleGlobalNotification);
    };
  }, [language]);

  return <>{children}</>;
}
