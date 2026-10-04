import React from "react";
import { useStoreStatus } from "../context/StoreStatusContext";
import { Clock, Sparkles, MapPin, AlertCircle } from "lucide-react";

export default function StoreStatusBanner() {
  const { isOpen, openTime, closeTime, closedMessage, freeDeliveryThreshold } = useStoreStatus();

  return (
    <div className="hidden md:block w-full bg-[#111113] border-b border-stone-800/80 text-white text-xs py-2 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-4 text-center sm:text-left">
        {/* Left: Open/Closed status */}
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <span className="flex items-center gap-1.5 font-bold">
            <span
              className={`w-2 h-2 rounded-full inline-block ${
                isOpen ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className={isOpen ? "text-emerald-400 font-extrabold uppercase tracking-wide" : "text-amber-400 font-extrabold uppercase tracking-wide"}>
              {isOpen ? "Shop Open" : "Pre-Orders Only"}
            </span>
          </span>

          <span className="text-stone-500 hidden sm:inline">•</span>

          <span className="text-stone-300 font-semibold flex items-center gap-1 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            {isOpen ? `Taking Orders: ${openTime} – ${closeTime}` : `Opens at ${openTime}`}
          </span>

          <span className="text-stone-500 hidden md:inline">•</span>

          <span className="text-stone-400 hidden md:flex items-center gap-1 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-primary" /> Khudi Chowk, Pokhara-30
          </span>
        </div>

        {/* Right: Free Delivery or Closed Notice */}
        <div className="flex items-center gap-2">
          {isOpen ? (
            <span className="text-stone-300 font-medium text-[11px] flex items-center gap-1 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Free Delivery on orders above <b className="text-white">Rs. {freeDeliveryThreshold}</b></span>
            </span>
          ) : (
            <span className="text-amber-300 font-medium text-[11px] flex items-center gap-1 bg-amber-950/30 px-2.5 py-0.5 rounded-full border border-amber-800/40">
              <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{closedMessage || "Accepting pre-orders for morning delivery."}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
