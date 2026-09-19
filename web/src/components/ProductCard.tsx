import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Check, Flame, ArrowRight } from "lucide-react";
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
    : selectedVariant?.price || 0;

  return (
    <div
      className={`group bg-white rounded-3xl border border-stone-200/90 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:shadow-stone-900/10 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden h-full relative ${
        !isAvailable ? "opacity-75" : ""
      }`}
    >
      {/* Top Media Header */}
      <div className="relative p-2.5 sm:p-3 pb-0">
        <div className="relative aspect-[4/3] w-full rounded-2xl bg-[#141211] overflow-hidden flex items-center justify-center shadow-xs">
          <Link to={`/product/${slug}`} className="block w-full h-full relative overflow-hidden">
            {image ? (
              <img
                src={image}
                alt={name}
                className={`w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108 ${
                  !isAvailable ? "grayscale" : ""
                }`}
              />
            ) : (
              <div className="w-full h-full relative flex flex-col items-center justify-center bg-gradient-to-br from-[#1c1917] via-[#141211] to-[#0a0a0a] overflow-hidden p-6 text-center select-none group-hover:bg-[#181615] transition-colors">
                {/* Radiant Ambient Red Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(204,4,17,0.24)_0%,transparent_70%)] pointer-events-none" />

                {/* Center Butcher Emblem */}
                <div className="relative z-10 flex flex-col items-center transform transition-transform duration-500 group-hover:scale-110">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.08] border border-white/10 backdrop-blur-md flex items-center justify-center shadow-xl shadow-black/60 mb-2 text-primary">
                    <Flame className="w-6 h-6 stroke-[2.2] fill-primary/25" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/95 leading-none">
                    Prime Cuts
                  </p>
                  <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mt-1">
                    Fresh Daily Cut
                  </p>
                </div>
              </div>
            )}
          </Link>

          {/* Floating Category Badge */}
          <div className="absolute top-3 left-3 pointer-events-none z-10">
            <span className="px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[10px] font-black tracking-wider uppercase border border-white/10 shadow-sm">
              {category}
            </span>
          </div>

          {/* Fresh Cut Status Indicator */}
          {isAvailable ? (
            <div className="absolute top-3 right-3 pointer-events-none z-10">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-stone-900 text-[10px] font-extrabold shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Fresh</span>
              </span>
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center pointer-events-none z-20">
              <span className="text-xs font-black text-white px-3.5 py-1.5 bg-primary rounded-full shadow-xl tracking-wider uppercase">
                Sold Out
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 pt-3.5 flex flex-col flex-grow justify-between text-left">
        <div>
          {/* Title & Arrow */}
          <Link
            to={`/product/${slug}`}
            className="group/title flex items-start justify-between gap-2 mb-2"
          >
            <h3 className="font-black text-stone-900 text-base sm:text-[17px] leading-snug line-clamp-1 group-hover/title:text-primary transition-colors">
              {name}
            </h3>
            <span className="text-stone-300 group-hover/title:text-primary group-hover/title:translate-x-0.5 transition-all mt-0.5 shrink-0">
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          {/* Pricing Highlight Row */}
          <div className="flex items-center justify-between bg-stone-50/80 px-3 py-2 rounded-xl border border-stone-100 mb-3.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-primary tracking-tight">
                Rs. {displayPrice}
              </span>
              {priceType === "weight" && (
                <span className="text-stone-600 text-[11px] font-bold bg-white px-1.5 py-0.5 rounded-md border border-stone-200/80 shadow-2xs">
                  {selectedWeight >= 1000 ? `${selectedWeight / 1000}kg` : `${selectedWeight}g`}
                </span>
              )}
            </div>

            {priceType === "weight" && pricePerKg && (
              <span className="text-stone-400 text-[11px] font-medium">
                Rs. {pricePerKg}/kg
              </span>
            )}
          </div>
        </div>

        {/* Interactive Controls Area */}
        <div className="space-y-3 pt-1">
          {/* Segmented Weight Slider Controls */}
          {priceType === "weight" ? (
            <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100/90 rounded-2xl border border-stone-200/60 shadow-inner">
              {[250, 500, 1000].map((w) => {
                const isSelected = selectedWeight === w;
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedWeight(w);
                    }}
                    className={`py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white text-stone-900 shadow-sm ring-1 ring-black/5"
                        : "text-stone-500 hover:text-stone-900 hover:bg-white/40"
                    }`}
                  >
                    {w >= 1000 ? `${w / 1000}kg` : `${w}g`}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-1 p-1 bg-stone-100/90 rounded-2xl border border-stone-200/60 shadow-inner">
              {variants.map((v, idx) => {
                const isSelected = selectedVariant?.name === v.name;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedVariant(v);
                    }}
                    className={`flex-1 py-1.5 text-xs font-black rounded-xl transition-all truncate px-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-white text-stone-900 shadow-sm ring-1 ring-black/5"
                        : "text-stone-500 hover:text-stone-900 hover:bg-white/40"
                    }`}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Add to Cart CTA Button */}
          <button
            type="button"
            disabled={!isAvailable || (priceType === "variant" && !selectedVariant)}
            onClick={handleAddToCart}
            className={`w-full py-3 rounded-2xl font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-97 shadow-sm ${
              !isAvailable || (priceType === "variant" && !selectedVariant)
                ? "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
                : isAdded
                ? "bg-emerald-600 text-white shadow-emerald-600/20 shadow-md"
                : "bg-primary hover:bg-primary/90 text-white shadow-primary/25 hover:shadow-lg hover:shadow-primary/25"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Added to Cart</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 stroke-[2.2]" />
                <span>Add to Cart • Rs. {displayPrice}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
