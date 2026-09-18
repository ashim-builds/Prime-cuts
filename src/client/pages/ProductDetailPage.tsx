import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import WeightSelector from "../components/WeightSelector";
import ScrollAnimation from "../components/ScrollAnimation";
import ProductGallery from "../components/ProductGallery";
import { Product } from "../../shared/types";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Failed to load product", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-stone-400 font-medium">Loading fresh meat cut details...</div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-black mb-2">Product Not Found</h2>
        <p className="text-stone-500 mb-6">The meat cut you are looking for does not exist or is currently unavailable.</p>
        <Link to="/shop" className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover shadow-md shadow-primary/20">
          Back to Fresh Meat Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-8 md:pt-12 pb-20 w-full relative z-10 flex-grow flex flex-col">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Back Button */}
        <Link to="/shop" className="inline-flex items-center text-stone-500 hover:text-primary mb-8 transition-colors font-semibold text-sm">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to All Meats
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          
          {/* Left: Image Gallery */}
          <ScrollAnimation>
            <ProductGallery
              images={[product.image, ...(product.images || [])].filter(Boolean)}
              productName={product.name}
              isAvailable={product.isAvailable ?? product.available ?? true}
            />
          </ScrollAnimation>

          {/* Right: Product Details */}
          <div className="flex flex-col">
            <ScrollAnimation delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-primary text-xs font-bold w-fit mb-3">
                <span>{product.category}</span>
              </div>

              <h1 className="text-[28px] md:text-4xl lg:text-5xl font-black text-[#111111] leading-tight mb-3">
                {product.name}
              </h1>
              
              <div className="text-[22px] md:text-3xl font-black text-primary mb-5 flex items-end gap-1.5">
                {product.priceType === 'weight' ? (
                  <>Rs. {product.pricePerKg} <span className="text-stone-500 text-base md:text-lg font-medium mb-[2px]">/ kg</span></>
                ) : (
                  <>Rs. {product.variants?.[0]?.price} <span className="text-stone-500 text-base md:text-lg font-medium mb-[2px]">onwards</span></>
                )}
              </div>

              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="flex items-center text-red-800 text-xs font-bold rounded-full bg-red-50 px-3 py-1.5 border border-red-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary mr-1.5" />
                  Fresh Everyday
                </span>
                <span className="flex items-center text-emerald-800 text-xs font-bold rounded-full bg-emerald-50 px-3 py-1.5 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                  100% Hygienic Cutting
                </span>
                <span className="flex items-center text-stone-700 text-xs font-bold rounded-full bg-stone-100 px-3 py-1.5 border border-stone-200">
                  Farm Sourced
                </span>
              </div>
            </ScrollAnimation>

            {/* Weight Selector & Add to Cart */}
            <ScrollAnimation delay={0.2} className="mt-2">
              <WeightSelector 
                product={product} 
                isAvailable={product.isAvailable ?? product.available ?? true} 
              />
            </ScrollAnimation>
            
            <ScrollAnimation delay={0.3} className="mt-8 pt-6 border-t border-stone-100">
              <h3 className="font-bold text-black mb-3 text-[16px]">Product Details & Specifications</h3>
              <p className="text-stone-600 text-[14px] leading-relaxed mb-6">
                {product.description || "Fresh, high-grade farm-sourced meat cut daily with sterile sanitary care and sealed food-grade packaging."}
              </p>

              <div className="flex flex-col gap-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
                <div className="flex items-start gap-2.5">
                  <span className="font-bold text-black text-sm min-w-[90px]">Cut Type:</span>
                  <p className="text-sm text-stone-600">Daily fresh cut, bone-in or boneless available on request</p>
                </div>
                <div className="flex items-start gap-2.5 border-t border-stone-200/60 pt-2.5">
                  <span className="font-bold text-black text-sm min-w-[90px]">Storage:</span>
                  <p className="text-sm text-stone-600">Keep refrigerated at 0–4°C or cook fresh within 24 hours.</p>
                </div>
                <div className="flex items-start gap-2.5 border-t border-stone-200/60 pt-2.5">
                  <span className="font-bold text-black text-sm min-w-[90px]">Packaging:</span>
                  <p className="text-sm text-stone-600">Hermetically sealed food-grade hygienic packaging.</p>
                </div>
              </div>
            </ScrollAnimation>
          </div>
          
        </div>
      </div>
    </div>
  );
}
