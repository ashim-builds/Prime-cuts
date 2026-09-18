import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ProductForm from "../../components/admin/ProductForm";

export default function AdminEditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/products/${id}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          setError(data.error || "Product not found");
        }
      } catch (err) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-stone-400 font-medium">
        Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <p className="text-red-500 font-bold">{error || "Product not found"}</p>
        <Link to="/admin/products" className="inline-block px-4 py-2 bg-stone-200 text-stone-700 font-bold rounded-lg">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/products" className="p-2 bg-white rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </Link>
        <h1 className="text-3xl font-black text-stone-900">Edit Product: {product.name}</h1>
      </div>
      <ProductForm initialData={product} isEdit={true} />
    </div>
  );
}
