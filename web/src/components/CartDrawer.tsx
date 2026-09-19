import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { CartItem } from "@/types/types";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, cartTotal, removeFromCart, updateItemQty } = useCart();

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-black" />
            <h2 className="text-lg font-black text-black">Your Cart</h2>
          </div>
          <button onClick={closeCart} className="p-2 text-stone-500 hover:text-black hover:bg-stone-100 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-500">
              <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-semibold">Your cart is empty.</p>
              <button 
                onClick={closeCart}
                className="mt-6 px-6 py-2 bg-primary/10 text-primary font-bold rounded-full hover:bg-primary/20 transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <CartItemCard 
                key={item.cartItemId} 
                item={item} 
                onRemove={() => removeFromCart(item.cartItemId)}
                onUpdateQty={(qty) => updateItemQty(item.cartItemId, qty)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-100 p-4 bg-stone-50">
            <div className="flex justify-between items-end mb-4">
              <span className="text-stone-500 font-bold">Estimated Total</span>
              <div className="text-right">
                <span className="text-2xl font-black text-black">Rs. {cartTotal.toFixed(2)}</span>
              </div>
            </div>
            <Link 
              to="/checkout"
              onClick={closeCart}
              className="w-full flex items-center justify-center py-4 bg-primary text-white font-black uppercase tracking-wider rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/30 cursor-pointer"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
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
    <div className="flex gap-4 p-3 bg-white border border-stone-100 rounded-2xl shadow-sm relative">
      <button 
        onClick={onRemove}
        className="absolute top-2 right-2 p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Image */}
      <div className="relative w-20 h-20 bg-stone-50 rounded-xl overflow-hidden flex-shrink-0">
        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="pr-6">
          <h3 className="font-bold text-[14px] text-black leading-tight mb-1">{item.product.name}</h3>
          <p className="text-[12px] font-bold text-stone-500">{basePriceDisplay}</p>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-stone-200 rounded-lg bg-white overflow-hidden h-8">
              <button 
                onClick={() => onUpdateQty(item.qty - 1)} 
                className="w-7 h-full flex items-center justify-center text-stone-500 hover:text-black hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <div className="w-6 h-full flex items-center justify-center border-x border-stone-200 text-black font-bold text-xs">
                {item.qty}
              </div>
              <button 
                onClick={() => onUpdateQty(item.qty + 1)}
                className="w-7 h-full flex items-center justify-center text-stone-500 hover:text-black hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
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
    </div>
  );
}
