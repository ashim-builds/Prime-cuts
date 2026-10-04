import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  LogOut,
  Package,
  Bell,
  BellOff,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Volume2,
  VolumeX,
  MapPin,
  Clock,
  MessageSquare,
  Sparkles,
  Save,
  Check,
  ChevronRight,
  HelpCircle,
  FileText,
  ShieldCheck,
  Headphones,
  ChefHat,
  PackageCheck,
  XCircle,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { registerDevicePushSubscription, triggerDeviceNotification } from "../utils/deviceNotification";

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

export default function AccountPage() {
  const { user, isLoading, logout } = useUser();
  const navigate = useNavigate();

  // Notification state
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushError, setPushError] = useState("");
  const [testSuccess, setTestSuccess] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [fetchingNotifications, setFetchingNotifications] = useState(false);

  // Preference switches (stored in localStorage)
  const [orderAlerts, setOrderAlerts] = useState<boolean>(() => {
    return localStorage.getItem("pref_order_alerts") !== "false";
  });
  const [stockAlerts, setStockAlerts] = useState<boolean>(() => {
    return localStorage.getItem("pref_stock_alerts") !== "false";
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem("pref_sound_enabled") !== "false";
  });

  // Saved Delivery Address Settings
  const [savedAddress, setSavedAddress] = useState<string>(() => {
    return localStorage.getItem("customer_saved_address") || "";
  });
  const [savedNote, setSavedNote] = useState<string>(() => {
    return localStorage.getItem("customer_saved_note") || "";
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Active section tab for mobile tabs
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "delivery" | "settings">("profile");

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  // Check push subscription status
  const checkPushStatus = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setPermission(Notification.permission);

    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        setSubscribed(!!sub);
      }
    }
  };

  const loadNotifications = async () => {
    if (!user) return;
    setFetchingNotifications(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } catch (err) {
      console.error("[Account] Failed to load notifications", err);
    } finally {
      setFetchingNotifications(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkPushStatus();
      loadNotifications();
    }
  }, [user]);

  const handleTogglePush = async () => {
    setPushLoading(true);
    setPushError("");
    setTestSuccess(false);
    try {
      if (subscribed) {
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
      } else {
        await registerDevicePushSubscription("customer", user?.id);
        setSubscribed(true);
        setPermission("granted");
      }
    } catch (err: any) {
      setPushError(err.message || "Failed to update notification status.");
    } finally {
      setPushLoading(false);
    }
  };

  const handleSendTestPush = async () => {
    setPushLoading(true);
    setPushError("");
    setTestSuccess(false);
    try {
      await triggerDeviceNotification("🥩 Prime Cuts — Live Order Alert", {
        body: "🔔 Notifications are active! You will receive instant live updates on your orders.",
        url: "/orders",
      });

      await fetch("/api/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "customer", userId: user?.id }),
      });

      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 4000);
      loadNotifications();
    } catch (err: any) {
      setPushError(err.message || "Test notification failed.");
    } finally {
      setPushLoading(false);
    }
  };

  const handleTogglePref = (key: string, currentVal: boolean, setter: (v: boolean) => void) => {
    const newVal = !currentVal;
    setter(newVal);
    localStorage.setItem(key, String(newVal));
  };

  const handleSaveDeliveryPrefs = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("customer_saved_address", savedAddress);
    localStorage.setItem("customer_saved_note", savedNote);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications/read-all", { method: "PATCH" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error("[Account] Failed to mark read", err);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center text-stone-900">
        <div className="flex items-center gap-2 font-bold text-stone-500">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span>Loading your account...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] text-stone-900 min-h-screen pt-4 pb-28 sm:pt-8 sm:pb-24">
      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-3xl font-black text-stone-900 tracking-tight truncate">
              My <span className="text-primary">Account</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5 truncate">
              Manage your profile, delivery settings, and notifications
            </p>
          </div>

          <Link
            to="/orders"
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Package className="w-3.5 h-3.5" />
            <span>My Orders</span>
          </Link>
        </div>

        {/* User Profile Card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 mb-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-primary font-black text-2xl shrink-0 shadow-xs">
                {user.name?.charAt(0).toUpperCase() || <User className="w-7 h-7" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-stone-900 leading-tight">
                    {user.name}
                  </h2>
                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold uppercase rounded-full">
                    Verified Customer
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-500 mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    {user.email}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      {user.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={logout}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-stone-100 hover:bg-red-50 border border-stone-200 hover:border-red-200 text-stone-700 hover:text-red-600 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Bar - Strictly Single-Line */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-stone-200/60 border border-stone-200 rounded-2xl mb-6 shadow-2xs">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-1.5 px-0.5 text-center text-[11px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer truncate whitespace-nowrap ${
              activeTab === "profile"
                ? "bg-white text-stone-900 shadow-sm border border-stone-200/80"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Profile
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`py-1.5 px-0.5 text-center text-[11px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer relative truncate whitespace-nowrap ${
              activeTab === "notifications"
                ? "bg-white text-stone-900 shadow-sm border border-stone-200/80"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <span>Alerts</span>
            {subscribed && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1 mb-0.5" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("delivery")}
            className={`py-1.5 px-0.5 text-center text-[11px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer truncate whitespace-nowrap ${
              activeTab === "delivery"
                ? "bg-white text-stone-900 shadow-sm border border-stone-200/80"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Delivery
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`py-1.5 px-0.5 text-center text-[11px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer truncate whitespace-nowrap ${
              activeTab === "settings"
                ? "bg-white text-stone-900 shadow-sm border border-stone-200/80"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Settings
          </button>
        </div>

        {/* TAB 1: PROFILE & CONTACT */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs">
              <h3 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span>Personal Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                    Full Name
                  </span>
                  <p className="text-sm font-bold text-stone-900">{user.name}</p>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                    Registered Email
                  </span>
                  <p className="text-sm font-bold text-stone-900">{user.email}</p>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                    Contact Phone
                  </span>
                  <p className="text-sm font-bold text-stone-900">
                    {user.phone || "Not set (Used during checkout)"}
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                    Outlet Branch
                  </span>
                  <p className="text-sm font-bold text-stone-900">
                    Prime Cuts — Khudi Chowk, Pokhara-30
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/orders"
                className="bg-white hover:bg-stone-50 border border-stone-200 p-4 rounded-2xl flex items-center justify-between transition-all group cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 group-hover:text-primary transition-colors">
                      Order History & Tracking
                    </h4>
                    <p className="text-xs text-stone-500">View current and past meat orders</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <a
                href="https://wa.me/9779714324919?text=Hello%20Prime%20Cuts,%20I%20have%20an%20order%20inquiry"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-stone-50 border border-stone-200 p-4 rounded-2xl flex items-center justify-between transition-all group cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 group-hover:text-emerald-600 transition-colors">
                      WhatsApp Butcher Support
                    </h4>
                    <p className="text-xs text-stone-500">Direct chat with the shop manager</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        )}

        {/* TAB 2: NOTIFICATIONS CENTER */}
        {activeTab === "notifications" && (
          <div className="space-y-4">
            {/* Device Push Status Banner */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5 mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      subscribed
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : "bg-stone-100 text-stone-400 border border-stone-200"
                    }`}
                  >
                    {subscribed ? <Bell className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-stone-900">Device Push Notifications</h3>
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          permission === "denied"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : subscribed
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-stone-100 text-stone-600 border-stone-200"
                        }`}
                      >
                        {permission === "denied"
                          ? "Blocked in Browser"
                          : subscribed
                          ? "Active & Enabled"
                          : "Not Enabled"}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Receive live notification chimes and lock screen alerts when your meat is sliced, packed, and dispatched.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {subscribed && (
                    <button
                      onClick={handleSendTestPush}
                      disabled={pushLoading}
                      className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl border border-stone-200 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      {pushLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      <span>Test Alert</span>
                    </button>
                  )}

                  <button
                    onClick={handleTogglePush}
                    disabled={pushLoading || permission === "denied"}
                    className={`px-4 py-2 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      subscribed
                        ? "bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300"
                        : "bg-primary hover:bg-primary-hover text-white shadow-primary/20"
                    }`}
                  >
                    {pushLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : subscribed ? (
                      "Turn Off"
                    ) : (
                      "Enable Live Push"
                    )}
                  </button>
                </div>
              </div>

              {testSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Test alert dispatched successfully! Check your phone / desktop notification tray.</span>
                </div>
              )}

              {pushError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{pushError}</span>
                </div>
              )}

              {/* Notification Preferences Switches */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Notification Channels & Alerts
                </h4>

                <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-bold text-stone-900">Order Status & Delivery Updates</p>
                      <p className="text-[11px] text-stone-500">
                        Alert when order is confirmed, prepared, and out for delivery
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleTogglePref("pref_order_alerts", orderAlerts, setOrderAlerts)
                    }
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      orderAlerts ? "bg-primary" : "bg-stone-300"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                        orderAlerts ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="text-xs font-bold text-stone-900">Daily Fresh Stock & Cut Announcements</p>
                      <p className="text-[11px] text-stone-500">
                        Morning castrated goat (khasi), broiler & sausage stock alerts
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleTogglePref("pref_stock_alerts", stockAlerts, setStockAlerts)
                    }
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      stockAlerts ? "bg-primary" : "bg-stone-300"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                        stockAlerts ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex items-center gap-2.5">
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-stone-400" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-stone-900">Sound & Vibration Alerts</p>
                      <p className="text-[11px] text-stone-500">Play distinctive chime when new alert arrives</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleTogglePref("pref_sound_enabled", soundEnabled, setSoundEnabled)
                    }
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      soundEnabled ? "bg-primary" : "bg-stone-300"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                        soundEnabled ? "right-1" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Notifications Inbox */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <span>Recent Notifications</span>
                </h3>

                {notifications.length > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-stone-500 hover:text-stone-900 underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {fetchingNotifications ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-stone-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                  <p className="text-sm font-semibold text-stone-600">No notifications yet.</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Your order progress updates and announcements will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                  {notifications.map((notif) => {
                    let StatusIcon = Clock;
                    let borderClass = "border-stone-200 bg-stone-50/70";

                    if (notif.type === "ORDER_PREPARING") {
                      StatusIcon = ChefHat;
                      borderClass = "border-amber-200 bg-amber-50/50";
                    } else if (notif.type === "ORDER_READY") {
                      StatusIcon = PackageCheck;
                      borderClass = "border-purple-200 bg-purple-50/50";
                    } else if (notif.type === "ORDER_COMPLETED") {
                      StatusIcon = CheckCircle2;
                      borderClass = "border-emerald-200 bg-emerald-50/50";
                    } else if (notif.type === "ORDER_CANCELLED") {
                      StatusIcon = XCircle;
                      borderClass = "border-red-200 bg-red-50/50";
                    }

                    return (
                      <div
                        key={notif.id}
                        className={`p-3.5 rounded-xl border transition-all ${borderClass} ${
                          notif.read ? "opacity-75" : "shadow-xs"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <StatusIcon className="w-4 h-4 text-primary shrink-0" />
                            <h5 className="text-xs font-bold text-stone-900">{notif.title}</h5>
                            {!notif.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-stone-400 shrink-0">
                            {formatTimeAgo(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1">{notif.message}</p>
                        {notif.order && (
                          <div className="mt-2">
                            <Link
                              to={`/orders/${notif.order.orderNumber}`}
                              className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1"
                            >
                              <span>View Order #{notif.order.orderNumber}</span>
                              <span>→</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SAVED DELIVERY ADDRESS & PREFERENCES */}
        {activeTab === "delivery" && (
          <form onSubmit={handleSaveDeliveryPrefs} className="space-y-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs">
              <h3 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Saved Delivery Address & Instructions</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Default Delivery Address in Pokhara
                  </label>
                  <textarea
                    rows={2}
                    value={savedAddress}
                    onChange={(e) => setSavedAddress(e.target.value)}
                    placeholder="e.g. Khudi Chowk, Pokhara-30, near Water Tank / Pokhara University Gate"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    This address will auto-fill during checkout for fast 1-click orders.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Special Rider Delivery Note
                  </label>
                  <input
                    type="text"
                    value={savedNote}
                    onChange={(e) => setSavedNote(e.target.value)}
                    placeholder="e.g. Please call when reaching the main road / Ring the doorbell"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                  />
                </div>

                {savedSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Delivery preferences saved successfully!</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Delivery Preferences</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* TAB 4: APP & HELP SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs">
              <h3 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span>Support & Legal Information</span>
              </h3>

              <div className="space-y-2.5">
                <a
                  href="tel:9714324919"
                  className="flex items-center justify-between p-3.5 bg-stone-50 hover:bg-stone-100/80 rounded-xl border border-stone-200 transition-all text-stone-700 hover:text-stone-900 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Headphones className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-bold text-stone-900">Direct Phone Support</p>
                      <p className="text-[11px] text-stone-500">+977 9714324919 / 9747470470</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </a>

                <Link
                  to="/privacy-policy"
                  className="flex items-center justify-between p-3.5 bg-stone-50 hover:bg-stone-100/80 rounded-xl border border-stone-200 transition-all text-stone-700 hover:text-stone-900 group"
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-bold text-stone-900">Privacy Policy</p>
                      <p className="text-[11px] text-stone-500">Data safety and cookie policies</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/terms"
                  className="flex items-center justify-between p-3.5 bg-stone-50 hover:bg-stone-100/80 rounded-xl border border-stone-200 transition-all text-stone-700 hover:text-stone-900 group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-bold text-stone-900">Terms & Conditions</p>
                      <p className="text-[11px] text-stone-500">Order, delivery, and refund guidelines</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Logout Action */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-stone-900">Sign Out from Device</h4>
                <p className="text-xs text-stone-500">End your current session safely</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
