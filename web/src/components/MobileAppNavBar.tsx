import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingBag, ClipboardList, User } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import MobileSearchModal from "./MobileSearchModal";
import { motion } from "framer-motion";

export default function MobileAppNavBar() {
  const location = useLocation();
  const { totalItems, cartTotal, openCart } = useCart();
  const { user } = useUser();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Hide on admin routes and checkout page (checkout has its own sticky Place Order bar)
  if (location.pathname.startsWith("/admin") || location.pathname === "/checkout") {
    return null;
  }

  const isHome = location.pathname === "/" || location.pathname === "/shop";
  const isOrders = location.pathname === "/orders" || location.pathname.startsWith("/orders/") || location.pathname === "/my-orders";
  const isAccount = location.pathname === "/account" || location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      {/* Mobile Floating Cart Summary Bar if Cart has items & not on checkout */}
      {totalItems > 0 && location.pathname !== "/checkout" && (
        <div className="md:hidden fixed bottom-24 left-3 right-3 z-40 pointer-events-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-primary/95 backdrop-blur-md text-white rounded-2xl py-2 px-3.5 shadow-2xl flex items-center justify-between cursor-pointer border border-white/20 active:scale-[0.98] transition-transform"
            onClick={openCart}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-black/25 flex items-center justify-center font-black text-xs shadow-inner">
                {totalItems}
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/80 leading-none">Your Meat Cart</p>
                <p className="text-xs font-black leading-tight mt-0.5 whitespace-nowrap">Rs. {cartTotal.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 font-black text-[11px] uppercase tracking-wider bg-white/20 hover:bg-white/30 active:bg-white/40 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-white/20 shadow-xs transition-colors">
              <span>View Cart</span>
              <span className="text-xs">➔</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Native Bottom Navigation Bar - Elevated high above Android 3-button back bar / gesture bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111113]/95 backdrop-blur-xl border-t border-stone-800/80 px-2 pt-2 pb-[max(1.75rem,calc(env(safe-area-inset-bottom,0px)+1.25rem))] shadow-[0_-4px_24px_rgba(0,0,0,0.6)]">
        <div className="grid grid-cols-5 items-center max-w-md mx-auto">
          {/* 1. Home / Meat Cuts */}
          <Link
            to="/"
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors ${
              isHome ? "text-primary font-black" : "text-stone-400 hover:text-white font-medium"
            }`}
          >
            <Home className={`w-5.5 h-5.5 mb-1 ${isHome ? "stroke-[2.5]" : ""}`} />
            <span className="text-[11px] font-semibold tracking-tight">Meat Cuts</span>
          </Link>

          {/* 2. Instant Search */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-stone-400 hover:text-white font-medium cursor-pointer"
          >
            <Search className="w-5.5 h-5.5 mb-1" />
            <span className="text-[11px] font-semibold tracking-tight">Search</span>
          </button>

          {/* 3. Cart with live badge */}
          <button
            onClick={openCart}
            className="relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-stone-400 hover:text-white font-medium cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="w-5.5 h-5.5 mb-1" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-primary text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-[#111113] animate-pulse">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-[11px] font-semibold tracking-tight">Cart</span>
          </button>

          {/* 4. My Orders */}
          <Link
            to="/orders"
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors ${
              isOrders ? "text-primary font-black" : "text-stone-400 hover:text-white font-medium"
            }`}
          >
            <ClipboardList className={`w-5.5 h-5.5 mb-1 ${isOrders ? "stroke-[2.5]" : ""}`} />
            <span className="text-[11px] font-semibold tracking-tight">My Orders</span>
          </Link>

          {/* 5. Account */}
          <Link
            to={user ? "/account" : "/login"}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors ${
              isAccount ? "text-primary font-black" : "text-stone-400 hover:text-white font-medium"
            }`}
          >
            <User className={`w-5.5 h-5.5 mb-1 ${isAccount ? "stroke-[2.5]" : ""}`} />
            <span className="text-[11px] font-semibold tracking-tight">{user ? "Account" : "Login"}</span>
          </Link>
        </div>
      </nav>

      {/* Instant Search Drawer */}
      <MobileSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
