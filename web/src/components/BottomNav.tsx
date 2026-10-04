import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Store, ShoppingCart, FileText, User } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";

export default function BottomNav() {
  const { totalItems, openCart } = useCart();
  const { user } = useUser();
  const location = useLocation();
  const [isInputFocused, setIsInputFocused] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  useEffect(() => {
    // Only detect active text input focus (e.g. typing in search bar)
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        setIsInputFocused(true);
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        const activeEl = document.activeElement;
        if (
          !activeEl ||
          (activeEl.tagName !== "INPUT" &&
            activeEl.tagName !== "TEXTAREA")
        ) {
          setIsInputFocused(false);
        }
      }, 100);
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 bg-[#121214] border-t border-stone-800/60 z-50 ${
        isInputFocused ? "hidden" : "block"
      }`}
    >
      {/* Safe bottom area padding for modern touch gestures */}
      <div className="flex justify-around items-center px-4 pt-2 pb-[calc(1.1rem+env(safe-area-inset-bottom,0px))]">
        <Link to="/" className="flex flex-col items-center gap-1 group py-1 active:scale-95 transition-transform">
          <Home className={`w-5 h-5 transition-colors ${isActive("/") ? "text-primary stroke-[2.5]" : "text-stone-400 group-hover:text-white"}`} />
          <span className={`text-[10px] font-bold transition-colors ${isActive("/") ? "text-primary" : "text-stone-400 group-hover:text-white"}`}>Home</span>
        </Link>

        <a href="/#shop-cuts" className="flex flex-col items-center gap-1 group py-1 active:scale-95 transition-transform">
          <Store className="w-5 h-5 transition-colors text-stone-400 group-hover:text-white" />
          <span className="text-[10px] font-bold transition-colors text-stone-400 group-hover:text-white">Cuts</span>
        </a>

        <button onClick={openCart} className="flex flex-col items-center gap-1 group relative outline-none cursor-pointer py-1 active:scale-95 transition-transform">
          <div className="relative">
            <ShoppingCart className="w-5 h-5 text-stone-400 group-hover:text-primary transition-colors" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-primary text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-stone-400 group-hover:text-primary transition-colors">Cart</span>
        </button>

        {user ? (
          <>
            <Link to="/orders" className="flex flex-col items-center gap-1 group py-1 active:scale-95 transition-transform">
              <FileText className={`w-5 h-5 transition-colors ${isActive("/orders") ? "text-primary stroke-[2.5]" : "text-stone-400 group-hover:text-white"}`} />
              <span className={`text-[10px] font-bold transition-colors ${isActive("/orders") ? "text-primary" : "text-stone-400 group-hover:text-white"}`}>Orders</span>
            </Link>
            <Link to="/account" className="flex flex-col items-center gap-1 group py-1 active:scale-95 transition-transform">
              <User className={`w-5 h-5 transition-colors ${isActive("/account") ? "text-primary stroke-[2.5]" : "text-stone-400 group-hover:text-white"}`} />
              <span className={`text-[10px] font-bold transition-colors ${isActive("/account") ? "text-primary" : "text-stone-400 group-hover:text-white"}`}>Account</span>
            </Link>
          </>
        ) : (
          <Link to="/login" className="flex flex-col items-center gap-1 group py-1 active:scale-95 transition-transform">
            <User className={`w-5 h-5 transition-colors ${isActive("/login") ? "text-primary stroke-[2.5]" : "text-stone-400 group-hover:text-white"}`} />
            <span className={`text-[10px] font-bold transition-colors ${isActive("/login") ? "text-primary" : "text-stone-400 group-hover:text-white"}`}>Login</span>
          </Link>
        )}
      </div>
    </div>
  );
}
