import { Link } from "react-router-dom";
import { Home, Store, ShoppingCart, FileText, User } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";

export default function BottomNav() {
  const { totalItems, openCart } = useCart();
  const { user } = useUser();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111111] border-t border-[#222222] z-50">
      <div className="flex justify-between items-center px-6 py-3">
        <Link to="/" className="flex flex-col items-center gap-1 group">
          <Home className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-medium text-primary">Home</span>
        </Link>
        <Link to="/shop" className="flex flex-col items-center gap-1 group">
          <Store className="w-5 h-5 text-white/50 group-hover:text-primary transition-colors" />
          <span className="text-[10px] font-medium text-white/50 group-hover:text-primary transition-colors">Shop</span>
        </Link>
        <button onClick={openCart} className="flex flex-col items-center gap-1 group relative outline-none cursor-pointer">
          <div className="relative">
            <ShoppingCart className="w-5 h-5 text-white/50 group-hover:text-primary transition-colors" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-primary text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium text-white/50 group-hover:text-primary transition-colors">Cart</span>
        </button>
        {user ? (
          <>
            <Link to="/orders" className="flex flex-col items-center gap-1 group">
              <FileText className="w-5 h-5 text-white/50 group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-medium text-white/50 group-hover:text-primary transition-colors">Orders</span>
            </Link>
            <Link to="/account" className="flex flex-col items-center gap-1 group">
              <User className="w-5 h-5 text-white/50 group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-medium text-white/50 group-hover:text-primary transition-colors">Account</span>
            </Link>
          </>
        ) : (
          <Link to="/login" className="flex flex-col items-center gap-1 group">
            <User className="w-5 h-5 text-white/50 group-hover:text-primary transition-colors" />
            <span className="text-[10px] font-medium text-white/50 group-hover:text-primary transition-colors">Login</span>
          </Link>
        )}
      </div>
    </div>
  );
}
