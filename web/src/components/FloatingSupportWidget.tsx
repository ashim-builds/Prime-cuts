import React, { useState } from "react";
import { Phone, MessageCircle, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function FloatingSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();

  // Hide on admin routes
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const PHONE_NUMBER = "+9779821316723";
  const WHATSAPP_URL = `https://wa.me/9779821316723?text=${encodeURIComponent(
    "Hello Prime Cuts! I would like to inquire about ordering fresh meat."
  )}`;

  // Raise position cleanly above liquid cart bar on mobile
  const bottomPositionClass =
    totalItems > 0 ? "bottom-[154px] md:bottom-6" : "bottom-[94px] md:bottom-6";

  return (
    <aside 
      aria-label="Customer Support and Instant Ordering"
      className={`fixed ${bottomPositionClass} right-3 sm:right-6 z-40 flex flex-col items-end gap-2 transition-all duration-300`}
    >
      {/* Expanded Quick Contact Menu */}
      {isOpen && (
        <div className="bg-white rounded-2xl p-3 shadow-2xl border border-stone-200/90 mb-1 flex flex-col gap-2 w-56 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2 px-1">
            <span className="text-xs font-black text-stone-900 uppercase tracking-wider">
              Butcher House Support
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-700 p-0.5 rounded-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* WhatsApp Direct Chat */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <MessageCircle className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="text-xs font-bold leading-tight text-emerald-900">
                WhatsApp Chat
              </div>
              <div className="text-[10px] text-emerald-700 font-medium">
                Instant meat orders & queries
              </div>
            </div>
          </a>

          {/* Direct Phone Call */}
          <a
            href={`tel:${PHONE_NUMBER}`}
            className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-800 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold leading-tight text-stone-900">
                Direct Call
              </div>
              <div className="text-[10px] text-stone-500 font-medium font-mono">
                9821316723
              </div>
            </div>
          </a>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-white active:scale-95"
        title="Contact Prime Cuts Butcher House"
      >
        <MessageCircle className="w-5 h-5 fill-white" />
        <span className="hidden sm:inline text-xs font-black tracking-wide pr-1">
          Chat / Call
        </span>
      </button>
    </aside>
  );
}
