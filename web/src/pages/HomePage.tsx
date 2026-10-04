import React, { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Truck,
  Star,
  Award,
  MapPin,
  Scale,
  ShoppingCart,
  ShoppingBag,
  ClipboardList,
  Bike,
  Phone,
  Search,
  X,
  ChevronDown,
  Sparkles,
  Flame,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import ShopShowcaseSection from "../components/ShopShowcaseSection";
import { Product, Category } from "@/types/types";

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialQuery = searchParams.get("q") || "";
  const initialSort = searchParams.get("sort") || "popular";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortOption, setSortOption] = useState<string>(initialSort);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<{ name: string; slug: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const sortOptions = [
    { value: "popular", label: "Popular Cuts" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A to Z" },
  ];

  // Synchronize state with URL parameters if changed externally
  useEffect(() => {
    if (searchParams.has("category")) {
      setSelectedCategory(searchParams.get("category") || "");
    }
    if (searchParams.has("q")) {
      setSearchQuery(searchParams.get("q") || "");
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/products/categories"),
        ]);

        const [prodData, catData] = await Promise.all([
          prodRes.json(),
          catRes.json(),
        ]);

        if (isMounted) {
          if (prodData.success && Array.isArray(prodData.products)) {
            setProducts(prodData.products);
          }
          if (catData.success && Array.isArray(catData.categories)) {
            setCategories(catData.categories);
          }
        }
      } catch (err) {
        console.error("Failed to load products or categories on home page", err);
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

  // Close suggestions and sort dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim().length > 0) {
      const matched = products.filter((p) =>
        p.name.toLowerCase().includes(val.toLowerCase()) ||
        p.category?.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(matched.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    const newParams = new URLSearchParams(searchParams);
    if (categoryName) {
      newParams.set("category", categoryName);
    } else {
      newParams.delete("category");
    }
    setSearchParams(newParams, { replace: true });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("q");
    setSearchParams(newParams, { replace: true });
  };

  // Filter and Sort Products
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      !selectedCategory ||
      product.category?.toLowerCase() === selectedCategory.toLowerCase();

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      product.name?.toLowerCase().includes(q) ||
      product.category?.toLowerCase().includes(q) ||
      product.description?.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "price-asc") {
      return (a.pricePerKg ?? 0) - (b.pricePerKg ?? 0);
    }
    if (sortOption === "price-desc") {
      return (b.pricePerKg ?? 0) - (a.pricePerKg ?? 0);
    }
    if (sortOption === "name-asc") {
      return a.name.localeCompare(b.name);
    }
    // "popular": featured first, then available, then ID
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return 0;
  });

  const currentSortLabel =
    sortOptions.find((o) => o.value === sortOption)?.label || "Popular Cuts";

  return (
    <div className="flex flex-col bg-white">
      {/* 1. HERO SECTION - IMMERSIVE ARTISANAL BUTCHER SHOWCASE */}
      <section className="relative min-h-[160px] sm:min-h-[360px] lg:min-h-[545px] bg-black text-white overflow-hidden flex items-center mx-3 sm:mx-0 mt-2 sm:mt-0 rounded-2xl sm:rounded-none shadow-xl">
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-9 lg:py-11 w-full">
          <div className="max-w-2xl flex flex-col items-start text-left">
            {/* Location Tag */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] sm:text-xs font-semibold text-stone-200 mb-2 sm:mb-2.5">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
              <span>Khudi Chowk, Pokhara-30</span>
            </div>

            {/* Main Headline (Desktop: Full rich | Mobile: Minimal) */}
            <h1 className="text-xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] mb-2 sm:mb-3 text-white">
              <span className="sm:hidden">
                Fresh Meat <br />
                <span className="text-primary">Cut Daily to Your Order</span>
              </span>
              <span className="hidden sm:inline">
                Fresh, Clean & Delicious Meat <br />
                <span className="text-primary">Cut Daily to Your Order</span>
              </span>
            </h1>

            {/* Subheading (Desktop: Full detailed | Mobile: Minimal) */}
            <p className="sm:hidden text-xs text-stone-300 mb-3.5 max-w-lg font-normal leading-relaxed">
              100% hygienic goat, chicken, buff & sausages cleanly prepped and delivered fresh.
            </p>
            <p className="hidden sm:block text-sm md:text-base text-stone-200 mb-6 max-w-xl font-normal leading-relaxed">
              Locally sourced castrated goat (khasi), boka, giriraj local chicken, broiler, fresh eggs, sausages, and momos cleanly prepped with uncompromised quality.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <a
                href="#shop-cuts"
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all text-xs sm:text-sm tracking-wide inline-flex items-center gap-1.5 cursor-pointer active:scale-95 group shadow-md shadow-primary/20"
              >
                <span>Order Now</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <a
                href="tel:9714324919"
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold rounded-xl transition-colors text-xs sm:text-sm inline-flex items-center gap-1.5 border border-white/20"
              >
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span className="sm:hidden">Call Us</span>
                <span className="hidden sm:inline">Call 9714324919</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST COMMITMENT / FEATURES BAR - DESKTOP ONLY */}
      <section className="hidden sm:block bg-[#0d0d0d] border border-[#1f1f1f] sm:border-x-0 sm:rounded-none sm:mx-0 sm:mt-0 py-4 sm:py-5 relative z-10 text-white shadow-xl overflow-hidden">
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

      {/* 3. COMPLETE MEAT CATALOG WITH SEARCH & FILTERS ON HOME PAGE */}
      <section
        id="shop-cuts"
        className="py-8 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-20"
      >
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-primary bg-red-50 px-2.5 py-0.5 rounded-md border border-red-100">
                Fresh Cuts & Meats
              </span>
              <span className="text-stone-400 text-xs font-semibold">
                ({sortedProducts.length} items available)
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 tracking-tight mt-1">
              Our Fresh Meat Catalog
            </h2>
          </div>
        </div>

        {/* 🔍 SEARCH BAR & LIVE AUTOCOMPLETE */}
        <div className="space-y-4 mb-6 sm:mb-8">
          <div className="relative w-full" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search fresh cuts (chicken, mutton, buff, pork, sausages...)"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim().length > 0 && suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                className="w-full bg-stone-50 hover:bg-stone-100/70 focus:bg-white text-stone-900 placeholder-stone-400 pl-11 sm:pl-12 pr-10 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary border border-stone-200 shadow-xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Autocomplete Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs sm:text-sm animate-in fade-in">
                {suggestions.map((suggestion) => (
                  <Link
                    key={suggestion.slug}
                    to={`/product/${suggestion.slug}`}
                    className="flex items-center justify-between px-4 py-3 text-stone-800 font-bold hover:bg-stone-50 border-b border-stone-100 last:border-0 transition-colors"
                    onClick={() => setShowSuggestions(false)}
                  >
                    <div className="flex items-center gap-2.5">
                      <Search className="w-4 h-4 text-primary" />
                      <span>{suggestion.name}</span>
                    </div>
                    <span className="text-[11px] text-stone-400 font-medium">View Cut →</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 🏷️ HORIZONTAL CATEGORY PILLS & SORT DROPDOWN */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Category Filter Pills (Smooth Horizontal Scroll on Mobile & Desktop) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar flex-nowrap scroll-smooth touch-pan-x">
              <button
                type="button"
                onClick={() => handleCategorySelect("")}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 whitespace-nowrap cursor-pointer select-none active:scale-95 ${
                  selectedCategory === ""
                    ? "bg-primary border-primary text-white shadow-md shadow-primary/25"
                    : "bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-100"
                }`}
              >
                All Meats ({products.length})
              </button>

              {categories.map((cat) => {
                const catName = typeof cat === "string" ? cat : cat.name;
                const isSelected =
                  selectedCategory.toLowerCase() === catName.toLowerCase();
                const count = products.filter(
                  (p) => p.category?.toLowerCase() === catName.toLowerCase()
                ).length;

                return (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => handleCategorySelect(catName)}
                    className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 whitespace-nowrap cursor-pointer select-none active:scale-95 ${
                      isSelected
                        ? "bg-primary border-primary text-white shadow-md shadow-primary/25"
                        : "bg-stone-50 border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-100"
                    }`}
                  >
                    {catName} {count > 0 && `(${count})`}
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0 self-end sm:self-auto" ref={sortRef}>
              <button
                type="button"
                onClick={() => setShowSortDropdown((prev) => !prev)}
                className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-bold text-stone-700 hover:border-stone-300 transition-colors shadow-2xs cursor-pointer"
              >
                <span>Sort: {currentSortLabel}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 ${
                    showSortDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 overflow-hidden min-w-[190px] animate-in fade-in">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortOption(opt.value);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                        sortOption === opt.value
                          ? "bg-primary text-white"
                          : "text-stone-700 hover:bg-stone-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🥩 ALL PRODUCTS GRID */}
        {loading ? (
          <div className="py-20 text-center text-stone-400 font-medium">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading fresh meat cuts...
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
            {sortedProducts.map((product) => (
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
          <div className="text-center py-16 bg-stone-50 rounded-3xl border border-stone-200 p-8 max-w-lg mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-200/80 text-stone-500 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-stone-900">
              No meat cuts found
            </h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              {searchQuery || selectedCategory
                ? "No items match your search or filter. Try clearing filters to see all available meat cuts."
                : "Our butchers are currently updating the catalog. Please check back shortly!"}
            </p>
            {(searchQuery || selectedCategory) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("");
                  setSearchQuery("");
                }}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:bg-primary-hover transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}
      </section>

      {/* 4. AUTHENTIC SHOP SHOWCASE & INFORMATION SECTION */}
      <ShopShowcaseSection />

      {/* 5. HOW IT WORKS - RED, WHITE & BLACK THEME */}
      <section className="bg-[#fbf9f5] pt-4 sm:pt-6">
        <div className="bg-[#121214] rounded-t-[2rem] sm:rounded-t-[2.5rem] border-t border-[#24242a] text-white py-8 sm:py-16 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* ==================== MOBILE VIEW (Ultra Compact 5-Step Flow) ==================== */}
            <div className="sm:hidden text-center">
              <span className="text-primary font-bold text-[10px] uppercase tracking-widest block mb-0.5">
                HOW TO ORDER
              </span>
              <h2 className="text-sm font-black uppercase tracking-tight text-white mb-3">
                Order Favourites By Weight
              </h2>

              {/* 5 Compact Steps in Single Line / Grid */}
              <div className="grid grid-cols-5 gap-1 items-start">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center mb-1 border border-white/10">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-bold text-[9px] text-stone-300 leading-tight text-center">
                    Product
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center mb-1 border border-white/10">
                    <Scale className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-bold text-[9px] text-stone-300 leading-tight text-center">
                    Weight
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center mb-1 border border-white/10">
                    <ShoppingCart className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-bold text-[9px] text-stone-300 leading-tight text-center">
                    Add Cart
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center mb-1 border border-white/10">
                    <ClipboardList className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-bold text-[9px] text-stone-300 leading-tight text-center">
                    Order
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center mb-1 border border-white/10">
                    <Bike className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-bold text-[9px] text-stone-300 leading-tight text-center">
                    Deliver
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
