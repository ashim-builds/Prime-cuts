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
    <div className="flex flex-col mt-4">
      {/* Option Selector */}
      <div className="mb-6">
        <p className="font-extrabold text-stone-900 mb-2.5 text-sm uppercase tracking-wider">
          {product.priceType === "weight" ? "Select Weight" : "Select Variant"}
        </p>

        {product.priceType === "weight" ? (
          <div className="flex flex-wrap gap-2">
            {DEFAULT_PRESET_WEIGHTS.map((preset, idx) => {
              const presetGrams = preset.unit === "kg" ? preset.value * 1000 : preset.value;
              const isSelected = !isCustom && weightInGrams === presetGrams;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetSelect(preset.value, preset.unit)}
                  className={`py-2 px-4 rounded-xl font-bold text-sm transition-all border cursor-pointer ${
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
                className={`py-2 px-4 rounded-xl font-bold text-sm transition-all border cursor-pointer flex items-center gap-1.5 ${
                  isCustom
                    ? "border-primary bg-primary text-white shadow-sm font-black"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50"
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>Custom (kg)</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {product.variants?.map((v, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedVariant(v)}
                className={`py-2 px-4 rounded-xl font-bold text-sm transition-all border cursor-pointer ${
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
        <div className="mb-6 transition-all duration-300 bg-stone-50 p-4 rounded-2xl border border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <p className="font-black text-stone-900 text-sm flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-primary" />
              <span>Enter Weight (in Kilograms / kg)</span>
            </p>
            <span className="text-[11px] text-stone-500 font-bold bg-white px-2 py-0.5 rounded-md border border-stone-200">
              Only KG
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-40">
              <input
                type="number"
                min="0.1"
                step="0.1"
                placeholder="e.g. 1.5"
                value={customKgStr}
                onChange={handleCustomKgChange}
                className="w-full py-2.5 pl-3.5 pr-10 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-stone-900 font-black text-base"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-xs uppercase">
                kg
              </span>
            </div>

            <div className="text-xs text-stone-500 font-medium">
              = <span className="font-bold text-stone-800">{activeWeightGrams} grams</span>
            </div>
          </div>
        </div>
      )}

      {/* Total Calculated Price */}
      <div className="mb-6 bg-red-50/50 p-3.5 rounded-2xl border border-red-100 flex items-center justify-between">
        <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
          Total Price:
        </span>
        <span className="font-black text-primary text-2xl tracking-tight">
          Rs. {finalPrice}
        </span>
      </div>

      {/* Qty */}
      <div className="mb-6">
        <p className="font-extrabold text-stone-900 mb-2 text-xs uppercase tracking-wider">Quantity</p>
        <div className="flex items-center border border-stone-200 rounded-xl w-fit bg-white shadow-xs">
          <button
            type="button"
            onClick={decreaseQty}
            className="w-10 h-10 flex items-center justify-center text-stone-600 hover:text-primary hover:bg-stone-50 rounded-l-xl transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="w-12 h-10 flex items-center justify-center border-x border-stone-100 text-stone-900 font-black text-sm">
            {qty}
          </div>
          <button
            type="button"
            onClick={increaseQty}
            className="w-10 h-10 flex items-center justify-center text-stone-600 hover:text-primary hover:bg-stone-50 rounded-r-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
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
        className={`w-full h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-98 ${
          !isAvailable ||
          (product.priceType === "weight" && activeWeightGrams <= 0) ||
          (product.priceType === "variant" && !selectedVariant)
            ? "bg-stone-200 text-stone-400 cursor-not-allowed"
            : isAdded
            ? "bg-emerald-600 text-white"
            : "bg-primary text-white hover:bg-primary/90 shadow-primary/20 font-black uppercase text-sm tracking-wider"
        }`}
      >
        {isAdded ? (
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
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
