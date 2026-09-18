import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart, Phone } from "lucide-react";
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

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
  ];

  if (user) {
    navLinks.push(
      { name: "My Orders", href: "/orders" },
      { name: "Account", href: "/account" }
    );
  } else {
    navLinks.push({ name: "Login", href: "/login" });
  }

  return (
    <div className="sticky top-0 z-50 w-full flex flex-col items-center transition-all duration-300">
      <nav 
        className={`w-full transition-all duration-300 ease-in-out ${
          scrolled 
            ? "max-w-4xl mx-4 mt-4 bg-black/70 backdrop-blur-lg border border-white/10 shadow-2xl rounded-full" 
            : "max-w-full bg-[#111111] border-b border-[#222222]"
        }`}
      >
        <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${scrolled ? "" : "max-w-7xl"}`}>
          <div className={`flex justify-between items-center transition-all duration-300 ${scrolled ? "h-16" : "h-20"}`}>
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="h-12 w-12 relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                  <img
                    src="/images/logo.png"
                    alt="Prime Cuts - Butcher House"
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-2xl tracking-tight text-white leading-none">
                    Prime <span className="text-primary">Cuts</span>
                  </span>
                  <span className="text-[10px] tracking-[0.22em] font-extrabold text-white/70 uppercase">
                    Butcher House
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="flex space-x-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`relative font-semibold transition-colors group ${
                      isActive(link.href) ? "text-primary" : "text-white hover:text-primary"
                    }`}
                  >
                    {link.name}
                    <span className={`absolute -bottom-1.5 left-0 h-0.5 bg-primary transition-all duration-300 ${
                      isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
                    }`}></span>
                  </Link>
                ))}
              </div>
              <div className="flex items-center space-x-4 border-l border-[#222222] pl-6">
                <a href="tel:+9779865311559" className="flex items-center gap-2 text-white hover:text-primary transition-colors">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="font-bold text-sm">Order: 9865311559</span>
                </a>
                
                {/* Customer push notifications settings bell */}
                <NotificationBell type="customer" />

                <button 
                  onClick={openCart}
                  className="relative p-2 text-white hover:text-primary transition-colors"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-primary rounded-full shadow">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-1.5">
              <NotificationBell type="customer" />
              <button
                onClick={toggleMenu}
                className="text-white hover:text-primary p-2 focus:outline-none"
              >
                {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`md:hidden overflow-hidden ${scrolled ? "bg-black/80 backdrop-blur-lg w-[calc(100%-2rem)] rounded-3xl mt-2 border border-white/10 shadow-2xl max-w-4xl" : "bg-[#111111] w-full border-b border-[#222222]"}`}
          >
            <div className="px-4 pt-4 pb-6 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`block px-5 py-4 rounded-2xl text-[15px] font-bold transition-all border ${
                    isActive(link.href)
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/30"
                      : scrolled 
                        ? "bg-white/5 border-white/5 text-white hover:bg-white/10" 
                        : "bg-[#1a1a1a] border-[#222] text-white hover:bg-[#2a2a2a]"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-2 mt-2">
                <a 
                  href="tel:+9779865311559" 
                  className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-white font-bold transition-all border ${
                    scrolled 
                      ? "bg-white/5 border-white/5 hover:bg-white/10" 
                      : "bg-[#1a1a1a] border-[#222] hover:bg-[#2a2a2a]"
                  }`}
                >
                  <Phone className="w-5 h-5 text-primary" />
                  <span>Call to Order</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
