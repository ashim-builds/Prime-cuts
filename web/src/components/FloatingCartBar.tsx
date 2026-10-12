import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function FloatingCartBar() {
  const { items, cartTotal, totalItems, openCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on checkout, order detail, and login pages
  const isHiddenRoute =
    location.pathname.startsWith("/checkout") ||
    location.pathname.startsWith("/order") ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/admin");

  if (items.length === 0 || isHiddenRoute) {
    return null;
  }

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openCart();
  };

  return (
    <aside 
      aria-label="Current Cart Summary"
      className="md:hidden fixed bottom-[94px] left-0 right-0 z-40 px-3 pointer-events-none"
    >
      {/* Liquid Glass Pill (Mobile Only) */}
      <div 
        onClick={openCart}
        className="max-w-md mx-auto bg-stone-950/75 backdrop-blur-2xl text-white rounded-full py-1.5 px-2.5 shadow-[0_8px_32px_0_rgba(0,0,0,0.55)] border border-white/20 flex items-center justify-between gap-2.5 pointer-events-auto cursor-pointer hover:bg-stone-950/85 transition-all active:scale-[0.98]"
      >
        {/* Left: Bag & Count & Price */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white relative shadow-sm shadow-primary/40 shrink-0">
            <ShoppingBag className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 bg-white text-stone-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {totalItems}
            </span>
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
        <button
          type="button"
          onClick={handleCartClick}
          className="flex items-center gap-1 px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white font-black text-[11px] uppercase tracking-wider rounded-full transition-all shadow-md shadow-primary/30 shrink-0 cursor-pointer active:scale-95"
        >
          <span>VIEW CART</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
