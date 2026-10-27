import React, { useState, useRef, useEffect } from "react";
import { Phone, MessageCircle, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";

export default function FloatingSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const isDraggingRef = useRef(false);
  const location = useLocation();
  const { totalItems } = useCart();
  const [dragConstraints, setDragConstraints] = useState({
    top: -600,
    bottom: 20,
    left: -320,
    right: 10,
  });

  useEffect(() => {
    const updateConstraints = () => {
      if (typeof window !== "undefined") {
        setDragConstraints({
          top: -window.innerHeight + 140,
          bottom: 20,
          left: -window.innerWidth + 120,
          right: 10,
        });
      }
    };
    updateConstraints();
    window.addEventListener("resize", updateConstraints);
    return () => window.removeEventListener("resize", updateConstraints);
  }, []);

  // Hide on admin routes and mobile menu hub
  if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/menu")) {
    return null;
  }

  const PHONE_NUMBER = "+9779821316723";
  const WHATSAPP_URL = `https://wa.me/9779821316723?text=${encodeURIComponent(
    "Hello Prime Cuts! I would like to inquire about ordering fresh meat."
  )}`;

  // Position cleanly above liquid cart bar on mobile
  const bottomPositionClass =
    totalItems > 0
      ? "bottom-[max(5rem,calc(env(safe-area-inset-bottom,0px)+4.5rem))] md:bottom-6"
      : "bottom-[max(1.25rem,env(safe-area-inset-bottom,0px))] md:bottom-6";

  const handleToggle = () => {
    if (isDraggingRef.current) return;
    setIsOpen((prev) => !prev);
  };

  return (
    <motion.aside
      drag
      dragConstraints={dragConstraints}
      dragElastic={0.06}
      dragMomentum={false}
      onDragStart={() => {
        isDraggingRef.current = true;
      }}
      onDragEnd={() => {
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 120);
      }}
      aria-label="Customer Support and Instant Ordering"
      className={`fixed ${bottomPositionClass} right-3 sm:right-6 z-50 flex flex-col items-end gap-2 touch-none select-none`}
    >
      {/* Expanded Quick Contact Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.16 }}
            className="bg-white rounded-2xl p-3 shadow-2xl border border-stone-200/90 mb-1 flex flex-col gap-2 w-56 pointer-events-auto"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-2 px-1">
              <span className="text-xs font-black text-stone-900 uppercase tracking-wider">
                Butcher House Support
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Draggable Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.94 }}
        whileDrag={{ scale: 1.08 }}
        type="button"
        onClick={handleToggle}
        className="group flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-shadow cursor-grab active:cursor-grabbing border-2 border-white select-none pointer-events-auto"
        title="Drag to move anywhere • Tap to chat or call"
      >
        <MessageCircle className="w-5 h-5 fill-white" />
        <span className="inline text-xs font-black tracking-wide pr-1">
          Chat / Call
        </span>
      </motion.button>
    </motion.aside>
  );
}
