import { useState, useEffect, useContext } from "react";
import { Bell, CheckCircle2, X } from "lucide-react";
import { UserContext } from "../context/UserContext";
import { registerDevicePushSubscription } from "../utils/deviceNotification";

interface PushNotificationSetupProps {
  userId?: string;
}

export default function PushNotificationSetup({
  userId,
}: PushNotificationSetupProps) {
  const userContext = useContext(UserContext);
  const user = userContext ? userContext.user : null;
  const activeUserId = userId || user?.id;

  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-register service worker and sync subscription
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) return;

    // Register service worker immediately
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("[Push] ServiceWorker registration:", err);
    });

    if (Notification.permission === "granted" && activeUserId) {
      // Re-sync subscription with active user ID in background
      handleSubscribe(true);
    } else if (Notification.permission === "default" && activeUserId) {
      const dismissed = sessionStorage.getItem("push_prompt_dismissed");
      if (!dismissed) {
        const timer = setTimeout(() => setShowPrompt(true), 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [activeUserId]);

  const handleSubscribe = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      if (silent && Notification.permission !== "granted") return;
      await registerDevicePushSubscription("customer", activeUserId);
      setShowPrompt(false);
    } catch (err) {
      if (!silent) console.error("Push subscription error:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("push_prompt_dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 max-w-sm bg-stone-900 border-2 border-primary/80 text-white rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-4">
      <div className="flex justify-between items-start mb-3">
        <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
          <Bell className="w-5 h-5" />
        </div>
        <button
          onClick={handleDismiss}
          className="text-stone-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <h4 className="font-black text-white text-base mb-1">
        Enable Live Order Alerts 🥩
      </h4>
      <p className="text-xs text-stone-300 font-medium leading-relaxed mb-4">
        Receive instant notifications on your laptop & mobile device when your order is placed, confirmed, prepared, and out for delivery!
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => handleSubscribe(false)}
          disabled={loading}
          className="flex-1 py-2.5 bg-primary text-white font-black text-xs uppercase tracking-wide rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <CheckCircle2 className="w-4 h-4" />
          {loading ? "Enabling..." : "Enable Alerts"}
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2.5 bg-white/10 text-stone-300 font-bold text-xs rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
        >
          Later
        </button>
      </div>
    </div>
  );
}
