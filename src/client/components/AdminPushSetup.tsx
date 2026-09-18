import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export default function AdminPushSetup() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    if (Notification.permission === "default") {
      const dismissed = sessionStorage.getItem("admin_push_dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    }
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const vapidRes = await fetch("/api/push/vapid");
      if (!vapidRes.ok) return;
      const { publicKey } = await vapidRes.json();

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setShowPrompt(false);
        return;
      }

      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        reg = await navigator.serviceWorker.register("/sw.js");
      }

      const activeReg = await navigator.serviceWorker.ready;
      const sub = await activeReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const subJson = sub.toJSON();

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subJson,
          type: "admin",
        }),
      });

      setShowPrompt(false);
    } catch (err) {
      console.error("Admin push subscription error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("admin_push_dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-sm bg-stone-900 border border-primary text-white rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-4">
      <div className="flex justify-between items-start mb-3">
        <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
          <Bell className="w-5 h-5" />
        </div>
        <button onClick={handleDismiss} className="text-stone-400 hover:text-white cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <h4 className="font-black text-white text-base mb-1">Enable Admin Order Alerts</h4>
      <p className="text-xs text-stone-300 font-medium leading-relaxed mb-4">
        Receive real-time desktop push notifications instantly when a customer places an order or updates status!
      </p>

      <div className="flex gap-2">
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="flex-1 py-2.5 bg-primary text-black font-black text-xs uppercase tracking-wide rounded-xl hover:bg-primary/90 transition-colors cursor-pointer"
        >
          {loading ? "Enabling..." : "Enable Push Alerts"}
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
