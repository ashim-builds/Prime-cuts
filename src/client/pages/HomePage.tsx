import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  Scale,
  ShoppingBag,
  Phone,
  CheckCircle2,
  Clock,
  UtensilsCrossed,
  Star,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import { Product } from "../../shared/types";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData(retry = 0) {
      try {
        const featRes = await fetch("/api/products/featured");
        if (featRes.status === 503 && retry < 2) {
          setTimeout(() => {
            if (isMounted) loadData(retry + 1);
          }, 500);
          return;
        }

        if (featRes.ok) {
          const featData = await featRes.json();
          if (isMounted && featData.success && featData.products) {
            setFeaturedProducts(featData.products);
          }
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
      <section className="relative w-full min-h-[580px] lg:min-h-[640px] bg-[#0c0c0e] text-white overflow-hidden flex items-center">
        {/* Seamless Authentic Butcher Atmospheric Backdrop */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/images/hero_prime_meat.jpg"
            alt="Artisanal Prime Meat Butcher House"
            className="w-full h-full object-cover object-center lg:object-[75%_center] opacity-35 lg:opacity-45 filter contrast-110 saturate-105 transform scale-102"
          />
          {/* Multi-Stop Cinematic Vignette & Readability Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0e] via-[#0c0c0e]/95 md:via-[#0c0c0e]/85 lg:via-[#0c0c0e]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-[#0c0c0e]/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_15%_20%,rgba(220,38,38,0.22),transparent)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 w-full">
          <div className="max-w-3xl flex flex-col items-start text-left">
            
            {/* Live Butcher House Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-red-950/70 border border-primary/50 text-red-300 text-xs font-black uppercase tracking-widest backdrop-blur-md mb-6 shadow-xl shadow-red-950/50">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
              <span>DAILY FRESH CUTTING • PRIME CUTS BUTCHER HOUSE</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.10] mb-5 text-white">
              Fresh, Quality Meats, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-amber-400">
                Delivered to Your Doorstep
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-stone-300 mb-8 max-w-2xl font-normal leading-relaxed">
              Farm-fresh goat, tender local chicken, lean buff, fresh pork, artisanal sausages, and prime steaks. Butchered fresh daily with 100% hygienic food-grade packaging and guaranteed chilled delivery across Pokhara.
            </p>

            {/* Action Buttons & Speed Guarantee */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-8">
              <a
                href="#shop-cuts"
                className="px-8 py-4 bg-primary text-white font-black rounded-xl hover:bg-primary-hover transition-all text-sm tracking-wide shadow-xl shadow-red-600/30 hover:shadow-red-600/50 flex items-center gap-2.5 cursor-pointer active:scale-95 group"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop Fresh Meats</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="tel:+9779865311559"
                className="px-6 py-4 bg-white/10 hover:bg-white/18 text-white font-bold rounded-xl border border-white/20 hover:border-white/35 transition-all text-sm tracking-wide backdrop-blur-md flex items-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-primary" />
                <span>Call to Order: 9865311559</span>
              </a>
            </div>

            {/* Social Proof / Hygiene Guarantee Badges */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 pt-5 border-t border-white/10 text-xs text-stone-300 font-semibold">
              <div className="flex items-center gap-1.5 text-amber-300">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                <span className="font-bold text-white">4.9/5</span>
                <span className="text-stone-400">(1,200+ Pokhara Foodies)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Never Frozen • 6 AM Daily Cut</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>Sterile Food-Grade Packaging</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. TRUST COMMITMENT BAR */}
      <section className="bg-stone-50 border-b border-stone-200 py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 items-center">
            
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-red-100 text-primary flex items-center justify-center shrink-0 border border-red-200">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-stone-900 text-sm font-bold leading-tight">Daily Fresh Cutting</p>
                <p className="text-stone-500 text-xs mt-0.5">Never frozen or pre-packed</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-red-100 text-primary flex items-center justify-center shrink-0 border border-red-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-stone-900 text-sm font-bold leading-tight">100% Hygienic & Safe</p>
                <p className="text-stone-500 text-xs mt-0.5">Food-grade sterile packaging</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-red-100 text-primary flex items-center justify-center shrink-0 border border-red-200">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <p className="text-stone-900 text-sm font-bold leading-tight">Custom Weight Cuts</p>
                <p className="text-stone-500 text-xs mt-0.5">From 250g to full kilograms</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-red-100 text-primary flex items-center justify-center shrink-0 border border-red-200">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-stone-900 text-sm font-bold leading-tight">Chilled Express Delivery</p>
                <p className="text-stone-500 text-xs mt-0.5">Direct to your kitchen</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. POPULAR FRESH CUTS (FEATURED PRODUCTS) */}
      <section id="shop-cuts" className="py-14 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-stone-100">
          <div>
            <span className="text-primary font-bold text-xs uppercase tracking-widest">
              DAILY FRESH PICKS • BESTSELLERS
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 mt-1">
              Popular Fresh Cuts
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              Our customers' favorite fresh meat cuts and daily top-selling selections
            </p>
          </div>
          <Link
            to="/shop"
            className="mt-3 sm:mt-0 text-sm font-bold text-primary hover:text-primary-hover flex items-center gap-1 group"
          >
            View All Meats
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
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
        ) : !loading && (
          <div className="py-12 text-center bg-stone-50 rounded-2xl border border-stone-200 p-8 max-w-xl mx-auto">
            <p className="text-stone-700 font-bold text-base">Fresh cuts coming soon!</p>
            <p className="text-xs text-stone-500 mt-1">Our master butchers are preparing fresh cuts daily. Check back shortly or browse our shop.</p>
          </div>
        )}

        {/* View All Button */}
        <div className="flex justify-center mt-12 md:mt-16">
          <Link
            to="/shop"
            className="bg-primary hover:bg-primary-hover text-white font-bold text-sm uppercase tracking-wider px-9 py-4 rounded-xl transition-all shadow-lg shadow-primary/25 cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <UtensilsCrossed className="w-4 h-4" />
            Explore Full Meat Catalog
          </Link>
        </div>

      </section>

      {/* 5. BUTCHER HOUSE QUALITY STANDARD */}
      <section className="bg-stone-50 py-16 md:py-24 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-primary font-bold text-xs uppercase tracking-widest bg-red-100 text-red-800 px-3 py-1 rounded-full">
                OUR QUALITY COMMITMENT
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight leading-snug">
                Clean, Fresh & Trusted <br />
                <span className="text-primary">Butcher House</span>
              </h2>
              <p className="text-stone-600 leading-relaxed text-base">
                We prioritize hygiene, health, and unmatched meat quality. All livestock is ethically sourced from certified partner farms, processed daily under sterile sanitary conditions with food-safe tools and chilled temperature-controlled storage.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center font-black text-sm mb-2">
                    01
                  </div>
                  <h4 className="font-bold text-sm text-stone-900">Daily Fresh Cutting</h4>
                  <p className="text-xs text-stone-500 mt-1">Never frozen, never held over. Freshly butchered every morning.</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center font-black text-sm mb-2">
                    02
                  </div>
                  <h4 className="font-bold text-sm text-stone-900">Food-Grade Sealed</h4>
                  <p className="text-xs text-stone-500 mt-1">Hermetically sealed to keep meat protected from dust and contaminants.</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center font-black text-sm mb-2">
                    03
                  </div>
                  <h4 className="font-bold text-sm text-stone-900">Precision Digital Scales</h4>
                  <p className="text-xs text-stone-500 mt-1">Accurate weight guaranteed down to the exact gram on calibrated scales.</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-primary flex items-center justify-center font-black text-sm mb-2">
                    04
                  </div>
                  <h4 className="font-bold text-sm text-stone-900">Chilled Express Delivery</h4>
                  <p className="text-xs text-stone-500 mt-1">Transported in insulated chillers to maintain peak kitchen freshness.</p>
                </div>
              </div>
            </div>

            {/* Right: Authentic Sizzling / Fresh Cutting Photography Showcase */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3]">
                <img
                  src="/images/cat_steaks.jpg"
                  alt="Prime Cuts artisanal butchered meats"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="inline-block bg-primary text-white text-[11px] font-bold px-2.5 py-1 rounded mb-2 uppercase tracking-wide">
                    Hygienic Process Certified
                  </div>
                  <h3 className="text-xl font-black">
                    Sterile, Temperature-Controlled Butchery
                  </h3>
                  <p className="text-xs text-stone-300 mt-1">
                    Lekhnath-30, Pokhara • Hotline: +977 9865311559
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. ORDERING PROCESS - CLEAN MINIMALIST TIMELINE */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-primary font-bold text-xs uppercase tracking-widest">
              SIMPLE 5 STEPS • HOW IT WORKS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
              How to Order
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              Order your favorite fresh meat cuts delivered to your doorstep in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { num: "01", title: "Choose Your Cut", desc: "Select chicken, goat, buff, pork, sausages, or prime steaks." },
              { num: "02", title: "Select Weight", desc: "Pick 250g, 500g, 1kg, or type in your custom gram weight." },
              { num: "03", title: "Add to Cart", desc: "Review your cart items and proceed directly to checkout." },
              { num: "04", title: "Enter Address", desc: "Provide your name, phone number, and delivery location pin." },
              { num: "05", title: "Doorstep Delivery", desc: "Receive fresh, cold, hygienically packed meat quickly." },
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-stone-50 p-5 rounded-2xl border border-stone-200 hover:border-primary hover:bg-white transition-all text-left"
              >
                <div className="text-2xl font-black text-primary mb-3">
                  {step.num}
                </div>
                <h4 className="font-bold text-base text-stone-900 mb-1">
                  {step.title}
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
