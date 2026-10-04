import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, X, Flame, Sparkles, ChevronRight, ShoppingBag, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  priceType: "weight" | "variant";
  pricePerKg?: number;
  variants?: Array<{ id: string; name: string; price: number }>;
  image?: string;
  available?: boolean;
}

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_TAGS = [
  "All",
  "Khasi (खसी)",
  "Chicken (कुखुरा)",
  "Curry Cut",
  "Boneless",
  "Sausages",
  "Momos",
  "Eggs",
];

export default function MobileSearchModal({ isOpen, onClose }: MobileSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addWeightItem, addVariantItem, openCart } = useCart();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      fetchProducts();
    } else {
      setSearchTerm("");
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.products) {
          setProducts(data.products);
        }
      }
    } catch (err) {
      console.warn("Failed to load products for search:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTag === "All") return true;
    if (activeTag === "Khasi (खसी)") return p.category.toLowerCase().includes("goat") || p.name.includes("खसी") || p.name.includes("Khasi");
    if (activeTag === "Chicken (कुखुरा)") return p.category.toLowerCase().includes("chicken") || p.name.includes("कुखुरा");
    if (activeTag === "Sausages") return p.name.toLowerCase().includes("sausage");
    if (activeTag === "Momos") return p.name.toLowerCase().includes("momo");
    if (activeTag === "Eggs") return p.category.toLowerCase().includes("egg") || p.name.toLowerCase().includes("egg");
    if (activeTag === "Curry Cut") return p.name.toLowerCase().includes("curry") || p.name.toLowerCase().includes("cut");
    if (activeTag === "Boneless") return p.name.toLowerCase().includes("boneless");

    return true;
  });

  const handleQuickAdd = (p: ProductItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (p.priceType === "weight" && p.pricePerKg) {
      addWeightItem(
        {
          id: p.id,
          name: p.name,
          slug: p.slug,
          priceType: "weight",
          pricePerKg: p.pricePerKg,
          image: p.image || "/images/meat_goat_bone.jpg",
        },
        1000,
        1
      );
    } else if (p.variants && p.variants.length > 0) {
      const firstVar = p.variants[0];
      addVariantItem(
        {
          id: p.id,
          name: p.name,
          slug: p.slug,
          priceType: "variant",
          image: p.image || "/images/meat_sausages.jpg",
        },
        firstVar.name,
        firstVar.price,
        1
      );
    }
    openCart();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end md:justify-center md:items-center bg-black/80 backdrop-blur-md">
          {/* Overlay click to close */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="relative z-10 w-full md:max-w-2xl bg-stone-900 border-t md:border border-stone-800 rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[88vh] md:max-h-[80vh] overflow-hidden text-white"
          >
            {/* Header & Search Bar */}
            <div className="p-4 border-b border-stone-800/80 bg-stone-950/60 sticky top-0 z-20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-primary" />
                  <h3 className="font-black text-base tracking-wide">Instant Cut Search</h3>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search meat (e.g. Khasi, Broiler, Curry cut, Momo, Eggs)..."
                  className="w-full pl-11 pr-10 py-3 bg-stone-800/90 border border-stone-700/70 rounded-2xl text-white placeholder-stone-400 font-semibold text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Tag Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar">
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      activeTag === tag
                        ? "bg-primary text-white shadow-sm shadow-primary/30"
                        : "bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-700/40"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
              {loading ? (
                <div className="py-12 text-center text-stone-500 font-semibold text-sm">
                  Loading fresh cuts...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-stone-500">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-stone-600" />
                  <p className="font-bold text-sm text-stone-400">No cuts found for "{searchTerm}"</p>
                  <p className="text-xs text-stone-500 mt-1">Try searching for goat, chicken, curry cut, or sausages</p>
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const priceText =
                    p.priceType === "weight" && p.pricePerKg
                      ? `Rs. ${p.pricePerKg}/kg`
                      : p.variants && p.variants.length > 0
                      ? `Rs. ${p.variants[0].price} (${p.variants[0].name})`
                      : "View Options";

                  const isOutOfStock = p.available === false;

                  return (
                    <div
                      key={p.id}
                      className="bg-stone-800/60 hover:bg-stone-800 border border-stone-700/50 rounded-2xl p-3 flex items-center justify-between gap-3 transition-all"
                    >
                      <Link
                        to={`/product/${p.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 flex-1 min-w-0"
                      >
                        <div className="w-14 h-14 rounded-xl bg-stone-900 overflow-hidden shrink-0 border border-stone-700/50 relative">
                          <img
                            src={p.image || "/images/meat_goat_bone.jpg"}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[9px] font-black text-red-400 uppercase tracking-tighter">
                              Sold Out
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                            {p.category}
                          </span>
                          <h4 className="font-bold text-sm text-white truncate">{p.name}</h4>
                          <p className="text-xs font-black text-stone-300 mt-0.5">{priceText}</p>
                        </div>
                      </Link>

                      <div className="shrink-0 flex items-center gap-2">
                        {!isOutOfStock && (
                          <button
                            onClick={(e) => handleQuickAdd(p, e)}
                            className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-transform active:scale-95 shadow-sm cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        )}
                        <Link
                          to={`/product/${p.slug}`}
                          onClick={onClose}
                          className="p-2 text-stone-400 hover:text-white"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
