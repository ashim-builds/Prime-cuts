import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Search,
  Phone,
  Clock,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Flame,
} from "lucide-react";
import { useStoreStatus } from "../context/StoreStatusContext";
import { useCart } from "../context/CartContext";
import NotificationBell from "./NotificationBell";
import MobileSearchModal from "./MobileSearchModal";

export default function MobileAppHeader() {
  const { isOpen, openTime, closeTime, freeDeliveryThreshold } = useStoreStatus();
  const { totalItems, openCart } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="md:hidden relative z-30 bg-[#121215] border-b border-stone-800/90 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
      {/* 1. App Top Bar: Logo, Location, Live Status & Notification */}
      <div className="px-3 pt-2 pb-1.5 flex items-center justify-between gap-2">
        {/* Left: Brand & Location */}
        <Link to="/" className="flex items-center gap-2 flex-1 min-w-0 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-stone-900 to-black p-1 border border-stone-800 shrink-0 flex items-center justify-center shadow-md">
            <img
              src="/images/logo.png"
              alt="Prime Cuts"
              className="w-full h-full object-contain filter drop-shadow-sm"
            />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-[13px] text-white tracking-tight leading-none">
                Prime <span className="text-primary">Cuts</span>
              </span>
              <span className={`inline-flex items-center gap-1 text-[8.5px] font-black px-1.5 py-0.2 rounded-full border ${
                isOpen
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-400 border-amber-500/30"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                <span>{isOpen ? "Open" : "Pre-Order"}</span>
              </span>
            </div>

            <div className="flex items-center gap-1 text-[10.5px] text-stone-300 font-semibold mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-primary shrink-0" />
              <span className="truncate">Khudi Chowk, Pokhara-30</span>
            </div>
          </div>
        </Link>

        {/* Right: Quick Call & Notification Bell */}
        <div className="flex items-center gap-1 shrink-0">
          <a
            href="tel:9714324919"
            className="w-7.5 h-7.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-primary transition-colors"
            title="Call Outlet"
          >
            <Phone className="w-3 h-3" />
          </a>

          <NotificationBell type="customer" />
        </div>
      </div>

      {/* 2. Ultra-Compact Single-Line Search Bar for iPhone SE */}
      <div className="px-3 pb-2 space-y-1">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-full h-8 bg-[#1b1b20] hover:bg-[#222228] border border-stone-700/60 rounded-xl px-2.5 flex items-center justify-between text-left transition-all shadow-inner group cursor-pointer gap-2"
        >
          <div className="flex items-center gap-1.5 text-stone-400 text-xs min-w-0 flex-1">
            <Search className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-medium text-stone-300 truncate text-[11px] whitespace-nowrap">
              Search chicken, mutton, sausages...
            </span>
          </div>

          <span className="text-[9px] font-bold text-stone-300 bg-stone-800/90 px-1.5 py-0.5 rounded-md border border-stone-700 shrink-0">
            Find
          </span>
        </button>

        {/* Free Delivery / Timing Micro-Chip */}
        <div className="flex items-center justify-between px-0.5 text-[10px] text-stone-400 font-medium">
          <span className="flex items-center gap-1 text-stone-300 truncate">
            <Clock className="w-2.5 h-2.5 text-stone-400 shrink-0" />
            <span className="truncate">{openTime} – {closeTime}</span>
          </span>

          <span className="flex items-center gap-1 text-amber-300 font-semibold shrink-0">
            <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
            <span>Free Delivery &gt; <b>Rs. {freeDeliveryThreshold}</b></span>
          </span>
        </div>
      </div>

      {/* Instant Search Bottom Drawer */}
      <MobileSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  );
}
