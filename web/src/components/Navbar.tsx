import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems, openCart } = useCart();
  const { user } = useUser();
  const location = useLocation();
  const pathname = location.pathname;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    setIsOpen(false);
  };

  // Nav links
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "My Orders", href: user ? "/orders" : "/login?from=/orders" },
    { name: "Account", href: user ? "/account" : "/login?from=/account" },
  ];

  return (
    <header
      className={`sticky z-50 w-full transition-all duration-300 ease-in-out ${
        scrolled
          ? "top-3 px-3 sm:px-6 lg:px-8"
          : "top-0 px-0 bg-[#0d0d0d] border-b border-[#1f1f1f] shadow-md"
      }`}
    >
      <div
        className={`mx-auto transition-all duration-300 ease-in-out ${
          scrolled
            ? "max-w-6xl bg-[#0d0d0d]/95 backdrop-blur-xl border border-[#282828] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)] px-4 sm:px-6 py-2"
            : "max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* ==================== LEFT: LOGO & SHOP NAME ==================== */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              onClick={handleNavClick}
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="h-14 w-14 relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/images/logo.png"
                  alt="Prime Cuts - Butcher House"
                  className="w-full h-full object-contain filter drop-shadow-md"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight text-white leading-none">
                  Prime <span className="text-[#cc0411]">Cuts</span>
                </span>
                <span className="text-[9px] tracking-[0.22em] font-extrabold text-stone-400 uppercase mt-0.5">
                  Butcher House
                </span>
              </div>
            </Link>
          </div>

          {/* ==================== CENTER: PILL NAV LINKS (CONTROLLED GAP) ==================== */}
          <nav className="hidden md:flex items-center">
            <div className="bg-[#171717] border border-[#282828] rounded-full p-1 flex items-center gap-1 shadow-inner">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={handleNavClick}
                    className={`relative px-4 py-1.5 text-[14px] font-bold rounded-full transition-all duration-200 ${
                      active
                        ? "text-white"
                        : "text-stone-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="pillNavActiveBadge"
                        className="absolute inset-0 bg-[#cc0411] rounded-full shadow-[0_2px_12px_rgba(204,4,17,0.45)] -z-0"
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 35,
                        }}
                      />
                    )}
                    <span className="relative z-10">{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* ==================== RIGHT: CTA & ACTIONS ==================== */}
          <div className="hidden md:flex items-center gap-3">
            {/* Notification Bell */}
            <div className="flex items-center">
              <NotificationBell type="customer" />
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2 text-white hover:text-[#cc0411] transition-colors rounded-full hover:bg-white/5 focus:outline-none cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-[#cc0411] rounded-full shadow border-2 border-[#0d0d0d] animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Pill CTA: Order Now Button */}
            <Link
              to="/shop"
              onClick={handleNavClick}
              className="bg-[#cc0411] hover:bg-[#b0030f] text-white font-black text-[13px] uppercase tracking-wider px-5 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-[#cc0411]/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Order Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* ==================== MOBILE CONTROLS ==================== */}
          <div className="md:hidden flex items-center gap-2">
            <NotificationBell type="customer" />

            <button
              onClick={openCart}
              className="relative p-2 text-white hover:text-[#cc0411] focus:outline-none cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-black text-white bg-[#cc0411] rounded-full border border-[#0d0d0d]">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={toggleMenu}
              className="text-white hover:text-[#cc0411] p-1.5 focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-[#cc0411]" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MOBILE DROPDOWN MENU ==================== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, scale: 0.98 }}
            animate={{ height: "auto", opacity: 1, scale: 1 }}
            exit={{ height: 0, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className={`md:hidden overflow-hidden ${
              scrolled
                ? "max-w-6xl mx-auto bg-[#111111]/95 backdrop-blur-xl border border-[#242424] rounded-3xl mt-2 p-3 shadow-2xl"
                : "w-full bg-[#111111] border-t border-[#1f1f1f] p-4 shadow-xl"
            }`}
          >
            <div className="space-y-1.5">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-[15px] font-bold transition-all ${
                      active
                        ? "bg-[#cc0411] text-white shadow-md shadow-[#cc0411]/25"
                        : "bg-[#181818] text-stone-200 hover:bg-[#222222] border border-[#262626]"
                    }`}
                    onClick={handleNavClick}
                  >
                    <span>{link.name}</span>
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    )}
                  </Link>
                );
              })}

              <div className="pt-2">
                <Link
                  to="/shop"
                  onClick={handleNavClick}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-white font-black text-sm uppercase bg-[#cc0411] hover:bg-[#b0030f] shadow-lg shadow-[#cc0411]/30 transition-colors"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
