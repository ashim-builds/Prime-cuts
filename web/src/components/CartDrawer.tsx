import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { useStoreStatus } from "../context/StoreStatusContext";
import { CartItem } from "@/types/types";
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Trash2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Home,
  Sparkles,
  Truck,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProductImageUrl, handleProductImageError } from "@/utils/imageUtils";

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, cartTotal, removeFromCart, updateItemQty } = useCart();
  const { user } = useUser();
  const { isOpen, freeDeliveryThreshold, closedMessage } = useStoreStatus();
  const navigate = useNavigate();

  const threshold = freeDeliveryThreshold || 899;
  const progressPercent = Math.min(100, Math.round((cartTotal / threshold) * 100));
  const remainingForFree = Math.max(0, threshold - cartTotal);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer with safe-area top gap on mobile */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{
              x: "100%",
              transition: { duration: 0.25, ease: [0.32, 0.72, 0, 1] },
            }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 340,
              mass: 0.8,
            }}
            drag="x"
            dragConstraints={{ left: 0 }}
            dragElastic={{ left: 0, right: 0.5 }}
            onDragEnd={(_e, info) => {
              if (info.offset.x > 80 || info.velocity.x > 350) {
                closeCart();
              }
            }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-[70] shadow-2xl flex flex-col will-change-transform pt-[max(calc(env(safe-area-inset-top,0px)+34px),46px)] sm:pt-0"
          >
        {/* Header with Back option to Home & Close Button */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-stone-200/90 bg-white sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                closeCart();
                navigate("/");
              }}
              className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-90 flex items-center justify-center text-stone-800 transition-all cursor-pointer shadow-2xs shrink-0"
              title="Back to Home"
              aria-label="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-primary shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-stone-900 leading-tight">My Cart</h2>
                <p className="text-[11px] text-stone-500 font-semibold">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                closeCart();
                navigate("/");
              }}
              className="px-2.5 py-1.5 text-xs font-bold text-stone-600 hover:text-primary rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-1 cursor-pointer"
              title="Back to Home"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <button
              type="button"
              onClick={closeCart}
              className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-90 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-all cursor-pointer"
              title="Close Cart"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Delivery Threshold Bar */}
        {items.length > 0 && (
          <div className="bg-stone-900 text-white p-3 px-4 border-b border-stone-800">
            <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-primary" />
                {remainingForFree === 0 ? (
                  <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> FREE Delivery Unlocked!
                  </span>
                ) : (
                  <span>Add <b className="text-primary font-black">Rs. {remainingForFree.toFixed(0)}</b> for Free Delivery</span>
                )}
              </span>
              <span className="text-stone-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 smooth-scroll-y custom-scrollbar overscroll-contain">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-500 text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 mb-3 shadow-2xs">
                <ShoppingBag className="w-8 h-8 opacity-40 text-stone-600" />
              </div>
              <p className="font-extrabold text-base text-stone-900">Your cart is empty</p>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                Explore our fresh goat, chicken, sausages, and farm eggs.
              </p>
              <button 
                type="button"
                onClick={() => {
                  closeCart();
                  navigate("/");
                }}
                className="mt-6 px-6 py-3 bg-primary hover:bg-primary-hover active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <CartItemCard 
                  key={item.cartItemId} 
                  item={item} 
                  onRemove={() => removeFromCart(item.cartItemId)}
                  onUpdateQty={(qty) => updateItemQty(item.cartItemId, qty)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-100 p-4 bg-stone-50">
            {!isOpen && (
              <div className="mb-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Shop closed. Pre-orders are delivered at 7:00 AM!</span>
              </div>
            )}

            <div className="flex justify-between items-end mb-4">
              <span className="text-stone-500 font-bold text-sm">Subtotal</span>
              <div className="text-right">
                <span className="text-2xl font-black text-black">Rs. {cartTotal.toFixed(2)}</span>
              </div>
            </div>
            {user ? (
              <Link 
                to="/checkout"
                onClick={closeCart}
                className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white font-black uppercase tracking-wider rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/30 cursor-pointer active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link 
                to="/login?from=/checkout"
                onClick={closeCart}
                className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white font-black uppercase tracking-wider rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/30 cursor-pointer active:scale-98"
              >
                <Lock className="w-4 h-4" />
                <span>Login to Checkout</span>
              </Link>
            )}
          </div>
        )}
      </motion.div>
    </>
  )}
</AnimatePresence>
  );
}

function CartItemCard({ 
  item, 
  onRemove, 
  onUpdateQty 
}: { 
  item: CartItem, 
  onRemove: () => void,
  onUpdateQty: (qty: number) => void
}) {
  let itemPrice = 0;
  let unitDisplay = "";
  let basePriceDisplay = "";

  if (item.product.priceType === 'weight' && item.weightInGrams && item.product.pricePerKg) {
    itemPrice = (item.weightInGrams / 1000) * item.product.pricePerKg * item.qty;
    unitDisplay = item.weightInGrams >= 1000 ? `${item.weightInGrams / 1000}kg` : `${item.weightInGrams}g`;
    basePriceDisplay = `Rs. ${item.product.pricePerKg} / kg`;
  } else if (item.product.priceType === 'variant' && item.variantName && item.variantPrice) {
    itemPrice = item.variantPrice * item.qty;
    unitDisplay = item.variantName;
    basePriceDisplay = `Rs. ${item.variantPrice} each`;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0, padding: 0, overflow: "hidden", transition: { duration: 0.2 } }}
      transition={{ duration: 0.22 }}
      className="flex gap-4 p-3 bg-white border border-stone-100 rounded-2xl shadow-xs relative"
    >
      <motion.button 
        whileTap={{ scale: 0.85 }}
        onClick={onRemove}
        className="absolute top-2 right-2 p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        title="Remove item"
      >
        <Trash2 className="w-4 h-4" />
      </motion.button>

      {/* Image */}
      <div className="relative w-20 h-20 bg-stone-50 rounded-xl overflow-hidden flex-shrink-0">
        <img
          src={getProductImageUrl(item.product.image)}
          alt={item.product.name}
          onError={handleProductImageError}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="pr-6">
          <h3 className="font-bold text-[14px] text-black leading-tight mb-1">{item.product.name}</h3>
          <p className="text-[12px] font-bold text-stone-500">{basePriceDisplay}</p>
          {item.cutPreference && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-bold border border-stone-200">
              🔪 {item.cutPreference}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-stone-200 rounded-lg bg-white overflow-hidden h-8">
              <motion.button 
                whileTap={{ scale: 0.85 }}
                onClick={() => onUpdateQty(item.qty - 1)} 
                className="w-7 h-full flex items-center justify-center text-stone-500 hover:text-black hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </motion.button>
              <div className="w-6 h-full flex items-center justify-center border-x border-stone-200 text-black font-bold text-xs">
                {item.qty}
              </div>
              <motion.button 
                whileTap={{ scale: 0.85 }}
                onClick={() => onUpdateQty(item.qty + 1)}
                className="w-7 h-full flex items-center justify-center text-stone-500 hover:text-black hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </motion.button>
            </div>

            <span className="text-stone-300 text-xs">x</span>

            <div className="h-8 border border-stone-100 bg-stone-50 rounded-lg px-3 flex items-center justify-center text-xs font-bold text-stone-700">
              {unitDisplay}
            </div>
          </div>

          <div className="text-right mt-1">
            <span className="font-black text-black text-[15px]">Rs. {itemPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
