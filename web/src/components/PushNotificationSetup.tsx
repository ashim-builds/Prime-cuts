import { useState, useEffect } from "react";
import { Bell, CheckCircle2, X } from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

interface PushNotificationSetupProps {
  userId: string;
}

export default function PushNotificationSetup({ userId }: PushNotificationSetupProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    if (Notification.permission === "default") {
      const dismissed = sessionStorage.getItem("push_prompt_dismissed");
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

      // Safely unsubscribe any existing subscription with previous or mismatched keys
      const existingSub = await activeReg.pushManager.getSubscription();
      if (existingSub) {
        try {
          await existingSub.unsubscribe();
        } catch (e) {
          console.warn("[PushSetup] Cleanup old subscription warning:", e);
        }
      }

      let sub: PushSubscription;
      try {
        sub = await activeReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      } catch (subErr: any) {
        // Retry after explicit unsubscribe if an InvalidStateError occurred
        const staleSub = await activeReg.pushManager.getSubscription();
        if (staleSub) {
          await staleSub.unsubscribe();
        }
        sub = await activeReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const subJson = sub.toJSON();

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subJson,
          type: "customer",
          userId,
        }),
      });

      setShowPrompt(false);
    } catch (err) {
      console.error("Push subscription error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("push_prompt_dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-white border border-stone-200 rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-4">
      <div className="flex justify-between items-start mb-3">
        <div className="w-10 h-10 bg-amber-100 text-primary rounded-xl flex items-center justify-center">
          <Bell className="w-5 h-5" />
        </div>
        <button onClick={handleDismiss} className="text-stone-400 hover:text-black cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <h4 className="font-black text-stone-900 text-base mb-1">Get Live Order Alerts</h4>
      <p className="text-xs text-stone-500 font-medium leading-relaxed mb-4">
        Allow notifications to receive real-time updates when your order is confirmed, prepared, and ready for pickup or delivery!
      </p>

      <div className="flex gap-2">
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="flex-1 py-2.5 bg-primary text-black font-black text-xs uppercase tracking-wide rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          {loading ? "Enabling..." : "Enable Alerts"}
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2.5 bg-stone-100 text-stone-600 font-bold text-xs rounded-xl hover:bg-stone-200 transition-colors cursor-pointer"
        >
          Later
        </button>
      </div>
    </div>
  );
}
