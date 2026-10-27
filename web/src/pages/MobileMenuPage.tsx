import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Bell,
  Package,
  Clock,
  Sparkles,
  LogOut,
  ChevronRight,
  Smartphone,
  ShieldCheck,
  Lock,
  ExternalLink,
  Volume2,
  VolumeX,
  Sliders,
  Check,
  ShoppingBag,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useStoreStatus } from "../context/StoreStatusContext";
import { useCart } from "../context/CartContext";
import { usePWA } from "../context/PWAContext";
import SEO from "../components/SEO";
import NotificationBell from "../components/NotificationBell";

export default function MobileMenuPage() {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { isOpen, openTime, closeTime, freeDeliveryThreshold } = useStoreStatus();
  const { totalItems, cartTotal, openCart } = useCart();
  const { isInstalled, installApp } = usePWA();

  // In-page settings switches (no separate settings page)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem("pref_sound_enabled") !== "false";
  });
  const [orderAlerts, setOrderAlerts] = useState<boolean>(() => {
    return localStorage.getItem("pref_order_alerts") !== "false";
  });

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    localStorage.setItem("pref_sound_enabled", String(nextVal));
  };

  const toggleAlerts = () => {
    const nextVal = !orderAlerts;
    setOrderAlerts(nextVal);
    localStorage.setItem("pref_order_alerts", String(nextVal));
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-stone-900 flex flex-col pt-[max(calc(env(safe-area-inset-top,0px)+26px),36px)] pb-12">
      <SEO
        title="Menu & Account | Prime Cuts Butcher House"
        description="Manage your Prime Cuts account profile, saved addresses, live order alerts, outlet contact, and quick settings."
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
          Menu
        </h1>

        <div className="w-10 h-10 flex items-center justify-center">
          <NotificationBell type="customer" theme="light" />
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto w-full flex-1">
        {/* 1. Profile / Account Section */}
        {user ? (
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
                Active
              </span>
            </div>

            {/* Separate Edit Profile & Delivery Address links */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100">
              <Link
                to="/account?tab=profile"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-stone-50 hover:bg-stone-100/90 active:scale-95 border border-stone-200 rounded-xl text-stone-800 font-bold text-xs transition-transform"
              >
                <User className="w-3.5 h-3.5 text-primary" />
                <span>Edit Profile</span>
              </Link>

              <Link
                to="/account?tab=delivery"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-stone-50 hover:bg-stone-100/90 active:scale-95 border border-stone-200 rounded-xl text-stone-800 font-bold text-xs transition-transform"
              >
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Addresses</span>
              </Link>
            </div>

            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer active:scale-95 transition-transform"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-primary mx-auto flex items-center justify-center border border-red-100">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-base text-stone-900">Welcome to Prime Cuts</h2>
              <p className="text-xs text-stone-500 mt-0.5 font-medium">
                Sign in to track orders, save delivery addresses & get member rewards.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/login"
                className="py-2.5 px-3 bg-primary hover:bg-primary-hover active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs text-center"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="py-2.5 px-3 bg-stone-50 hover:bg-stone-100 active:scale-95 text-stone-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-stone-200 text-center"
              >
                Register
              </Link>
            </div>
          </div>
        )}

        {/* 2. Primary Navigation Links */}
        <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden divide-y divide-stone-100 shadow-2xs">
          {/* Cart / Shopping Bag (Works on laptop & mobile phone) */}
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

          {/* Notifications & Alerts (Redirects to Alerts section) */}
          <Link
            to="/account?tab=notifications"
            className="flex items-center justify-between p-3.5 hover:bg-stone-50 active:bg-stone-100/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-stone-900">Notifications & Alerts</h3>
                <p className="text-[11px] text-stone-500 font-medium">View instant order alerts & receipts</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400" />
          </Link>

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

        {/* 3. In-Menu Quick Preferences & Settings */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
            <Sliders className="w-4 h-4 text-primary" />
            <h3 className="font-black text-xs uppercase tracking-wider text-stone-700">
              Preferences & Settings
            </h3>
          </div>

          <div className="divide-y divide-stone-100">
            {/* Sound Toggle */}
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
                onClick={toggleSound}
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

            {/* Live Alerts Toggle */}
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
                onClick={toggleAlerts}
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

        {/* 4. Direct Butcher Contact & Outlet Info */}
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

          {/* Location & Timings */}
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

        {/* 5. App Install (if not already installed) */}
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

        {/* 6. Legal & Policies */}
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
      </div>
    </div>
  );
}
