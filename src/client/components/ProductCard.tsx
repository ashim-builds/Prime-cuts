import { useState } from "react";
import { Link } from "react-router-dom";
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
  image: string;
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
  const [selectedWeight, setSelectedWeight] = useState<number>(250);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(variants.length > 0 ? variants[0] : null);
  const [isAdded, setIsAdded] = useState(false);
  const { addWeightItem, addVariantItem } = useCart();

  const handleAddToCart = () => {
    if (!isAvailable) return;
    
    if (priceType === 'weight') {
      addWeightItem({ id, slug, name, priceType, pricePerKg, image }, selectedWeight, 1);
    } else if (priceType === 'variant' && selectedVariant) {
      addVariantItem({ id, slug, name, priceType, image }, selectedVariant.name, selectedVariant.price, 1);
    }
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const displayPrice = priceType === 'weight' 
    ? pricePerKg 
    : selectedVariant?.price || 0;

  return (
    <div className={`bg-white rounded-2xl p-4 flex flex-row md:flex-col hover:shadow-xl hover:-translate-y-1 shadow-xs transition-all duration-300 border border-stone-200 hover:border-primary gap-4 md:gap-0 h-full relative items-center md:items-start group ${!isAvailable ? 'opacity-70' : ''}`}>
      
      {/* Image */}
      <Link to={`/product/${slug}`} className="relative w-24 h-24 md:w-full md:h-auto md:aspect-square rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
        <img src={image} alt={name} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!isAvailable ? 'grayscale' : ''}`} />
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-[9px] md:text-xs font-bold text-white px-2 py-0.5 bg-red-600 rounded shadow-md uppercase tracking-wider">OUT OF STOCK</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-grow flex flex-col items-start text-left w-full justify-center md:justify-start md:mt-3 pl-1 md:pl-0">
        <span className="hidden md:block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
          {category}
        </span>
        <Link to={`/product/${slug}`} className="hover:text-primary transition-colors">
          <h3 className="font-bold text-stone-900 text-[14px] md:text-[15px] leading-snug mb-1 line-clamp-1">{name}</h3>
        </Link>
        <p className="text-[15px] md:text-[17px] font-black text-primary mb-0 md:mb-3">
          Rs. {displayPrice} {priceType === 'weight' && <span className="text-stone-500 font-medium text-[11px] md:text-[12px]">/ kg</span>}
        </p>
      </div>

      {/* Selection UI (Desktop Only) */}
      <div className="hidden md:block w-full">
        {priceType === 'weight' ? (
          <div className="flex items-center justify-between w-full mb-3 gap-1">
            {[250, 500, 1000].map((w) => (
              <button
                key={w}
                onClick={() => setSelectedWeight(w)}
                className={`flex-1 py-1 text-[11px] font-bold rounded-md border transition-all cursor-pointer ${
                  selectedWeight === w 
                    ? 'border-primary bg-primary/10 text-primary font-extrabold shadow-xs' 
                    : 'border-stone-200 text-stone-600 hover:border-stone-400'
                }`}
              >
                {w >= 1000 ? `${w/1000}kg` : `${w}g`}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between w-full mb-3 gap-1">
            {variants.map((v, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedVariant(v)}
                className={`flex-1 py-1 text-[11px] font-bold rounded-md border transition-all truncate px-1 cursor-pointer ${
                  selectedVariant?.name === v.name 
                    ? 'border-primary bg-primary/10 text-primary font-extrabold' 
                    : 'border-stone-200 text-stone-600 hover:border-stone-400'
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Button */}
      <button 
        disabled={!isAvailable || isAdded || (priceType === 'variant' && !selectedVariant)}
        onClick={handleAddToCart}
        className={`md:hidden w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0 transition-colors shadow-sm cursor-pointer ${
          !isAvailable || (priceType === 'variant' && !selectedVariant)
            ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
            : isAdded 
            ? 'bg-emerald-600 text-white' 
            : 'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20'
        }`}
      >
        <span className="font-bold text-base">
          {isAdded ? '✓' : '+'}
        </span>
      </button>

      <button 
        disabled={!isAvailable || isAdded || (priceType === 'variant' && !selectedVariant)}
        onClick={handleAddToCart}
        className={`hidden md:flex w-full h-[38px] rounded-lg items-center justify-center flex-shrink-0 transition-all shadow-sm cursor-pointer ${
          !isAvailable || (priceType === 'variant' && !selectedVariant)
            ? 'bg-stone-200 cursor-not-allowed' 
            : isAdded 
            ? 'bg-emerald-600 text-white' 
            : 'bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 hover:shadow-primary/30'
        }`}
      >
        <span className={`font-black text-[13px] uppercase tracking-wide ${isAvailable && !isAdded ? 'text-white' : isAdded ? 'text-white' : 'text-stone-400'}`}>
          {isAdded ? 'ADDED' : isAvailable ? 'ADD TO CART' : 'SOLD OUT'}
        </span>
      </button>

    </div>
  );
}
