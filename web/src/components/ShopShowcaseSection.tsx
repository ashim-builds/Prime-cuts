import React, { useState } from "react";
import {
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  Maximize2,
  X,
  ExternalLink,
  ShieldCheck,
  Store,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const shopPhotos = [
  {
    id: "storefront",
    title: "Khudi Chowk Physical Store",
    desc: "Our walk-in butcher shop & pickup counter in Pokhara-30",
    src: "/images/shop/shop_front_view.jpg",
  },
  {
    id: "banner",
    title: "Signature Shop Signboard",
    desc: "Prime Cuts Butcher House - Fresh Meat, Frozen Goodness",
    src: "/images/shop/shop_banner_horizontal.jpg",
  },
  {
    id: "posters",
    title: "Product Visuals & Standards",
    desc: "Quality cuts guarantee for goat, chicken, eggs, sausages & momos",
    src: "/images/shop/shop_posters_grid.jpg",
  },
  {
    id: "flyer",
    title: "Store Information Poster",
    desc: "Official shop brochure with daily meat items & phone numbers",
    src: "/images/shop/shop_brochure_nepali.jpg",
  },
];

export default function ShopShowcaseSection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const phone1 = "9714324919";
  const phone2 = "9747470470";
  const whatsappUrl = `https://wa.me/9779714324919?text=${encodeURIComponent(
    "Hello Prime Cuts Butcher House! I would like to place an order for fresh meat."
  )}`;
  const mapsUrl = "https://maps.app.goo.gl/cEEEaU5Gj6EjC4Uo9";

  return (
    <section className="bg-[#fbf9f5] border-t border-b border-[#e9e4da] py-10 sm:py-14 text-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ==================== 1. COMPACT, CLEAN HEADER ==================== */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eee9df] text-stone-800 text-[11px] sm:text-xs font-semibold tracking-wide mb-2.5">
            <Store className="w-3.5 h-3.5 text-primary" />
            <span className="md:hidden">Khudi Chowk, Pokhara-30</span>
            <span className="hidden md:inline">Prime Cuts Butcher House • Khudi Chowk, Pokhara-30</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold text-stone-950 tracking-tight">
            <span className="md:hidden">Our Physical Butcher House</span>
            <span className="hidden md:inline">Fresh & Quality Meats — Our Commitment</span>
          </h2>

          <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
            <span className="md:hidden">Cleanly prepared daily for counter pickup and fast doorstep delivery.</span>
            <span className="hidden md:inline">High quality cuts at affordable prices. Cleanly prepared in hygienic conditions and available for daily store pickup or fast home delivery.</span>
          </p>
        </div>

        {/* ==================== 2. QUICK CONTACT / BANNER STRIP ==================== */}
        <div className="bg-white border border-[#e5e0d5] rounded-2xl p-4 sm:p-6 shadow-sm mb-6 sm:mb-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-primary flex items-center justify-center shrink-0 border border-red-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-stone-900">
                  <span className="md:hidden">Walk-in Shop & Phone Orders</span>
                  <span className="hidden md:inline">Visit Us or Order by Phone / WhatsApp</span>
                </p>
                <p className="text-[11px] sm:text-xs text-stone-500">
                  Daily 7:00 AM – 8:00 PM • Open 7 Days a Week • Khudi Chowk, Pokhara-30
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 sm:flex items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
              <a
                href={`tel:${phone1}`}
                className="inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="md:hidden">Call</span>
                <span className="hidden md:inline">Call {phone1}</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="md:hidden">WhatsApp</span>
                <span className="hidden md:inline">WhatsApp Order</span>
              </a>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 bg-[#f4f0e6] hover:bg-[#eae5d8] text-stone-800 text-xs font-bold sm:font-semibold px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl transition-all border border-[#ded8cb] active:scale-95"
              >
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span className="md:hidden">Map</span>
                <span className="hidden md:inline">Map Directions</span>
              </a>
            </div>
          </div>
        </div>

        {/* ==================== 3. PHOTO GALLERY / OUTLET VISUALS ==================== */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-950">
                Our Physical Outlet & Signboards
              </h3>
              <p className="text-xs text-stone-500">
                Located at Khudi Chowk, Pokhara-30
              </p>
            </div>
            <span className="text-xs text-stone-500 hidden sm:inline">
              Tap any photo to view full size
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {shopPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedImage(photo.src)}
                className="bg-white border border-[#e8e3d8] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                  <img
                    src={photo.src}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-xs font-semibold">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Zoom</span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-stone-900 line-clamp-1">
                    {photo.title}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                    {photo.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ==================== 4. OUTLET DETAILS SUMMARY ==================== */}
        <div className="mt-8 pt-6 border-t border-[#e8e3d8] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-600">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2.5 group hover:text-primary transition-colors"
          >
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900 group-hover:text-primary transition-colors block">
                Address (Google Maps)
              </span>
              <span>Khudi Chowk, Pokhara-30, Lekhnath, Pokhara</span>
            </div>
          </a>

          <div className="flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900 block">Phone Contacts</span>
              <span>+977 9714324919 / 9747470470</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900 block">Opening Hours</span>
              <span>Daily 7:00 AM – 8:00 PM (7 Days a Week)</span>
            </div>
          </div>
        </div>

      </div>

      {/* ==================== LIGHTBOX MODAL ==================== */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="overflow-auto max-h-[82vh] flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Shop Preview"
                  className="w-auto h-auto max-h-[78vh] max-w-full object-contain rounded-lg"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
