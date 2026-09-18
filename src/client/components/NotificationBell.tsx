import { useEffect, useState, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import { Bell, BellOff, CheckCircle2, ShieldAlert, Loader2, Clock, ChefHat, PackageCheck, XCircle } from "lucide-react";
import { UserContext } from "../context/UserContext";
import { motion, AnimatePresence } from "framer-motion";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export interface NotificationBellProps {
  type: "customer" | "admin";
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function NotificationBell({ type }: NotificationBellProps) {
  const userContext = useContext(UserContext);
  const user = userContext ? userContext.user : null;
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pwaActive, setPwaActive] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [fetchingNotifications, setFetchingNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = async () => {
    if (type === "customer" && !user) {
      setUnreadCount(0);
      return;
    }
    try {
      const url = type === "admin" ? "/api/admin/notifications/unread-count" : "/api/notifications/unread-count";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUnreadCount(data.count || 0);
        }
      }
    } catch (err) {
      console.error("[Bell] Failed to fetch unread count:", err);
    }
  };

  const fetchNotifications = async () => {
    setFetchingNotifications(true);
    try {
      const url = type === "admin" ? "/api/admin/notifications" : "/api/notifications";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
        }
      }
    } catch (err) {
      console.error("[Bell] Failed to fetch notifications:", err);
    } finally {
      setFetchingNotifications(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const url = type === "admin" ? `/api/admin/notifications/${id}/read` : `/api/notifications/${id}/read`;
      const res = await fetch(url, { method: "PATCH" });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        fetchUnreadCount();
      }
    } catch (err) {
      console.error("[Bell] Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const url = type === "admin" ? "/api/admin/notifications/read-all" : "/api/notifications/read-all";
      const res = await fetch(url, { method: "PATCH" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("[Bell] Failed to mark all as read:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const checkStatus = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setPermission(Notification.permission);
    fetchUnreadCount();

    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        setSubscribed(!!sub);
      }
    }
  };

  useEffect(() => {
    if (type === "customer" && !user) {
      setUnreadCount(0);
      return;
    }

    checkStatus();

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("focus", fetchUnreadCount);
    
    const interval = setInterval(fetchUnreadCount, 20000);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("focus", fetchUnreadCount);
      clearInterval(interval);
    };
  }, [user, type]);

  if (type === "customer" && !user) {
    return null;
  }

  const handleSubscribe = async () => {
    setLoading(true);
    setError("");
    try {
      const vapidRes = await fetch("/api/push/vapid");
      if (!vapidRes.ok) throw new Error("VAPID config error");
      const { publicKey } = await vapidRes.json();

      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") {
        throw new Error("Browser notification permission denied.");
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

      const subJson = sub.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      const subscribeRes = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subJson,
          type,
          userId: type === "customer" ? user?.id : undefined,
        }),
      });

      if (!subscribeRes.ok) throw new Error("Failed to register subscription on server");

      setSubscribed(true);
    } catch (err: any) {
      console.error("[Bell] Registration failed:", err);
      setError(err.message || "Failed to enable notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    setError("");
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (sub) {
        await sub.unsubscribe();
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }
      setSubscribed(false);
    } catch (err: any) {
      console.error("[Bell] Unsubscribe failed:", err);
      setError(err.message || "Failed to disable notifications.");
    } finally {
      setLoading(false);
    }
  };

  let badgeColor = "bg-stone-500";
  let statusMessage = "Disabled";

  if (!pwaActive) {
    badgeColor = "bg-amber-500";
    statusMessage = "Dev Mode";
  } else if (permission === "denied") {
    badgeColor = "bg-red-500";
    statusMessage = "Blocked";
  } else if (subscribed && permission === "granted") {
    badgeColor = "bg-green-500";
    statusMessage = "Active";
  } else {
    badgeColor = "bg-stone-500";
    statusMessage = "Ready to Enable";
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:text-primary transition-colors focus:outline-none cursor-pointer"
        title="Notification Settings"
      >
        <motion.div
          animate={subscribed ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ repeat: Infinity, repeatDelay: 10, duration: 0.6 }}
        >
          {permission === "denied" ? (
            <BellOff className="w-5 h-5 text-red-500" />
          ) : (
            <Bell className={`w-5 h-5 ${subscribed ? "text-primary fill-primary/20" : "text-white"}`} />
          )}
        </motion.div>

        {unreadCount > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#111111] animate-pulse">
            {unreadCount}
          </span>
        ) : (
          <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full border border-[#111] ${badgeColor}`} />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute mt-2 bg-stone-950/95 border border-stone-800 rounded-2xl p-4 shadow-2xl z-50 max-md:fixed max-md:top-16 max-md:left-4 max-md:right-4 max-md:w-auto w-80 text-white ${
              type === "admin" ? "left-0" : "right-0"
            }`}
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wide">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] text-stone-400 hover:text-white underline transition-colors cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                subscribed ? "bg-green-500/10 text-green-400" : "bg-white/10 text-stone-400"
              }`}>
                {statusMessage}
              </span>
            </div>

            <div className="py-4 space-y-3">
              {permission === "denied" ? (
                <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-3 flex gap-2 text-red-400">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold leading-normal">
                    Permission blocked. Please check browser settings.
                  </p>
                </div>
              ) : subscribed ? (
                fetchingNotifications ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-6 text-stone-500">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-stone-600" />
                    <p className="text-xs font-semibold">
                      {type === "admin" ? "No new order notifications." : "No notifications yet."}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {notifications.map((notif) => {
                      if (type === "admin") {
                        let statusColor = "border-l-4 border-amber-500 bg-amber-500/5 hover:bg-amber-500/10";
                        let StatusIcon = Clock;
                        
                        if (notif.order?.status === "cancelled" || notif.type === "ORDER_CANCELLED_BY_USER") {
                          statusColor = "border-l-4 border-red-500 bg-red-500/5 hover:bg-red-500/10";
                          StatusIcon = XCircle;
                        }

                        const targetUrl = notif.order ? `/admin/orders/${notif.order.id}` : "/admin/orders";

                        return (
                          <Link
                            key={notif.id}
                            to={targetUrl}
                            onClick={() => {
                              setIsOpen(false);
                              handleMarkAsRead(notif.id);
                            }}
                            className={`block rounded-xl p-3 border transition-all text-left ${statusColor} ${
                              notif.read ? "opacity-60 border-white/5" : "border-white/20 shadow-md shadow-white/5"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[11px] font-black text-white flex items-center gap-1.5 leading-tight">
                                <StatusIcon className="w-3.5 h-3.5 shrink-0 text-white/90" />
                                {notif.title}
                                {!notif.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 self-center" />
                                )}
                              </span>
                              <span className="text-[9px] text-stone-500 shrink-0 font-medium">
                                {formatTimeAgo(notif.createdAt)}
                              </span>
                            </div>
                            
                            <p className="text-[10px] text-stone-300 font-bold mt-1.5">
                              {notif.order?.customerName || "Customer"}
                            </p>
                            <p className="text-[10px] text-stone-400 mt-0.5 leading-normal whitespace-pre-line">
                              {notif.message}
                            </p>

                            {notif.order && (
                              <div className="flex gap-1.5 mt-2">
                                <span className="text-[8px] uppercase font-black px-1.5 py-0.5 rounded bg-white/5 text-stone-400">
                                  Rs. {notif.order.total.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </Link>
                        );
                      }

                      let statusColor = "border-l-4 border-stone-600 bg-stone-900/40 hover:bg-stone-900/60";
                      let StatusIcon = Clock;

                      if (notif.type === "ORDER_PREPARING") {
                        statusColor = "border-l-4 border-amber-500 bg-amber-500/5 hover:bg-amber-500/10";
                        StatusIcon = ChefHat;
                      } else if (notif.type === "ORDER_READY") {
                        statusColor = "border-l-4 border-purple-500 bg-purple-500/5 hover:bg-purple-500/10";
                        StatusIcon = PackageCheck;
                      } else if (notif.type === "ORDER_COMPLETED") {
                        statusColor = "border-l-4 border-green-500 bg-green-500/5 hover:bg-green-500/10";
                        StatusIcon = CheckCircle2;
                      } else if (notif.type === "ORDER_CANCELLED") {
                        statusColor = "border-l-4 border-red-500 bg-red-500/5 hover:bg-red-500/10";
                        StatusIcon = XCircle;
                      } else if (notif.type === "ORDER_CONFIRMED") {
                        statusColor = "border-l-4 border-blue-500 bg-blue-500/5 hover:bg-blue-500/10";
                        StatusIcon = CheckCircle2;
                      }

                      const targetUrl = notif.order ? `/orders/${notif.order.orderNumber}` : "/orders";

                      return (
                        <Link
                          key={notif.id}
                          to={targetUrl}
                          onClick={() => {
                            setIsOpen(false);
                            handleMarkAsRead(notif.id);
                          }}
                          className={`block rounded-xl p-3 border transition-all text-left ${statusColor} ${
                            notif.read ? "opacity-60 border-white/5" : "border-white/20 shadow-md shadow-white/5"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[11px] font-black text-white flex items-center gap-1.5 leading-tight">
                              <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                              {notif.title}
                              {!notif.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 self-center" />
                              )}
                            </span>
                            <span className="text-[9px] text-stone-500 shrink-0 font-medium">
                              {formatTimeAgo(notif.createdAt)}
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-stone-300 mt-1.5 font-semibold leading-normal">
                            {notif.message}
                          </p>

                          {notif.order && (
                            <div className="flex gap-1.5 mt-2">
                              <span className="text-[8px] uppercase font-black px-1.5 py-0.5 rounded bg-white/5 text-stone-400">
                                Status: {notif.order.status}
                              </span>
                              <span className="text-[8px] uppercase font-black px-1.5 py-0.5 rounded bg-white/5 text-stone-400">
                                Payment: {notif.order.paymentStatus}
                              </span>
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )
              ) : (
                <p className="text-xs text-stone-400 leading-normal">
                  Subscribe to receive native push notifications on status changes, new orders, and payment updates.
                </p>
              )}
            </div>

            {error && (
              <div className="text-[10px] text-red-400 font-semibold bg-red-950/25 p-2 rounded-xl border border-red-900/30 mb-3 flex items-start gap-1.5 leading-normal">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {permission !== "denied" && (
              <button
                disabled={loading}
                onClick={subscribed ? handleUnsubscribe : handleSubscribe}
                className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  subscribed
                    ? "bg-stone-800 hover:bg-stone-700 text-white"
                    : "bg-primary text-black font-black hover:bg-primary/90"
                }`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : subscribed ? (
                  "Unsubscribe"
                ) : (
                  "Subscribe Now"
                )}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationBell;
