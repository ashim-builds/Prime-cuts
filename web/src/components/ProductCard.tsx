import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Check, Flame } from "lucide-react";
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
    <div className={`group bg-white rounded-2xl border border-stone-200 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-stone-900/5 hover:-translate-y-1 flex flex-col justify-between overflow-hidden h-full relative ${!isAvailable ? 'opacity-70' : ''}`}>
      
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] w-full bg-[#141211] overflow-hidden flex items-center justify-center">
        <Link to={`/product/${slug}`} className="block w-full h-full relative">
          {image ? (
            <img 
              src={image} 
              alt={name} 
              className={`w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${!isAvailable ? 'grayscale' : ''}`} 
            />
          ) : (
            <div className="w-full h-full relative flex flex-col items-center justify-center bg-gradient-to-br from-[#1c1917] via-[#141211] to-[#0a0a0a] overflow-hidden p-6 text-center select-none group-hover:bg-[#181615] transition-colors">
              {/* Subtle Red Ambient Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(204,4,17,0.22)_0%,transparent_70%)] pointer-events-none" />
              
              {/* Center Butcher Emblem */}
              <div className="relative z-10 flex flex-col items-center transform transition-transform duration-500 group-hover:scale-110">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.07] border border-white/10 backdrop-blur-md flex items-center justify-center shadow-xl shadow-black/60 mb-2.5 text-primary">
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
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase border border-white/10 shadow-xs">
            {category}
          </span>
        </div>

        {/* Fresh Daily Pill */}
        {isAvailable && (
          <div className="absolute top-3 right-3 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-stone-800 text-[10px] font-bold shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Fresh Cut</span>
            </span>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <span className="text-xs font-black text-white px-3 py-1 bg-primary rounded-full shadow-lg tracking-wider uppercase">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between text-left">
        <div>
          {/* Title */}
          <Link to={`/product/${slug}`} className="block mb-1.5 group-hover:text-primary transition-colors">
            <h3 className="font-extrabold text-stone-900 text-[15px] sm:text-[17px] leading-snug line-clamp-1">
              {name}
            </h3>
          </Link>

          {/* Dynamic Pricing according to selected weight */}
          <div className="flex items-baseline justify-between mb-3.5">
            <div>
              <span className="text-xl sm:text-2xl font-black text-primary">
                Rs. {displayPrice}
              </span>
              {priceType === 'weight' && (
                <span className="text-stone-500 text-xs font-bold ml-1.5">
                  ({selectedWeight >= 1000 ? `${selectedWeight / 1000}kg` : `${selectedWeight}g`})
                </span>
              )}
            </div>
            {priceType === 'weight' && pricePerKg && (
              <span className="text-stone-400 text-[11px] font-semibold">
                Rs. {pricePerKg}/kg
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="pt-2 border-t border-stone-100">
          {/* Weight / Variant Selectors */}
          <div className="mb-3">
            {priceType === 'weight' ? (
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-xl">
                {[250, 500, 1000].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedWeight(w);
                    }}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      selectedWeight === w 
                        ? 'bg-primary text-white shadow-xs font-black' 
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {w >= 1000 ? `${w/1000}kg` : `${w}g`}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
                {variants.map((v, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedVariant(v);
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all truncate px-1 cursor-pointer ${
                      selectedVariant?.name === v.name 
                        ? 'bg-primary text-white shadow-xs font-black' 
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add to Cart CTA */}
          <button 
            type="button"
            disabled={!isAvailable || (priceType === 'variant' && !selectedVariant)}
            onClick={handleAddToCart}
            className={`w-full py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm ${
              !isAvailable || (priceType === 'variant' && !selectedVariant)
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                : isAdded 
                ? 'bg-emerald-600 text-white' 
                : 'bg-primary hover:bg-primary-hover text-white shadow-primary/20 hover:shadow-md'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Added to Cart</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
