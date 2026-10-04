import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Check, Plus, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";

interface Variant {
  name: string;
  price: number;
}

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  priceType?: 'weight' | 'variant';
  pricePerKg?: number;
  variants?: Variant[];
  image?: string;
  category: string;
  isAvailable?: boolean;
}

export default function ProductCard({ 
  id, 
  slug, 
  name, 
  category,
  priceType = 'weight',
  pricePerKg, 
  variants = [],
  image, 
  isAvailable = true 
}: ProductCardProps) {
  const [selectedWeight, setSelectedWeight] = useState<number>(500);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(variants.length > 0 ? variants[0] : null);
  const [isAdded, setIsAdded] = useState(false);
  const { addWeightItem, addVariantItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAvailable) return;
    
    if (priceType === 'weight') {
      addWeightItem({ id, slug, name, priceType, pricePerKg, image: image || "" }, selectedWeight, 1);
    } else if (priceType === 'variant' && selectedVariant) {
      addVariantItem({ id, slug, name, priceType, image: image || "" }, selectedVariant.name, selectedVariant.price, 1);
    }
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  // Dynamic price calculated based on selected weight
  const displayPrice = priceType === 'weight' && pricePerKg
    ? Math.round((selectedWeight / 1000) * pricePerKg)
    : selectedVariant?.price || (pricePerKg ? Math.round((500 / 1000) * pricePerKg) : 0);

  return (
    <div
      className={`group bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 hover:border-primary/40 transition-all duration-300 hover:shadow-xl flex flex-col justify-between overflow-hidden h-full relative ${
        !isAvailable ? "opacity-75" : ""
      }`}
    >
      {/* Media & Image Container */}
      <div className="relative p-1.5 sm:p-3 pb-0">
        <div className="relative aspect-square sm:aspect-[4/3] w-full rounded-xl sm:rounded-2xl bg-stone-100 overflow-hidden flex items-center justify-center">
          <Link to={`/product/${slug}`} className="block w-full h-full relative overflow-hidden">
            {image ? (
              <img
                src={image}
                alt={name}
                className={`w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${
                  !isAvailable ? "grayscale" : ""
                }`}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-stone-900 text-white p-2 text-center">
                <span className="text-[9px] sm:text-xs font-black uppercase tracking-wider text-primary">
                  Prime Cuts
                </span>
              </div>
            )}
          </Link>

          {/* Floating Category Tag (hidden on small mobile screens to keep card clean) */}
          <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 pointer-events-none z-10 hidden sm:block">
            <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold uppercase">
              {category}
            </span>
          </div>

          {/* Availability Badge */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-20">
              <span className="text-[8px] sm:text-xs font-bold text-white px-2 py-0.5 bg-primary rounded-full uppercase">
                Sold Out
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-2 sm:p-4 flex flex-col flex-grow justify-between text-left">
        <div>
          {/* Title */}
          <Link to={`/product/${slug}`} className="block group/title mb-1 sm:mb-2">
            <h3 className="font-bold text-stone-900 text-[11px] sm:text-[15px] leading-tight line-clamp-2 group-hover/title:text-primary transition-colors min-h-[26px] sm:min-h-[40px]">
              {name}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 mb-1.5 sm:mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-xs sm:text-lg font-black text-primary tracking-tight">
                Rs. {displayPrice}
              </span>
              {priceType === "weight" ? (
                <span className="text-[9px] sm:text-[11px] text-stone-500 font-semibold">
                  /{selectedWeight >= 1000 ? `${selectedWeight / 1000}kg` : `${selectedWeight}g`}
                </span>
              ) : selectedVariant ? (
                <span className="text-[9px] sm:text-[11px] text-stone-500 font-semibold truncate max-w-[100px] sm:max-w-[140px]">
                  /{selectedVariant.name}
                </span>
              ) : null}
            </div>

            {priceType === "weight" && pricePerKg && (
              <span className="text-stone-400 text-[9px] sm:text-[11px] hidden sm:inline">
                Rs. {pricePerKg}/kg
              </span>
            )}
          </div>
        </div>

        {/* Controls Area */}
        <div className="space-y-1 sm:space-y-2 pt-1">
          {/* Compact Weight Pills (visible on mobile & desktop for fast 1-tap choice) */}
          {priceType === "weight" ? (
            <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200/80">
              {[500, 1000, 1500].map((w) => {
                const isSelected = selectedWeight === w;
                return (
                  <button
                    key={w}
                    type="button"
                    disabled={!isAvailable}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedWeight(w);
                    }}
                    className={`h-7 sm:h-7.5 px-0.5 text-[9.5px] sm:text-xs font-extrabold rounded-lg transition-all flex items-center justify-center text-center min-w-0 cursor-pointer ${
                      isSelected
                        ? "bg-primary text-white shadow-xs"
                        : "text-stone-700 hover:text-stone-900 bg-white"
                    }`}
                  >
                    <span className="leading-none tracking-tight">
                      {w >= 1000 ? `${w / 1000}kg` : `${w}g`}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            variants.length > 0 && (
              <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200/60 overflow-x-auto no-scrollbar">
                {variants.slice(0, 2).map((v, idx) => {
                  const isSelected = selectedVariant?.name === v.name;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!isAvailable}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedVariant(v);
                      }}
                      className={`flex-1 h-7 sm:h-7.5 py-0.5 text-[9px] sm:text-[11px] font-extrabold rounded-lg transition-all truncate px-1 cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? "bg-primary text-white shadow-xs"
                          : "text-stone-600 hover:text-stone-900 bg-white/70"
                      }`}
                    >
                      <span className="truncate leading-none">{v.name}</span>
                    </button>
                  );
                })}
              </div>
            )
          )}

          {/* Add to Cart CTA Button */}
          <button
            type="button"
            disabled={!isAvailable || (priceType === "variant" && !selectedVariant)}
            onClick={handleAddToCart}
            className={`w-full py-1.5 sm:py-2.5 rounded-xl font-bold text-[10px] sm:text-xs tracking-wide flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 shadow-xs ${
              !isAvailable || (priceType === "variant" && !selectedVariant)
                ? "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
                : isAdded
                ? "bg-emerald-600 text-white shadow-emerald-600/20"
                : "bg-primary hover:bg-primary/90 text-white shadow-primary/20"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                <span>ADD</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
