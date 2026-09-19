import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Truck,
  UtensilsCrossed,
  Star,
  Award,
  MapPin,
  Scale,
  ShoppingCart,
  ShoppingBag,
  ClipboardList,
  Bike,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import { Product } from "@/types/types";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData(retry = 0) {
      try {
        const featRes = await fetch("/api/products/featured");
        let items: Product[] = [];
        if (featRes.ok) {
          const featData = await featRes.json();
          if (featData.success && Array.isArray(featData.products)) {
            items = featData.products;
          }
        }

        if (items.length < 4) {
          const allRes = await fetch("/api/products");
          if (allRes.ok) {
            const allData = await allRes.json();
            if (allData.success && Array.isArray(allData.products)) {
              const existingIds = new Set(items.map((p) => p.id));
              for (const p of allData.products) {
                if (!existingIds.has(p.id)) {
                  items.push(p);
                  existingIds.add(p.id);
                }
              }
            }
          }
        }

        if (isMounted) {
          setFeaturedProducts(items);
        }
      } catch (err) {
        if (retry < 2) {
          setTimeout(() => {
            if (isMounted) loadData(retry + 1);
          }, 500);
          return;
        }
        console.error("Failed to load home page data", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION - IMMERSIVE ARTISANAL BUTCHER SHOWCASE */}
      <section className="relative min-h-[100px] sm:min-h-[480px] lg:min-h-[570px] bg-black text-white overflow-hidden flex items-center mx-3.5 sm:mx-0 mt-2.5 sm:mt-0 rounded-3xl sm:rounded-none shadow-2xl">
        {/* Actual Image Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <picture className="w-full h-full block">
            <source
              media="(min-width: 768px)"
              srcSet="/images/hero_bg_desktop.jpg"
            />
            <img
              src="/images/hero_bg_mobile.jpg"
              alt="Artisanal Prime Meat Butcher House"
              className="w-full h-full object-cover object-right md:object-[75%_center]"
            />
          </picture>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 lg:py-20 w-full">
          <div className="max-w-2xl flex flex-col items-start text-left">
            {/* Main Headline */}
            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] mb-3 sm:mb-5 text-white">
              Fresh & Quality Meats, <br />
              <span className="text-primary">Cut Daily to Your Order</span>
            </h1>

            {/* Subheading - Shown on Web/Desktop, hidden on mobile */}
            <p className="hidden sm:block text-base sm:text-lg text-stone-200 mb-6 sm:mb-8 max-w-xl font-normal leading-relaxed">
              Locally sourced goat (khasi), tender chicken, fresh buff, pork,
              and custom cuts. Cleanly prepped in hygienic conditions and
              delivered straight to your home.
            </p>

            {/* Order Now Button */}
            <div>
              <a
                href="#shop-cuts"
                className="px-5 sm:px-7 py-2.5 sm:py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-colors text-xs sm:text-sm tracking-wide inline-flex items-center gap-2 cursor-pointer active:scale-95 group shadow-md"
              >
                <span>Order Now</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST COMMITMENT / FEATURES BAR - RED, BLACK & WHITE THEME */}
      <section className="bg-[#0d0d0d] border border-[#1f1f1f] sm:border-x-0 rounded-3xl sm:rounded-none mx-3.5 sm:mx-0 mt-3 sm:mt-0 py-4 sm:py-5 relative z-10 text-white shadow-xl overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-center lg:divide-x lg:divide-neutral-800">
            <div className="flex items-center gap-3 sm:gap-3.5 lg:pr-5">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 stroke-[1.8]" />
              <div>
                <p className="text-white text-xs sm:text-sm font-bold leading-tight">
                  Freshly Made
                </p>
                <p className="text-neutral-400 text-[11px] sm:text-xs mt-0.5">
                  Hygienic & Clean
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-3.5 lg:px-5">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 stroke-[1.8]" />
              <div>
                <p className="text-white text-xs sm:text-sm font-bold leading-tight">
                  Quality Ingredients
                </p>
                <p className="text-neutral-400 text-[11px] sm:text-xs mt-0.5">
                  100% Trusted
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-3.5 lg:px-5">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 stroke-[1.8]" />
              <div>
                <p className="text-white text-xs sm:text-sm font-bold leading-tight">
                  Fast Delivery
                </p>
                <p className="text-neutral-400 text-[11px] sm:text-xs mt-0.5">
                  On Time
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-3.5 lg:pl-5">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 stroke-[1.8]" />
              <div>
                <p className="text-white text-xs sm:text-sm font-bold leading-tight">
                  Pick-up Available
                </p>
                <p className="text-neutral-400 text-[11px] sm:text-xs mt-0.5">
                  Visit Our Shop
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR FRESH CUTS (FEATURED PRODUCTS) */}
      <section
        id="shop-cuts"
        className="py-14 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
      >
        <div className="flex items-center justify-between mb-6 sm:mb-10 pb-3 sm:pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
              Popular Fresh Cuts
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-primary hover:text-primary-hover group bg-red-50 hover:bg-red-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all shrink-0 w-auto"
          >
            <span>View All Cuts</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                slug={product.slug}
                name={product.name}
                priceType={product.priceType}
                pricePerKg={product.pricePerKg}
                variants={product.variants}
                image={product.image}
                category={product.category}
                isAvailable={product.isAvailable ?? product.available ?? true}
              />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="py-12 text-center bg-stone-50 rounded-2xl border border-stone-200 p-8 max-w-xl mx-auto">
              <p className="text-stone-700 font-bold text-base">
                Fresh cuts coming soon!
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Our master butchers are preparing fresh cuts daily. Check back
                shortly or browse our shop.
              </p>
            </div>
          )
        )}

        {/* View All Button */}
        <div className="flex justify-center mt-10 sm:mt-16">
          <Link
            to="/shop"
            className="bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm uppercase tracking-wider px-6 sm:px-9 py-3 sm:py-4 rounded-xl transition-all shadow-lg shadow-primary/25 cursor-pointer flex items-center gap-2 active:scale-95 w-auto"
          >
            <UtensilsCrossed className="w-4 h-4" />
            Explore Full Meat Catalog
          </Link>
        </div>
      </section>

      {/* 4. HOW IT WORKS - RED, WHITE & BLACK THEME */}
      <section className="bg-white pt-6">
        <div className="bg-[#121214] rounded-t-3xl sm:rounded-t-[2.5rem] border-t border-[#24242a] text-white py-10 sm:py-16 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* ==================== MOBILE VIEW (Short & Responsive 3 + 2 Circular Flow) ==================== */}
            <div className="sm:hidden text-center">
              <span className="text-primary font-bold text-[11px] uppercase tracking-widest block mb-1.5">
                HOW TO ORDER
              </span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white leading-tight">
                ORDER YOUR <br />
                FAVOURITES BY WEIGHT
              </h2>

              {/* Decorative Red Wave */}
              <div className="flex justify-center my-3.5">
                <svg
                  width="48"
                  height="10"
                  viewBox="0 0 64 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-primary"
                >
                  <path
                    d="M2 6C6 2 10 2 14 6C18 10 22 10 26 6C30 2 34 2 38 6C42 10 46 10 50 6C54 2 58 2 62 6"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Top Row: 3 Circular Steps */}
              <div className="grid grid-cols-3 gap-2 mt-6 mb-6">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-white text-stone-950 flex items-center justify-center shadow-lg shadow-black/40 mb-2 active:scale-95 transition-transform">
                    <ShoppingBag className="w-7 h-7 stroke-[2.2] text-stone-900" />
                  </div>
                  <span className="font-black text-xs text-white leading-tight text-center">
                    Choose Product
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-white text-stone-950 flex items-center justify-center shadow-lg shadow-black/40 mb-2 active:scale-95 transition-transform">
                    <Scale className="w-7 h-7 stroke-[2.2] text-stone-900" />
                  </div>
                  <span className="font-black text-xs text-white leading-tight text-center">
                    Select Weight
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-white text-stone-950 flex items-center justify-center shadow-lg shadow-black/40 mb-2 active:scale-95 transition-transform">
                    <ShoppingCart className="w-7 h-7 stroke-[2.2] text-stone-900" />
                  </div>
                  <span className="font-black text-xs text-white leading-tight text-center">
                    Add to Cart
                  </span>
                </div>
              </div>

              {/* Bottom Row: 2 Centered Steps */}
              <div className="flex justify-center items-center gap-6 max-w-xs mx-auto">
                <div className="flex flex-col items-center w-24">
                  <div className="w-16 h-16 rounded-full bg-white text-stone-950 flex items-center justify-center shadow-lg shadow-black/40 mb-2 active:scale-95 transition-transform">
                    <ClipboardList className="w-7 h-7 stroke-[2.2] text-stone-900" />
                  </div>
                  <span className="font-black text-xs text-white leading-tight text-center">
                    Place Order
                  </span>
                </div>

                <div className="flex flex-col items-center w-24">
                  <div className="w-16 h-16 rounded-full bg-white text-stone-950 flex items-center justify-center shadow-lg shadow-black/40 mb-2 active:scale-95 transition-transform">
                    <Bike className="w-7 h-7 stroke-[2.2] text-stone-900" />
                  </div>
                  <span className="font-black text-xs text-white leading-tight text-center">
                    We Deliver
                  </span>
                </div>
              </div>
            </div>

            {/* ==================== DESKTOP VIEW (5 Connected Detailed Cards) ==================== */}
            <div className="hidden sm:block">
              {/* Section Header */}
              <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
                <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-2">
                  HOW IT WORKS
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  From the Butcher Block to Your Table
                </h2>
                <p className="text-stone-400 text-xs sm:text-sm mt-2">
                  Simple, transparent 5-step process from our shop to your home.
                </p>
              </div>

              {/* 5-Step Connected Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
                {[
                  {
                    step: "1",
                    title: "Select Your Meat",
                    desc: "Choose from fresh goat, chicken, buff, pork, or sausages.",
                  },
                  {
                    step: "2",
                    title: "Pick Cut & Weight",
                    desc: "Choose curry cut, boneless, mince, or custom grams.",
                  },
                  {
                    step: "3",
                    title: "Place Your Order",
                    desc: "Enter your delivery address with simple checkout.",
                  },
                  {
                    step: "4",
                    title: "Fresh Morning Cut",
                    desc: "Sliced and sealed in sterile, food-grade packaging.",
                  },
                  {
                    step: "5",
                    title: "Chilled Delivery",
                    desc: "Delivered fresh and cold directly to your kitchen.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center text-center p-5 rounded-2xl bg-[#17171a] border border-[#232328] transition-all hover:border-primary/40 hover:-translate-y-1 group"
                  >
                    {/* Step Number Circle Badge */}
                    <div className="w-8 h-8 rounded-full bg-primary text-white font-black text-xs flex items-center justify-center mb-3.5 shadow-md shadow-primary/20 group-hover:scale-110 transition-transform">
                      {item.step}
                    </div>

                    <h3 className="font-extrabold text-sm text-white mb-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-stone-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
