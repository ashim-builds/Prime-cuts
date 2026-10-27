import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";

export default function FloatingCartBar() {
  const { items, cartTotal, totalItems, openCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on checkout, order detail, menu, and login pages
  const isHiddenRoute =
    location.pathname.startsWith("/checkout") ||
    location.pathname.startsWith("/order") ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/menu") ||
    location.pathname.startsWith("/admin");

  const isVisible = items.length > 0 && !isHiddenRoute;

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openCart();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          initial={{ y: 80, opacity: 0, scale: 0.92 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{
            y: 80,
            opacity: 0,
            scale: 0.92,
            transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] },
          }}
          transition={{
            type: "spring",
            damping: 26,
            stiffness: 350,
          }}
          aria-label="Current Cart Summary"
          className="md:hidden fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 px-3 pointer-events-none will-change-transform"
        >
          {/* Liquid Glass Pill (Mobile Only) */}
          <motion.div
            whileTap={{ scale: 0.97 }}
            onClick={openCart}
            className="max-w-md mx-auto bg-stone-950/85 backdrop-blur-2xl text-white rounded-full py-1.5 px-2.5 shadow-[0_8px_32px_0_rgba(0,0,0,0.55)] border border-white/20 flex items-center justify-between gap-2.5 pointer-events-auto cursor-pointer hover:bg-stone-950/95 transition-colors"
          >
            {/* Left: Bag & Count & Price */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white relative shadow-sm shadow-primary/40 shrink-0">
                <ShoppingBag className="w-4 h-4" />
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 600, damping: 15 }}
                  className="absolute -top-1 -right-1 bg-white text-stone-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs"
                >
                  {totalItems}
                </motion.span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-black text-white tracking-tight">
                  Rs. {cartTotal.toFixed(2)}
                </span>
                <span className="text-[10px] font-bold text-stone-300">
                  ({totalItems} {totalItems === 1 ? "item" : "items"})
                </span>
              </div>
            </div>

            {/* Right: Sleek View Cart Button (Opens Cart Drawer, not direct checkout) */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={handleCartClick}
              className="flex items-center gap-1 px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white font-black text-[11px] uppercase tracking-wider rounded-full shadow-md shadow-primary/30 shrink-0 cursor-pointer"
            >
              <span>VIEW CART</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
