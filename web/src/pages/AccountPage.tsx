import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
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
  Sparkles,
  Save,
  ChevronRight,
  ShoppingBag,
  ExternalLink,
  Smartphone,
  Sliders,
  Lock,
  ChefHat,
  PackageCheck,
  XCircle,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useCart } from "../context/CartContext";
import { useStoreStatus } from "../context/StoreStatusContext";
import { usePWA } from "../context/PWAContext";
import { registerDevicePushSubscription, triggerDeviceNotification } from "../utils/deviceNotification";
import SEO from "../components/SEO";
import NotificationBell from "../components/NotificationBell";

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
  const { user, isLoading, logout, refreshUser } = useUser();
  const { totalItems, cartTotal, openCart } = useCart();
  const { isOpen, openTime, closeTime, freeDeliveryThreshold } = useStoreStatus();
  const { isInstalled, installApp } = usePWA();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as "overview" | "profile" | "notifications" | "delivery" | null;

  // Active section tab
  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "notifications" | "delivery">(() => {
    if (tabParam && ["overview", "profile", "notifications", "delivery"].includes(tabParam)) {
      return tabParam;
    }
    return "overview";
  });

  useEffect(() => {
    if (tabParam && ["overview", "profile", "notifications", "delivery"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Profile Edit State
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditPhone(user.phone || "");
    }
  }, [user]);

  // Check 30-day name change restriction
  const checkNameChangeEligibility = () => {
    if (!user?.lastNameChange) {
      return { canChange: true, remainingDays: 0, nextAllowedDateStr: "" };
    }
    const lastChangeTime = new Date(user.lastNameChange).getTime();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const diffMs = Date.now() - lastChangeTime;
    if (diffMs >= thirtyDaysMs) {
      return { canChange: true, remainingDays: 0, nextAllowedDateStr: "" };
    }
    const remainingDays = Math.ceil((thirtyDaysMs - diffMs) / (24 * 60 * 60 * 1000));
    const nextAllowedDate = new Date(lastChangeTime + thirtyDaysMs);
    const nextAllowedDateStr = nextAllowedDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return { canChange: false, remainingDays, nextAllowedDateStr };
  };

  const { canChange: canChangeName, remainingDays, nextAllowedDateStr } = checkNameChangeEligibility();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          phone: editPhone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile.");
      }

      setProfileSuccess(data.message || "Profile updated successfully!");
      await refreshUser();
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err: any) {
      setProfileError(err.message || "Failed to save profile changes.");
    } finally {
      setProfileSaving(false);
    }
  };

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
      await triggerDeviceNotification("Prime Cuts — Live Order Alert", {
        body: "Test notification: Notifications are active! You will receive instant live updates on your orders.",
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

  const switchTab = (tab: "overview" | "profile" | "notifications" | "delivery") => {
    setActiveTab(tab);
    if (tab === "overview") {
      searchParams.delete("tab");
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ tab }, { replace: true });
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
    <div className="min-h-screen bg-[#f8f9fa] text-stone-900 flex flex-col pt-[max(calc(env(safe-area-inset-top,0px)+26px),36px)] pb-12">
      <SEO
        title="My Customer Account | Prime Cuts Butcher House"
        description="Manage your Prime Cuts account profile, saved delivery addresses, notification preferences, and orders."
        url="/account"
      />

      {/* Top Header Bar */}
      <div className="px-4 py-3 border-b border-stone-200/90 flex items-center justify-between sticky top-0 bg-[#f8f9fa]/95 backdrop-blur-md z-30">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 active:scale-90 flex items-center justify-center text-stone-800 shadow-2xs transition-all cursor-pointer"
          title="Go back"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-base font-black tracking-tight text-stone-900">
          My Account
        </h1>

        <div className="w-10 h-10 flex items-center justify-center">
          <NotificationBell type="customer" theme="light" />
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-lg md:max-w-xl mx-auto w-full flex-1">
        {/* 1. Profile / Account Card (Same as Menu Page) */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4.5 shadow-2xs space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-primary font-black text-xl shrink-0 shadow-2xs">
              {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-black text-base text-stone-900 truncate">
                {user.name || "Valued Customer"}
              </h2>
              <p className="text-xs text-stone-500 font-semibold truncate mt-0.5">
                {user.email || user.phone || "Prime Cuts Member"}
              </p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Verified
            </span>
          </div>

          {/* Quick tab switcher pill bar */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200/80">
            <button
              type="button"
              onClick={() => switchTab("overview")}
              className={`py-1.5 px-0.5 text-center text-[11px] font-bold rounded-lg transition-all cursor-pointer truncate ${
                activeTab === "overview"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Overview
            </button>

            <button
              type="button"
              onClick={() => switchTab("profile")}
              className={`py-1.5 px-0.5 text-center text-[11px] font-bold rounded-lg transition-all cursor-pointer truncate ${
                activeTab === "profile"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Profile
            </button>

            <button
              type="button"
              onClick={() => switchTab("delivery")}
              className={`py-1.5 px-0.5 text-center text-[11px] font-bold rounded-lg transition-all cursor-pointer truncate ${
                activeTab === "delivery"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Addresses
            </button>

            <button
              type="button"
              onClick={() => switchTab("notifications")}
              className={`py-1.5 px-0.5 text-center text-[11px] font-bold rounded-lg transition-all cursor-pointer truncate relative ${
                activeTab === "notifications"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <span>Alerts</span>
              {subscribed && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1 mb-0.5" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-end pt-0.5">
            <button
              type="button"
              onClick={logout}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer active:scale-95 transition-transform"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* ===================== TAB 1: OVERVIEW (SAME AS MENU PAGE) ===================== */}
        {activeTab === "overview" && (
          <>
            {/* Primary Navigation Cards */}
            <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden divide-y divide-stone-100 shadow-2xs">
              {/* Cart Option (Works on laptop & mobile phone) */}
              <button
                type="button"
                onClick={openCart}
                className="w-full flex items-center justify-between p-3.5 hover:bg-stone-50 active:bg-stone-100/70 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 text-primary flex items-center justify-center relative shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                        {totalItems}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-stone-900">My Cart</h3>
                      {totalItems > 0 && (
                        <span className="text-[10px] font-black text-primary bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                          {totalItems} {totalItems === 1 ? "item" : "items"}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 font-medium truncate">
                      {totalItems > 0
                        ? `Rs. ${cartTotal.toFixed(2)} in bag • Tap to review & checkout`
                        : "Your bag is empty • Tap to review"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400 shrink-0" />
              </button>

              {/* My Orders */}
              <Link
                to="/orders"
                className="flex items-center justify-between p-3.5 hover:bg-stone-50 active:bg-stone-100/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 text-primary flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">My Orders</h3>
                    <p className="text-[11px] text-stone-500 font-medium">Track live status & past order receipts</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400" />
              </Link>

              {/* Notifications & Alerts */}
              <button
                type="button"
                onClick={() => switchTab("notifications")}
                className="w-full flex items-center justify-between p-3.5 hover:bg-stone-50 active:bg-stone-100/70 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">Notifications & Alerts</h3>
                    <p className="text-[11px] text-stone-500 font-medium">Manage push notifications & view alerts</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400" />
              </button>

              {/* Saved Delivery Addresses */}
              <button
                type="button"
                onClick={() => switchTab("delivery")}
                className="w-full flex items-center justify-between p-3.5 hover:bg-stone-50 active:bg-stone-100/70 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">Saved Delivery Addresses</h3>
                    <p className="text-[11px] text-stone-500 font-medium">Default location & delivery instructions</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400" />
              </button>

              {/* Meat Catalog */}
              <Link
                to="/#shop-cuts"
                className="flex items-center justify-between p-3.5 hover:bg-stone-50 active:bg-stone-100/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">Fresh Meat Catalog</h3>
                    <p className="text-[11px] text-stone-500 font-medium">Browse Khasi, chicken, sausages & momos</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400" />
              </Link>
            </div>

            {/* In-Menu Quick Preferences */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                <Sliders className="w-4 h-4 text-primary" />
                <h3 className="font-black text-xs uppercase tracking-wider text-stone-700">
                  Preferences & Settings
                </h3>
              </div>

              <div className="divide-y divide-stone-100">
                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-stone-400" />
                    )}
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">Notification Sound</span>
                      <span className="text-[10px] text-stone-500 block">Audio beep on new order events</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePref("pref_sound_enabled", soundEnabled, setSoundEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      soundEnabled ? "bg-primary" : "bg-stone-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${
                        soundEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-stone-600" />
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">Live Order Alerts</span>
                      <span className="text-[10px] text-stone-500 block">Status updates for dispatch & delivery</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePref("pref_order_alerts", orderAlerts, setOrderAlerts)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      orderAlerts ? "bg-primary" : "bg-stone-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${
                        orderAlerts ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Direct Butcher Contact */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xs uppercase tracking-wider text-stone-700">
                  Butcher Outlet & Contact
                </h3>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    isOpen
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                  <span>{isOpen ? "Shop Open Now" : "Pre-Order Available"}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:9714324919"
                  className="p-3 bg-stone-50 hover:bg-stone-100 active:scale-95 border border-stone-200 rounded-xl flex items-center gap-2.5 transition-transform"
                >
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-stone-500 block leading-tight">Call Outlet 1</span>
                    <span className="font-black text-xs text-stone-900 truncate block">9714324919</span>
                  </div>
                </a>

                <a
                  href="tel:9747470470"
                  className="p-3 bg-stone-50 hover:bg-stone-100 active:scale-95 border border-stone-200 rounded-xl flex items-center gap-2.5 transition-transform"
                >
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-stone-500 block leading-tight">Call Outlet 2</span>
                    <span className="font-black text-xs text-stone-900 truncate block">9747470470</span>
                  </div>
                </a>
              </div>

              <div className="pt-2 border-t border-stone-100 space-y-2 text-xs text-stone-600">
                <a
                  href="https://maps.app.goo.gl/cEEEaU5Gj6EjC4Uo9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate font-semibold text-stone-800">Khudi Chowk, Pokhara-30</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                </a>

                <div className="flex items-center justify-between px-1 text-[11px] text-stone-500">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>Operating Hours:</span>
                  </span>
                  <span className="font-bold text-stone-800">{openTime} – {closeTime}</span>
                </div>

                <div className="flex items-center justify-between px-1 text-[11px] text-stone-500">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Free Delivery:</span>
                  </span>
                  <span className="font-bold text-amber-700">Orders above Rs. {freeDeliveryThreshold}</span>
                </div>
              </div>
            </div>

            {/* App Install */}
            {!isInstalled && (
              <div className="bg-gradient-to-r from-red-50 to-stone-50 border border-red-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-stone-900">Install Prime Cuts App</h4>
                    <p className="text-[11px] text-stone-500 font-medium">Add to home screen for 1-tap orders</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={installApp}
                  className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-wider rounded-xl active:scale-95 shadow-xs transition-transform shrink-0 cursor-pointer"
                >
                  Install
                </button>
              </div>
            )}

            {/* Legal */}
            <div className="pt-2 text-center space-y-2">
              <div className="flex items-center justify-center gap-4 text-xs font-semibold text-stone-500">
                <Link to="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
                <span>•</span>
                <Link to="/privacy-policy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
                <span>•</span>
                <Link to="/admin/login" className="hover:text-primary transition-colors flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Admin</span>
                </Link>
              </div>
              <p className="text-[11px] text-stone-400">
                © {new Date().getFullYear()} Prime Cuts Butcher House. All rights reserved.
              </p>
            </div>
          </>
        )}

        {/* ===================== TAB 2: PROFILE DETAILS & EDIT ===================== */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-black text-sm text-stone-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span>Edit Profile Details</span>
                </h3>
                <button
                  type="button"
                  onClick={() => switchTab("overview")}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  ← Back to Menu
                </button>
              </div>

              {profileSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <div className="space-y-3.5">
                {/* 1. Full Customer Name */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Full Customer Name
                    </label>
                    {!canChangeName ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>Locked (1 Month Rule)</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-400 font-medium">
                        Change allowed
                      </span>
                    )}
                  </div>

                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    disabled={!canChangeName}
                    placeholder="Enter your full name"
                    required
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition-colors font-medium border ${
                      !canChangeName
                        ? "bg-stone-100/80 border-stone-200 text-stone-500 cursor-not-allowed select-none"
                        : "bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-primary focus:bg-white"
                    }`}
                  />

                  {!canChangeName ? (
                    <div className="mt-2 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2 text-amber-900 text-xs">
                      <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-[11px] leading-relaxed">
                        <span className="font-bold block">Name change restricted</span>
                        Profile names can only be changed once every 1 month (30 days). Your next name update is available in <strong>{remainingDays} day{remainingDays === 1 ? "" : "s"}</strong> (on <strong>{nextAllowedDateStr}</strong>).
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-stone-500 mt-1">
                      Note: You can only edit your name once every 30 days.
                    </p>
                  )}
                </div>

                {/* 2. Registered Email (Immutable) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Registered Email
                    </label>
                    <span className="text-[10px] uppercase font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
                      Account Login ID
                    </span>
                  </div>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full bg-stone-100/80 border border-stone-200 text-stone-500 rounded-xl px-3.5 py-2.5 text-sm cursor-not-allowed select-none font-medium"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Email address is tied to your login authentication and cannot be changed.
                  </p>
                </div>

                {/* 3. Contact Phone (Editable anytime) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Contact Phone Number
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Editable Anytime
                    </span>
                  </div>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="e.g. 9812345678"
                    className="w-full bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors font-medium"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Used for order dispatch calls and SMS updates by our Pokhara delivery riders.
                  </p>
                </div>

                {/* 4. Butcher Outlet Info */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs text-stone-600">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">
                    Assigned Butcher Outlet
                  </span>
                  <p className="font-bold text-stone-900 mt-0.5">
                    Prime Cuts — Khudi Chowk, Pokhara-30 (Lekhnath)
                  </p>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {profileSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{profileSaving ? "Saving Changes..." : "Save Profile Details"}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ===================== TAB 3: SAVED DELIVERY ADDRESS ===================== */}
        {activeTab === "delivery" && (
          <form onSubmit={handleSaveDeliveryPrefs} className="space-y-4">
            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-black text-sm text-stone-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Saved Delivery Addresses</span>
                </h3>
                <button
                  type="button"
                  onClick={() => switchTab("overview")}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  ← Back to Menu
                </button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Default Delivery Location in Pokhara
                  </label>
                  <textarea
                    rows={3}
                    value={savedAddress}
                    onChange={(e) => setSavedAddress(e.target.value)}
                    placeholder="e.g. Khudi Chowk, Pokhara-30, near Water Tank / Pokhara University Gate"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    This location will auto-populate during checkout for rapid 1-click ordering.
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

                <button
                  type="submit"
                  className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Delivery Address</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ===================== TAB 4: NOTIFICATIONS & ALERTS ===================== */}
        {activeTab === "notifications" && (
          <div className="space-y-4">
            {/* Push Notification Switcher */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      subscribed
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : "bg-stone-100 text-stone-400 border border-stone-200"
                    }`}
                  >
                    {subscribed ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">Device Push Alerts</h3>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
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
                </div>

                <button
                  type="button"
                  onClick={handleTogglePush}
                  disabled={pushLoading || permission === "denied"}
                  className={`px-3 py-1.5 font-black text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                    subscribed
                      ? "bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300"
                      : "bg-primary hover:bg-primary-hover text-white shadow-primary/20"
                  }`}
                >
                  {pushLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : subscribed ? (
                    "Turn Off"
                  ) : (
                    "Enable Push"
                  )}
                </button>
              </div>

              {testSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Test notification received!</span>
                </div>
              )}

              {pushError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{pushError}</span>
                </div>
              )}

              {subscribed && (
                <button
                  type="button"
                  onClick={handleSendTestPush}
                  disabled={pushLoading}
                  className="w-full py-2.5 px-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 font-bold text-xs rounded-xl active:scale-95 transition-transform cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Bell className="w-4 h-4 text-primary" />
                  <span>Send Test Order Alert to My Phone</span>
                </button>
              )}
            </div>

            {/* Notifications Inbox */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <h3 className="font-black text-sm text-stone-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <span>Recent Alerts & Receipts</span>
                </h3>

                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-xs text-stone-500 hover:text-stone-900 underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {fetchingNotifications ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-6 text-stone-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-1.5 text-stone-300" />
                  <p className="text-xs font-bold text-stone-600">No alerts yet</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Live updates when your meat is sliced, packed & dispatched will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
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
                        className={`p-3 rounded-xl border transition-all ${borderClass} ${
                          notif.read ? "opacity-75" : "shadow-2xs"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <StatusIcon className="w-3.5 h-3.5 text-primary shrink-0" />
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
                          <div className="mt-1.5">
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
      </div>
    </div>
  );
}
