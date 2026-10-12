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
  if (
    location.pathname.startsWith("/admin") ||
    location.pathname === "/checkout"
  ) {
    return null;
  }

  const isHome = location.pathname === "/" || location.pathname === "/shop";
  const isOrders =
    location.pathname === "/orders" ||
    location.pathname.startsWith("/orders/") ||
    location.pathname === "/my-orders";
  const isAccount =
    location.pathname === "/account" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {/* Main Native Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111113]/95 backdrop-blur-xl border-t border-stone-800/80 px-2 pt-2 pb-[max(1.75rem,calc(env(safe-area-inset-bottom,0px)+1.25rem))] shadow-[0_-4px_24px_rgba(0,0,0,0.6)]">
        <div className="grid grid-cols-4 items-center max-w-md mx-auto">
          {/* 1. Home / Meat Cuts */}
          <Link
            to="/"
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors ${
              isHome
                ? "text-primary font-black"
                : "text-stone-400 hover:text-white font-medium"
            }`}
          >
            <Home
              className={`w-5.5 h-5.5 mb-1 ${isHome ? "stroke-[2.5]" : ""}`}
            />
            <span className="text-[11px] font-semibold tracking-tight">
              Meat Cuts
            </span>
          </Link>

          {/* 2. Instant Search */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-stone-400 hover:text-white font-medium cursor-pointer"
          >
            <Search className="w-5.5 h-5.5 mb-1" />
            <span className="text-[11px] font-semibold tracking-tight">
              Search
            </span>
          </button>

          {/* 3. My Orders */}
          <Link
            to="/orders"
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors ${
              isOrders
                ? "text-primary font-black"
                : "text-stone-400 hover:text-white font-medium"
            }`}
          >
            <ClipboardList
              className={`w-5.5 h-5.5 mb-1 ${isOrders ? "stroke-[2.5]" : ""}`}
            />
            <span className="text-[11px] font-semibold tracking-tight">
              My Orders
            </span>
          </Link>

          {/* 4. Account */}
          <Link
            to={user ? "/account" : "/login"}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors ${
              isAccount
                ? "text-primary font-black"
                : "text-stone-400 hover:text-white font-medium"
            }`}
          >
            <User
              className={`w-5.5 h-5.5 mb-1 ${isAccount ? "stroke-[2.5]" : ""}`}
            />
            <span className="text-[11px] font-semibold tracking-tight">
              {user ? "Account" : "Login"}
            </span>
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
