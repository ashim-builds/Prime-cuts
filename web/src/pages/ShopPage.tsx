import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ShopFilters from "../components/ShopFilters";
import ScrollAnimation from "../components/ScrollAnimation";
import { Product, Category } from "@/types/types";

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || undefined;
  const queryParam = searchParams.get("q") || undefined;
  const sortParam = searchParams.get("sort") || "popular";

  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (categoryParam) queryParams.set("category", categoryParam);
        if (queryParam) queryParams.set("q", queryParam);

        const [prodRes, allProdRes, catRes] = await Promise.all([
          fetch(`/api/products?${queryParams.toString()}`),
          fetch(`/api/products`),
          fetch(`/api/products/categories`),
        ]);

        const [prodData, allProdData, catData] = await Promise.all([
          prodRes.json(),
          allProdRes.json(),
          catRes.json(),
        ]);

        let fetchedProducts = prodData.products || [];
        if (sortParam === "price-asc") {
          fetchedProducts.sort(
            (a: Product, b: Product) =>
              (a.pricePerKg ?? 0) - (b.pricePerKg ?? 0),
          );
        } else if (sortParam === "price-desc") {
          fetchedProducts.sort(
            (a: Product, b: Product) =>
              (b.pricePerKg ?? 0) - (a.pricePerKg ?? 0),
          );
        } else if (sortParam === "name-asc") {
          fetchedProducts.sort((a: Product, b: Product) =>
            a.name.localeCompare(b.name),
          );
        }

        setProducts(fetchedProducts);
        setAllProducts(allProdData.products || []);
        setCategories(catData.categories || []);
      } catch (err) {
        console.error("Failed to load shop products", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [categoryParam, queryParam, sortParam]);

  return (
    <div className="bg-white min-h-screen pt-8 md:pt-12 pb-20 w-full relative z-10 flex-grow flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Page Header */}
        <ScrollAnimation className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-[#111111] uppercase tracking-tight mb-1">
                Fresh Meat Catalog
              </h1>
              <p className="text-[13px] text-stone-500 font-medium">
                Home / Shop / Fresh Meats
              </p>
            </div>
          </div>
        </ScrollAnimation>

        {/* Filters */}
        <ScrollAnimation delay={0.1}>
          <ShopFilters categories={categories} allProducts={allProducts} />
        </ScrollAnimation>

        {/* Product Grid */}
        <ScrollAnimation delay={0.2}>
          {loading ? (
            <div className="py-20 text-center text-stone-400 font-medium">
              Loading fresh meats...
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 bg-transparent">
              {products.map((product) => (
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
            <div className="text-center py-20 bg-stone-50 rounded-2xl border border-stone-200 p-8">
              <h3 className="text-xl font-bold text-stone-900 mb-2">
                No meat cuts available
              </h3>
              <p className="text-stone-500 max-w-md mx-auto text-sm">
                No meat cuts match the selected criteria. Items added by the
                store administrator will appear here.
              </p>
            </div>
          )}
        </ScrollAnimation>
      </div>
    </div>
  );
}
