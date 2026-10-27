import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Search,
  Clock,
  Sparkles,
  Menu,
} from "lucide-react";
import { useStoreStatus } from "../context/StoreStatusContext";
import MobileSearchModal from "./MobileSearchModal";

export default function MobileAppHeader() {
  const { isOpen, openTime, closeTime, freeDeliveryThreshold } = useStoreStatus();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="md:hidden relative z-30 bg-[#121215] border-b border-stone-800 pt-[max(calc(env(safe-area-inset-top,0px)+26px),36px)] pb-3.5">
      {/* 1. App Top Bar: Logo, Location, Live Status & Menu Hub Action */}
      <div className="px-3.5 pt-1.5 pb-2.5 flex items-center justify-between gap-2.5">
        {/* Left: Brand & Location */}
        <Link to="/" className="flex items-center gap-2.5 flex-1 min-w-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-stone-900 to-black p-1 border border-stone-700/80 shrink-0 flex items-center justify-center shadow-sm">
            <img
              src="/images/logo.png"
              alt="Prime Cuts"
              className="w-full h-full object-contain filter drop-shadow-sm"
            />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-[16px] text-white tracking-tight leading-tight">
                Prime <span className="text-primary">Cuts</span>
              </span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${
                isOpen
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-400 border-amber-500/30"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                <span>{isOpen ? "Open" : "Pre-Order"}</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[12px] text-stone-300 font-semibold mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">Khudi Chowk, Pokhara-30</span>
            </div>
          </div>
        </Link>

        {/* Right: Menu Hub Button (Opens /menu with profile, notifications, outlet contact, settings) */}
        <Link
          to="/menu"
          className="h-10 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-90 border border-stone-700/80 flex items-center gap-1.5 text-white transition-all cursor-pointer shadow-sm shrink-0"
          title="Open Menu & Settings"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5 text-white" />
          <span className="text-xs font-black uppercase tracking-wider">Menu</span>
        </Link>
      </div>

      {/* 2. Expanded Search Bar (White BG, Black text & icon, clean box without search button) & Timing Info */}
      <div className="px-3.5 space-y-2.5">
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="w-full h-12 bg-white hover:bg-stone-50 active:scale-[0.98] border border-stone-200 rounded-2xl px-4 flex items-center text-left transition-all group cursor-pointer gap-3 shadow-sm select-none"
        >
          <Search className="w-5 h-5 text-black shrink-0" />
          <span className="font-bold text-[14px] text-stone-900 truncate">
            Search chicken, mutton, sausages, momos...
          </span>
        </button>

        {/* Free Delivery / Timing Info */}
        <div className="flex items-center justify-between px-0.5 text-[11px] text-stone-300 font-medium">
          <span className="flex items-center gap-1.5 text-stone-300 truncate">
            <Clock className="w-3 h-3 text-stone-400 shrink-0" />
            <span className="truncate">{openTime} – {closeTime}</span>
          </span>

          <span className="flex items-center gap-1 text-amber-300 font-semibold shrink-0">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Free Delivery &gt; <b>Rs. {freeDeliveryThreshold}</b></span>
          </span>
        </div>
      </div>

      {/* Instant Search Drawer */}
      <MobileSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  );
}
