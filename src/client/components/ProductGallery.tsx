import { useState } from "react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  isAvailable?: boolean;
}

export default function ProductGallery({ images, productName, isAvailable = true }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string>(images[0] || "/images/hero_prime_meat.jpg");

  const validImages = images.length > 0 ? images : ["/images/hero_prime_meat.jpg"];

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image View */}
      <div className="relative aspect-square w-full rounded-2xl bg-stone-100 overflow-hidden border border-stone-200 shadow-sm">
        <img
          src={selectedImage}
          alt={productName}
          className={`w-full h-full object-cover transition-all duration-300 ${!isAvailable ? "grayscale" : ""}`}
        />
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
                selectedImage === img
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
