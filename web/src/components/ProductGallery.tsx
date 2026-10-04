import { useState } from "react";
import { Flame } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  isAvailable?: boolean;
}

export default function ProductGallery({ images, productName, isAvailable = true }: ProductGalleryProps) {
  const validImages = Array.isArray(images) ? images.filter((img) => Boolean(img && img.trim())) : [];
  const [selectedImage, setSelectedImage] = useState<string>(validImages[0] || "");

  const currentDisplayImage = selectedImage || validImages[0] || "";

  return (
    <div className="flex flex-col gap-2.5 sm:gap-4">
      {/* Main Image View */}
      <div className="relative aspect-[4/3] sm:aspect-square max-h-[280px] sm:max-h-none w-full rounded-2xl sm:rounded-3xl bg-[#141211] overflow-hidden border border-stone-200/90 shadow-sm flex items-center justify-center">
        {currentDisplayImage ? (
          <img
            src={currentDisplayImage}
            alt={productName}
            className={`w-full h-full object-cover transition-all duration-300 ${!isAvailable ? "grayscale" : ""}`}
          />
        ) : (
          <div className="w-full h-full relative flex flex-col items-center justify-center bg-gradient-to-br from-[#1c1917] via-[#141211] to-[#0a0a0a] overflow-hidden p-6 sm:p-8 text-center select-none">
            {/* Ambient Red Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(204,4,17,0.22)_0%,transparent_70%)] pointer-events-none" />

            {/* Center Butcher Emblem */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white/[0.07] border border-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl shadow-black/70 mb-2 sm:mb-4 text-primary">
                <Flame className="w-7 h-7 sm:w-10 sm:h-10 stroke-[2.2] fill-primary/25" />
              </div>
              <p className="text-xs sm:text-base font-black uppercase tracking-[0.25em] text-white/95">
                Prime Cuts
              </p>
              <p className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-wider mt-0.5 sm:mt-1.5">
                Fresh Butcher Cut
              </p>
            </div>
          </div>
        )}

        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-xs sm:text-sm font-black text-white px-3.5 py-1 bg-red-600 rounded-full shadow-lg transform -rotate-3 uppercase">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails if multiple images exist */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 no-scrollbar">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedImage(img)}
              className={`relative w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                (selectedImage || validImages[0]) === img
                  ? "border-primary ring-2 ring-primary/20 shadow-md scale-102"
                  : "border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img} alt={`${productName} view ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

