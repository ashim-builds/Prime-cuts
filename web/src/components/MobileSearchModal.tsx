import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, X, Flame, ChevronRight, ShoppingBag, Plus } from "lucide-react";
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

// In-memory module cache to ensure search opens with zero network delay and zero layout lag
let cachedSearchProducts: ProductItem[] | null = null;

export default function MobileSearchModal({ isOpen, onClose }: MobileSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [products, setProducts] = useState<ProductItem[]>(() => cachedSearchProducts || []);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addWeightItem, addVariantItem } = useCart();

  // Lock background page from scrolling when search modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;
      const scrollY = window.scrollY;

      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (cachedSearchProducts && cachedSearchProducts.length > 0) {
        setProducts(cachedSearchProducts);
      } else {
        fetchProducts();
      }

      // Delay keyboard focus until after sheet slide-in completes to prevent iOS keyboard animation jank
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSearchTerm("");
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    if (cachedSearchProducts && cachedSearchProducts.length > 0) {
      setProducts(cachedSearchProducts);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          cachedSearchProducts = data.products;
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
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.slug.toLowerCase().includes(term);

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
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex flex-col justify-end md:justify-center md:items-center bg-black/80"
        >
          {/* Overlay click to close */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.45 }}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 60 || info.velocity.y > 200) {
                onClose();
              }
            }}
            className="relative z-10 w-full h-[100dvh] md:max-w-2xl bg-[#161619] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white will-change-transform pt-[max(calc(env(safe-area-inset-top,0px)+20px),28px)]"
          >
            {/* Grab Bar Handle to slide down or tap to close */}
            <div
              onClick={onClose}
              className="w-full pt-3 pb-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none"
              title="Slide down or tap to close"
            >
              <div className="w-14 h-1.5 rounded-full bg-stone-500 active:bg-primary transition-colors" />
              <span className="text-[10px] font-bold text-stone-400 mt-1 uppercase tracking-wider">
                Slide down to close
              </span>
            </div>

            {/* Header & Search Bar */}
            <div className="px-4 pb-3 pt-0 border-b border-stone-800/80 bg-[#161619] sticky top-0 z-20">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-primary" />
                  <h3 className="font-black text-base tracking-wide">
                    Instant Cut Search
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 active:scale-90 flex items-center justify-center text-stone-300 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* White search box with black text and icon */}
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-black pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search meat (e.g. Khasi, Broiler, Curry cut, Momo, Eggs)..."
                  className="w-full pl-11 pr-10 py-3 bg-white border border-stone-200 rounded-2xl text-stone-900 placeholder-stone-500 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-black p-1 cursor-pointer active:scale-90 transition-transform"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Tag Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-0.5 no-scrollbar smooth-scroll-x">
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors cursor-pointer select-none active:scale-95 ${
                      activeTag === tag
                        ? "bg-primary text-white shadow-sm shadow-primary/30"
                        : "bg-stone-800/90 text-stone-400 hover:text-stone-200 border border-stone-700/50"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 smooth-scroll-y custom-scrollbar overscroll-contain">
              {loading && products.length === 0 ? (
                <div className="py-12 text-center text-stone-500 font-semibold text-sm flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Loading fresh cuts...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-stone-500">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-stone-600" />
                  <p className="font-bold text-sm text-stone-400">
                    No cuts found for "{searchTerm}"
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Try searching for goat, chicken, curry cut, or sausages
                  </p>
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
                      className="bg-stone-800/60 hover:bg-stone-800/90 border border-stone-700/60 rounded-2xl p-3 flex items-center justify-between gap-3 transition-colors shadow-xs active:scale-[0.99]"
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
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-200"
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
                          <h4 className="font-bold text-sm text-white truncate">
                            {p.name}
                          </h4>
                          <p className="text-xs font-black text-stone-300 mt-0.5">
                            {priceText}
                          </p>
                        </div>
                      </Link>

                      <div className="shrink-0 flex items-center gap-2">
                        {!isOutOfStock && (
                          <button
                            type="button"
                            onClick={(e) => handleQuickAdd(p, e)}
                            className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-sm cursor-pointer active:scale-90 transition-transform"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        )}
                        <Link
                          to={`/product/${p.slug}`}
                          onClick={onClose}
                          className="p-2 text-stone-400 hover:text-white transition-colors"
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
