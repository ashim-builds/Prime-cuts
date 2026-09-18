import { useState } from "react";
import { Plus, Minus, CheckCircle2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { Product, Variant } from "../../shared/types";

interface WeightSelectorProps {
  product: Product;
  isAvailable: boolean;
}

const DEFAULT_PRESET_WEIGHTS = [
  { value: 250, unit: "g" },
  { value: 500, unit: "g" },
  { value: 750, unit: "g" },
  { value: 1, unit: "kg" },
];

export default function WeightSelector({ product, isAvailable }: WeightSelectorProps) {
  const { addWeightItem, addVariantItem } = useCart();
  
  const [weight, setWeight] = useState<number>(500); 
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customWeightStr, setCustomWeightStr] = useState<string>("");
  
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );

  const [qty, setQty] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);

  let finalPrice = "0.00";
  if (product.priceType === 'weight' && product.pricePerKg) {
    finalPrice = Math.max(0, (weight / 1000) * product.pricePerKg * qty).toFixed(2);
  } else if (product.priceType === 'variant' && selectedVariant) {
    finalPrice = (selectedVariant.price * qty).toFixed(2);
  }

  const weightOptions = product.weightOptions && product.weightOptions.length > 0 
    ? product.weightOptions 
    : DEFAULT_PRESET_WEIGHTS;

  const allowCustom = product.allowCustomWeight !== false;

  const handlePresetSelect = (val: number, unit: string) => {
    const grams = unit === 'kg' ? val * 1000 : val;
    setWeight(grams);
    setIsCustom(false);
    setCustomWeightStr("");
  };

  const handleCustomSelect = () => {
    if (!allowCustom) return;
    setIsCustom(true);
    setWeight(customWeightStr ? parseInt(customWeightStr, 10) || 0 : 0);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomWeightStr(val);
    
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setWeight(num);
    } else {
      setWeight(0);
    }
  };

  const increaseQty = () => setQty(prev => prev + 1);
  const decreaseQty = () => setQty(prev => prev > 1 ? prev - 1 : 1);

  const handleAddToCart = () => {
    if (!isAvailable) return;
    if (product.priceType === 'weight' && weight <= 0) return;
    if (product.priceType === 'variant' && !selectedVariant) return;
    
    if (product.priceType === 'weight') {
      addWeightItem(product, weight, qty);
    } else if (product.priceType === 'variant' && selectedVariant) {
      addVariantItem(product, selectedVariant.name, selectedVariant.price, qty);
    }

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="flex flex-col mt-4">
      {/* Option Selector */}
      <div className="mb-6">
        <p className="font-bold text-black mb-3 text-[15px]">
          {product.priceType === 'weight' ? "Select Weight" : "Select Variant"}
        </p>
        
        {product.priceType === 'weight' ? (
          <div className="flex flex-wrap gap-2">
            {weightOptions.map((preset, idx) => {
              const presetGrams = preset.unit === 'kg' ? preset.value * 1000 : preset.value;
              return (
                <button
                  key={idx}
                  onClick={() => handlePresetSelect(preset.value, preset.unit)}
                  className={`py-2 px-4 rounded-lg font-bold text-sm transition-all border cursor-pointer ${
                    !isCustom && weight === presetGrams
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                  }`}
                >
                  {preset.value}{preset.unit}
                </button>
              );
            })}
            
            {allowCustom && (
              <button
                onClick={handleCustomSelect}
                className={`py-2 px-4 rounded-lg font-bold text-sm transition-all border cursor-pointer ${
                  isCustom
                    ? "border-primary bg-primary/10 text-primary shadow-xs"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                }`}
              >
                Custom Weight
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {product.variants?.map((v, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedVariant(v)}
                className={`py-2 px-4 rounded-lg font-bold text-sm transition-all border cursor-pointer ${
                  selectedVariant?.name === v.name
                    ? "border-primary bg-primary/10 text-primary shadow-xs"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Custom Weight Input */}
      {product.priceType === 'weight' && isCustom && (
        <div className="mb-6 transition-all duration-300 bg-red-50/50 p-4 rounded-xl border border-red-100">
          <p className="font-bold text-black mb-2 text-[14px]">
            Custom Weight <span className="text-stone-500 font-normal">(in grams)</span>
          </p>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="100"
              step="50"
              placeholder="e.g. 750"
              value={customWeightStr}
              onChange={handleCustomChange}
              className="w-[140px] py-2 px-3 rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-primary text-black font-bold text-sm"
            />
            <div className="text-[15px] text-stone-600">
              Total: <span className="font-black text-primary text-lg">Rs. {finalPrice}</span>
            </div>
          </div>
        </div>
      )}

      {!(product.priceType === 'weight' && isCustom) && (
        <div className="mb-6 flex items-center gap-4">
           <div className="text-[15px] text-stone-600">
            Total Price: <span className="font-black text-primary text-xl">Rs. {finalPrice}</span>
          </div>
        </div>
      )}

      {/* Qty */}
      <div className="mb-6">
        <p className="font-bold text-black mb-2 text-[15px]">Quantity</p>
        <div className="flex items-center border border-stone-300 rounded-lg w-fit bg-white">
          <button onClick={decreaseQty} className="w-10 h-10 flex items-center justify-center text-stone-600 hover:text-primary hover:bg-stone-50 rounded-l-lg transition-colors cursor-pointer">
            <Minus className="w-4 h-4" />
          </button>
          <div className="w-12 h-10 flex items-center justify-center border-x border-stone-200 text-black font-extrabold text-sm">
            {qty}
          </div>
          <button onClick={increaseQty} className="w-10 h-10 flex items-center justify-center text-stone-600 hover:text-primary hover:bg-stone-50 rounded-r-lg transition-colors cursor-pointer">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={!isAvailable || (product.priceType === 'weight' && weight <= 0) || (product.priceType === 'variant' && !selectedVariant) || isAdded}
        className={`w-full h-[50px] rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-98 ${
          !isAvailable || (product.priceType === 'weight' && weight <= 0) || (product.priceType === 'variant' && !selectedVariant)
            ? "bg-stone-200 text-stone-400 cursor-not-allowed"
            : isAdded
            ? "bg-emerald-600 text-white"
            : "bg-primary text-white hover:bg-primary-hover shadow-primary/30 font-black uppercase text-sm tracking-wider"
        }`}
      >
        {isAdded ? (
          <span className="flex items-center"><CheckCircle2 className="w-5 h-5 mr-2" /> ADDED TO CART</span>
        ) : !isAvailable ? (
          "SOLD OUT"
        ) : (
          "ADD TO CART"
        )}
      </button>
    </div>
  );
}
