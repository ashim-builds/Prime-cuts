import { useState } from "react";
import { Plus, Minus, CheckCircle2, Scale } from "lucide-react";
import { useCart } from "../context/CartContext";
import { Product, Variant } from "@/types/types";

interface WeightSelectorProps {
  product: Product;
  isAvailable: boolean;
}

const DEFAULT_PRESET_WEIGHTS = [
  { value: 250, unit: "g", label: "250g" },
  { value: 500, unit: "g", label: "500g" },
  { value: 750, unit: "g", label: "750g" },
  { value: 1, unit: "kg", label: "1kg" },
  { value: 2, unit: "kg", label: "2kg" },
];

export default function WeightSelector({ product, isAvailable }: WeightSelectorProps) {
  const { addWeightItem, addVariantItem } = useCart();

  const [weightInGrams, setWeightInGrams] = useState<number>(500);
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [customKgStr, setCustomKgStr] = useState<string>("1.0");

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );

  const [qty, setQty] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);

  const activeWeightGrams = isCustom
    ? Math.max(0, Math.round((parseFloat(customKgStr) || 0) * 1000))
    : weightInGrams;

  let finalPrice = "0.00";
  if (product.priceType === "weight" && product.pricePerKg) {
    finalPrice = Math.max(0, (activeWeightGrams / 1000) * product.pricePerKg * qty).toFixed(2);
  } else if (product.priceType === "variant" && selectedVariant) {
    finalPrice = (selectedVariant.price * qty).toFixed(2);
  }

  const allowCustom = product.allowCustomWeight !== false;

  const handlePresetSelect = (val: number, unit: string) => {
    const grams = unit === "kg" ? val * 1000 : val;
    setWeightInGrams(grams);
    setIsCustom(false);
  };

  const handleCustomSelect = () => {
    if (!allowCustom) return;
    setIsCustom(true);
    if (!customKgStr) {
      setCustomKgStr("1.0");
    }
  };

  const handleCustomKgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomKgStr(val);
  };

  const increaseQty = () => setQty((prev) => prev + 1);
  const decreaseQty = () => setQty((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    if (!isAvailable) return;
    if (product.priceType === "weight" && activeWeightGrams <= 0) return;
    if (product.priceType === "variant" && !selectedVariant) return;

    if (product.priceType === "weight") {
      addWeightItem(
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          priceType: product.priceType,
          pricePerKg: product.pricePerKg,
          image: product.image || "",
        },
        activeWeightGrams,
        qty
      );
    } else if (product.priceType === "variant" && selectedVariant) {
      addVariantItem(
        {
          id: product.id,
          slug: product.slug,
          name: product.name,
          priceType: product.priceType,
          image: product.image || "",
        },
        selectedVariant.name,
        selectedVariant.price,
        qty
      );
    }

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="flex flex-col mt-2 sm:mt-4 space-y-3 sm:space-y-5">
      {/* Option Selector */}
      <div>
        <p className="font-extrabold text-stone-900 mb-2 text-xs uppercase tracking-wider">
          {product.priceType === "weight" ? "Select Weight" : "Select Cut Variant"}
        </p>

        {product.priceType === "weight" ? (
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1.5 sm:gap-2">
            {DEFAULT_PRESET_WEIGHTS.map((preset, idx) => {
              const presetGrams = preset.unit === "kg" ? preset.value * 1000 : preset.value;
              const isSelected = !isCustom && weightInGrams === presetGrams;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetSelect(preset.value, preset.unit)}
                  className={`py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all border cursor-pointer active:scale-95 text-center ${
                    isSelected
                      ? "border-primary bg-primary text-white shadow-sm font-black"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}

            {allowCustom && (
              <button
                type="button"
                onClick={handleCustomSelect}
                className={`py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all border cursor-pointer active:scale-95 flex items-center justify-center gap-1 ${
                  isCustom
                    ? "border-primary bg-primary text-white shadow-sm font-black"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50"
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Custom</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2">
            {product.variants?.map((v, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedVariant(v)}
                className={`py-1.5 sm:py-2 px-2.5 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all border cursor-pointer active:scale-95 ${
                  selectedVariant?.name === v.name
                    ? "border-primary bg-primary text-white shadow-sm font-black"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Custom Weight Input in KG */}
      {product.priceType === "weight" && isCustom && (
        <div className="transition-all duration-300 bg-stone-50 p-3 sm:p-4 rounded-2xl border border-stone-200">
          <div className="flex items-center justify-between mb-1.5">
            <p className="font-black text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-primary" />
              <span>Enter Weight in Kilograms (kg)</span>
            </p>
            <span className="text-[10px] sm:text-[11px] text-stone-500 font-bold bg-white px-2 py-0.5 rounded-md border border-stone-200">
              In KG
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-36 sm:w-40">
              <input
                type="number"
                min="0.1"
                step="0.1"
                placeholder="e.g. 1.5"
                value={customKgStr}
                onChange={handleCustomKgChange}
                className="w-full py-2 pl-3 pr-9 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-stone-900 font-black text-sm sm:text-base"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-[11px] uppercase">
                kg
              </span>
            </div>

            <div className="text-xs text-stone-500 font-medium">
              = <span className="font-bold text-stone-800">{activeWeightGrams}g</span>
            </div>
          </div>
        </div>
      )}

      {/* Price & Quantity Bar */}
      <div className="flex items-center justify-between gap-3 bg-stone-50 p-3 sm:p-4 rounded-2xl border border-stone-200/80">
        <div>
          <span className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-wider block">
            Subtotal Price
          </span>
          <span className="font-black text-primary text-lg sm:text-2xl tracking-tight">
            Rs. {finalPrice}
          </span>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center border border-stone-200 rounded-xl bg-white shadow-2xs">
          <button
            type="button"
            onClick={decreaseQty}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-stone-600 hover:text-primary hover:bg-stone-50 rounded-l-xl transition-colors cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <div className="w-9 h-8 sm:w-10 sm:h-9 flex items-center justify-center border-x border-stone-100 text-stone-900 font-black text-xs sm:text-sm">
            {qty}
          </div>
          <button
            type="button"
            onClick={increaseQty}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-stone-600 hover:text-primary hover:bg-stone-50 rounded-r-xl transition-colors cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={
          !isAvailable ||
          (product.priceType === "weight" && activeWeightGrams <= 0) ||
          (product.priceType === "variant" && !selectedVariant) ||
          isAdded
        }
        className={`w-full h-11 sm:h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-98 ${
          !isAvailable ||
          (product.priceType === "weight" && activeWeightGrams <= 0) ||
          (product.priceType === "variant" && !selectedVariant)
            ? "bg-stone-200 text-stone-400 cursor-not-allowed"
            : isAdded
            ? "bg-emerald-600 text-white"
            : "bg-primary text-white hover:bg-primary/90 shadow-primary/20 font-black uppercase text-xs sm:text-sm tracking-wider"
        }`}
      >
        {isAdded ? (
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
            <span>ADDED TO CART</span>
          </span>
        ) : !isAvailable ? (
          "SOLD OUT"
        ) : (
          `ADD TO CART • Rs. ${finalPrice}`
        )}
      </button>
    </div>
  );
}
