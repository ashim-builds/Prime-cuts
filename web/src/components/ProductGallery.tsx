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
    <div className="flex flex-col gap-4">
      {/* Main Image View */}
      <div className="relative aspect-square w-full rounded-3xl bg-[#141211] overflow-hidden border border-stone-200 shadow-sm flex items-center justify-center">
        {currentDisplayImage ? (
          <img
            src={currentDisplayImage}
            alt={productName}
            className={`w-full h-full object-cover transition-all duration-300 ${!isAvailable ? "grayscale" : ""}`}
          />
        ) : (
          <div className="w-full h-full relative flex flex-col items-center justify-center bg-gradient-to-br from-[#1c1917] via-[#141211] to-[#0a0a0a] overflow-hidden p-8 text-center select-none">
            {/* Ambient Red Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(204,4,17,0.22)_0%,transparent_70%)] pointer-events-none" />

            {/* Center Butcher Emblem */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-white/[0.07] border border-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl shadow-black/70 mb-4 text-primary">
                <Flame className="w-10 h-10 stroke-[2.2] fill-primary/25" />
              </div>
              <p className="text-base font-black uppercase tracking-[0.25em] text-white/95">
                Prime Cuts
              </p>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mt-1.5">
                Fresh Butcher Cut
              </p>
            </div>
          </div>
        )}

        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-sm md:text-base font-black text-white px-4 py-1.5 bg-red-600 rounded-full shadow-lg transform -rotate-6">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails if multiple images exist */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedImage(img)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                (selectedImage || validImages[0]) === img
                  ? "border-primary ring-2 ring-primary/20 shadow-md scale-105"
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

