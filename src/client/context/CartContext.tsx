import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { useUser } from "./UserContext";
import { CartItem, CartProduct } from "../../shared/types";

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addWeightItem: (product: CartProduct, weightInGrams: number, qty?: number) => void;
  addVariantItem: (product: CartProduct, variantName: string, variantPrice: number, qty?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateItemQty: (cartItemId: string, newQty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("crispy_guest_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useUser();
  const isCartLoaded = useRef(false);
  const isLoadingCart = useRef(false);

  // Load cart from server when user logs in
  useEffect(() => {
    async function loadCart() {
      if (!user) {
        isCartLoaded.current = true;
        return;
      }

      if (isLoadingCart.current) return;
      isLoadingCart.current = true;

      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.items)) {
            const serverItems = data.items as CartItem[];
            setItems((currentItems) => {
              if (currentItems.length === 0) {
                isCartLoaded.current = true;
                return serverItems;
              }
              const merged = [...serverItems];
              currentItems.forEach((localItem) => {
                const matchIndex = merged.findIndex(item => item.cartItemId === localItem.cartItemId);
                if (matchIndex >= 0) {
                  merged[matchIndex].qty += localItem.qty;
                } else {
                  merged.push(localItem);
                }
              });

              isCartLoaded.current = true;
              return merged;
            });
          }
        }
      } catch (error) {
        console.error("Failed to load DB cart:", error);
      } finally {
        isCartLoaded.current = true;
        isLoadingCart.current = false;
      }
    }

    loadCart();
  }, [user]);

  // Persist guest cart locally and sync DB cart when logged in
  useEffect(() => {
    try {
      localStorage.setItem("crispy_guest_cart", JSON.stringify(items));
    } catch {}

    if (!isCartLoaded.current) return;

    if (user) {
      const timer = setTimeout(() => {
        fetch("/api/cart/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        }).catch(console.error);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [items, user]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addWeightItem = (product: CartProduct, weightInGrams: number, qty: number = 1) => {
    setItems((prevItems) => {
      const cartItemId = `${product.id}_${weightInGrams}`;
      const existingItemIndex = prevItems.findIndex(item => item.cartItemId === cartItemId);

      if (existingItemIndex >= 0) {
        const updated = [...prevItems];
        updated[existingItemIndex].qty += qty;
        return updated;
      }
      return [...prevItems, { cartItemId, product, weightInGrams, qty }];
    });
    openCart();
  };

  const addVariantItem = (product: CartProduct, variantName: string, variantPrice: number, qty: number = 1) => {
    setItems((prevItems) => {
      const cartItemId = `${product.id}_${variantName}`;
      const existingItemIndex = prevItems.findIndex(item => item.cartItemId === cartItemId);

      if (existingItemIndex >= 0) {
        const updated = [...prevItems];
        updated[existingItemIndex].qty += qty;
        return updated;
      }
      return [...prevItems, { cartItemId, product, variantName, variantPrice, qty }];
    });
    openCart();
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateItemQty = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) return;
    setItems((prev) => 
      prev.map(item => item.cartItemId === cartItemId ? { ...item, qty: newQty } : item)
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem("crispy_guest_cart");
    } catch {}
    if (user) {
      fetch("/api/cart", { method: "DELETE" }).catch(console.error);
    }
  };

  const cartTotal = items.reduce((total, item) => {
    if (item.product.priceType === 'weight' && item.weightInGrams && item.product.pricePerKg) {
      return total + (item.weightInGrams / 1000) * item.product.pricePerKg * item.qty;
    } else if (item.product.priceType === 'variant' && item.variantPrice) {
      return total + item.variantPrice * item.qty;
    }
    return total;
  }, 0);

  const totalItems = items.reduce((total, item) => total + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        openCart,
        closeCart,
        addWeightItem,
        addVariantItem,
        removeFromCart,
        updateItemQty,
        clearCart,
        cartTotal,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
