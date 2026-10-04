import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import WeightSelector from "../components/WeightSelector";
import ScrollAnimation from "../components/ScrollAnimation";
import ProductGallery from "../components/ProductGallery";
import { Product } from "@/types/types";

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
        <Link to="/" className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover shadow-md shadow-primary/20">
          Back to Fresh Meat Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-3 sm:pt-8 md:pt-12 pb-24 md:pb-20 w-full relative z-10 flex-grow flex flex-col">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 w-full">
        
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-stone-500 hover:text-primary mb-3 sm:mb-6 transition-colors font-bold text-xs sm:text-sm bg-stone-50 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-xl sm:rounded-none border border-stone-200 sm:border-0 w-fit"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 -ml-1 sm:mr-1" />
          <span>Back to All Cuts</span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-10 lg:gap-14">
          
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
            <ScrollAnimation delay={0.05}>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-red-50 border border-red-200/80 text-primary text-[10px] sm:text-xs font-black uppercase tracking-wider w-fit mb-2 sm:mb-3">
                <span>{product.category}</span>
              </div>

              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-stone-950 leading-tight mb-1.5 sm:mb-3 tracking-tight">
                {product.name}
              </h1>
              
              <div className="text-xl sm:text-3xl font-black text-primary mb-2 sm:mb-3 flex items-baseline gap-1.5">
                {product.priceType === 'weight' ? (
                  <>Rs. {product.pricePerKg} <span className="text-stone-400 text-xs sm:text-base font-semibold">/ 1 kg</span></>
                ) : (
                  <>Rs. {product.variants?.[0]?.price} <span className="text-stone-400 text-xs sm:text-base font-semibold">onwards</span></>
                )}
              </div>

              {product.description && (
                <p className="text-stone-600 text-xs sm:text-sm md:text-base leading-relaxed mb-3 sm:mb-5">
                  {product.description}
                </p>
              )}
            </ScrollAnimation>

            {/* Weight Selector & Add to Cart */}
            <ScrollAnimation delay={0.1} className="mt-0 sm:mt-1">
              <WeightSelector 
                product={product} 
                isAvailable={product.isAvailable ?? product.available ?? true} 
              />
            </ScrollAnimation>
          </div>
          
        </div>
      </div>
    </div>
  );
}
