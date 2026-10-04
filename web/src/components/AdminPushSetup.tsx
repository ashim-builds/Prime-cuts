import { useState, useEffect } from "react";
import { Bell, X, CheckCircle2 } from "lucide-react";
import { registerDevicePushSubscription } from "../utils/deviceNotification";

export default function AdminPushSetup() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) return;

    // Register service worker immediately
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("[AdminPush] ServiceWorker registration:", err);
    });

    if (Notification.permission === "granted") {
      // Background re-subscribe to ensure admin endpoint is registered
      handleSubscribe(true);
    } else if (Notification.permission === "default") {
      const dismissed = sessionStorage.getItem("admin_push_dismissed");
      if (!dismissed) {
        const timer = setTimeout(() => setShowPrompt(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleSubscribe = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      if (silent && Notification.permission !== "granted") return;
      await registerDevicePushSubscription("admin");
      setShowPrompt(false);
    } catch (err) {
      if (!silent) console.error("Admin push subscription error:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("admin_push_dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-[9999] max-w-sm bg-stone-900 border-2 border-primary text-white rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-4">
      <div className="flex justify-between items-start mb-3">
        <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
          <Bell className="w-5 h-5" />
        </div>
        <button onClick={handleDismiss} className="text-stone-400 hover:text-white cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <h4 className="font-black text-white text-base mb-1">Enable Admin Order Alerts 🛎️</h4>
      <p className="text-xs text-stone-300 font-medium leading-relaxed mb-4">
        Receive instant push notifications on your laptop & mobile device whenever a customer places an order or cancels!
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => handleSubscribe(false)}
          disabled={loading}
          className="flex-1 py-2.5 bg-primary text-white font-black text-xs uppercase tracking-wide rounded-xl hover:bg-primary-hover transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          {loading ? "Enabling..." : "Enable Alerts"}
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2.5 bg-white/10 text-stone-300 font-bold text-xs rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
