import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, ArrowLeft, Upload, Plus, Trash2, AlertCircle, X } from "lucide-react";
import { Product } from "../../../shared/types";

interface ProductFormProps {
  product?: Product;
  initialData?: any;
  isEdit?: boolean;
}

export default function ProductForm({ product, initialData, isEdit }: ProductFormProps) {
  const currentProduct = product || initialData;
  const isEditMode = isEdit !== undefined ? isEdit : !!currentProduct;
  const productId = currentProduct?.id || currentProduct?._id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 6000);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => navigate("/admin/products"), 1500);
    return () => clearTimeout(t);
  }, [success, navigate]);

  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
          setFormData(prev => {
            if (!prev.category) {
              return { ...prev, category: data.categories[0].name };
            }
            return prev;
          });
        }
      })
      .catch(err => console.error("Failed to load categories:", err));
  }, []);

  const [formData, setFormData] = useState({
    name: currentProduct?.name || "",
    slug: currentProduct?.slug || "",
    description: currentProduct?.description || "",
    category: currentProduct?.category || "",
    priceType: currentProduct?.priceType || "weight",
    pricePerKg: currentProduct?.pricePerKg ? String(currentProduct.pricePerKg) : "",
    variants: currentProduct?.variants || [],
    weightOptions: currentProduct?.weightOptions || [
      { value: 250, unit: "g" },
      { value: 500, unit: "g" },
      { value: 750, unit: "g" },
      { value: 1, unit: "kg" },
      { value: 2, unit: "kg" }
    ],
    allowCustomWeight: currentProduct ? (currentProduct.allowCustomWeight ?? true) : true,
    existingImage: currentProduct?.image || "",
    existingImages: currentProduct?.images || [],
    isAvailable: currentProduct ? (currentProduct.available ?? currentProduct.isAvailable ?? true) : true,
    isFeatured: currentProduct ? (currentProduct.featured ?? currentProduct.isFeatured ?? false) : false,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(currentProduct?.image || null);
  
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(currentProduct?.images || []);

  useEffect(() => {
    if (currentProduct) {
      setFormData({
        name: currentProduct.name || "",
        slug: currentProduct.slug || "",
        description: currentProduct.description || "",
        category: currentProduct.category || "Chicken",
        priceType: currentProduct.priceType || "weight",
        pricePerKg: currentProduct.pricePerKg ? String(currentProduct.pricePerKg) : "",
        variants: currentProduct.variants || [],
        weightOptions: currentProduct.weightOptions || [
          { value: 250, unit: "g" },
          { value: 500, unit: "g" },
          { value: 750, unit: "g" },
          { value: 1, unit: "kg" },
          { value: 2, unit: "kg" }
        ],
        allowCustomWeight: currentProduct.allowCustomWeight ?? true,
        existingImage: currentProduct.image || "",
        existingImages: currentProduct.images || [],
        isAvailable: currentProduct.available ?? currentProduct.isAvailable ?? true,
        isFeatured: currentProduct.featured ?? currentProduct.isFeatured ?? false,
      });
      setImagePreview(currentProduct.image || null);
      setGalleryPreviews(currentProduct.images || []);
    }
  }, [currentProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (!isEdit && name === 'name') {
      setFormData(prev => ({ 
        ...prev, 
        name: value, 
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') 
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: "", price: 0 }]
    }));
  };

  const handleVariantChange = (index: number, field: string, value: string | number) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = formData.variants.filter((_: any, i: number) => i !== index);
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const handleAddWeightOption = () => {
    setFormData(prev => ({
      ...prev,
      weightOptions: [...prev.weightOptions, { value: 0, unit: "g" }]
    }));
  };

  const handleWeightOptionChange = (index: number, field: string, value: string | number) => {
    const newOptions = [...formData.weightOptions];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData(prev => ({ ...prev, weightOptions: newOptions }));
  };

  const handleRemoveWeightOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      weightOptions: prev.weightOptions.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (formData.priceType === 'variant' && formData.variants.length === 0) {
        throw new Error("Please add at least one variant or select pricing by weight.");
      }

      // Upload primary image if new file selected
      let uploadedImageUrl = formData.existingImage || "/images/hero_prime_meat.jpg";
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("file", imageFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        const uploadJson = await uploadRes.json();
        if (!uploadJson.success) throw new Error(uploadJson.error || "Image upload failed");
        uploadedImageUrl = uploadJson.url;
      }

      // Upload gallery images if new files selected
      const uploadedGalleryUrls: string[] = [...(formData.existingImages || [])];
      for (const file of galleryFiles) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        const uploadJson = await uploadRes.json();
        if (uploadJson.success && uploadJson.url) {
          uploadedGalleryUrls.push(uploadJson.url);
        }
      }

      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        category: formData.category,
        priceType: formData.priceType,
        pricePerKg: formData.priceType === 'weight' ? Number(formData.pricePerKg) : undefined,
        weightOptions: formData.weightOptions,
        allowCustomWeight: formData.allowCustomWeight,
        variants: formData.variants,
        image: uploadedImageUrl,
        images: uploadedGalleryUrls,
        isAvailable: formData.isAvailable,
        isFeatured: formData.isFeatured,
      };

      const endpoint = isEditMode && productId ? `/api/admin/products/${productId}` : "/api/admin/products";
      const method = isEditMode && productId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to save product.");
      }

      setSuccess(isEditMode ? "Product updated successfully!" : "Product added successfully!");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link to="/admin/products" className="p-2 bg-white rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </Link>
        <h1 className="text-3xl font-black text-stone-900">
          {isEdit ? "Edit Product" : "Add New Product"}
        </h1>
      </div>

      {success && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-lg">
          <div className="bg-green-600 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="flex-1 text-sm font-bold">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-lg">
          <div className="bg-red-600 text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="flex-1 text-sm font-bold leading-snug">{error}</p>
            <button onClick={() => setError("")} className="p-1 hover:bg-red-500 rounded-lg cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-100 space-y-6">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">Product Name</label>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full text-black px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" placeholder="e.g. Fresh Chicken Curry Cut" />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">URL Slug</label>
              <input required name="slug" value={formData.slug} onChange={handleChange} className="w-full text-black px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" placeholder="e.g. fresh-chicken-curry-cut" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Description</label>
            <textarea required name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full text-black px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" placeholder="e.g. Tender and hygienically packed chicken cuts, perfect for curry or gravy..." />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-bold text-stone-700">Category</label>
              <Link to="/admin/categories" className="text-xs text-primary font-bold hover:underline">
                + Manage Categories
              </Link>
            </div>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full text-black px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="" disabled>-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.id || cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-xs text-amber-600 font-semibold mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                No categories found. Please <Link to="/admin/categories" className="underline font-bold">create a category first</Link>.
              </p>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-2">Pricing Structure</h2>
          
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="priceType" value="weight" checked={formData.priceType === 'weight'} onChange={handleChange} className="text-primary focus:ring-primary" />
              <span className="font-bold text-stone-700">By Weight (per Kg)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="priceType" value="variant" checked={formData.priceType === 'variant'} onChange={handleChange} className="text-primary focus:ring-primary" />
              <span className="font-bold text-stone-700">By Variant (Types)</span>
            </label>
          </div>

          {formData.priceType === 'weight' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-1">Price per Kg (Rs.)</label>
                <input required type="number" min="0" name="pricePerKg" value={formData.pricePerKg} onChange={handleChange} className="w-full text-black px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" placeholder="e.g. 500" />
              </div>
              
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-stone-700">Weight Options</label>
                  <button type="button" onClick={handleAddWeightOption} className="text-xs font-bold bg-stone-200 hover:bg-stone-300 text-stone-800 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer">
                    <Plus className="w-3 h-3" /> Add Option
                  </button>
                </div>
                {formData.weightOptions.map((opt: any, index: number) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <input required type="number" min="1" placeholder="Value (e.g. 250)" value={opt.value || ""} onChange={(e) => handleWeightOptionChange(index, "value", Number(e.target.value))} className="w-full text-black px-3 py-2 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-primary text-sm" />
                    </div>
                    <div className="w-32">
                      <select value={opt.unit} onChange={(e) => handleWeightOptionChange(index, "unit", e.target.value)} className="w-full text-black px-3 py-2 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-primary text-sm">
                        <option value="g">g (Grams)</option>
                        <option value="kg">kg (Kilograms)</option>
                      </select>
                    </div>
                    <button type="button" onClick={() => handleRemoveWeightOption(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                
                <div className="pt-2 border-t border-stone-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="allowCustomWeight" checked={formData.allowCustomWeight} onChange={handleChange} className="w-4 h-4 text-primary rounded border-stone-300 focus:ring-primary" />
                    <span className="text-sm font-bold text-stone-700">Allow customers to enter custom weight</span>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-stone-700">Product Variants</label>
                <button type="button" onClick={handleAddVariant} className="text-xs font-bold bg-stone-200 hover:bg-stone-300 text-stone-800 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer">
                  <Plus className="w-3 h-3" /> Add Variant
                </button>
              </div>
              
              {formData.variants.map((variant: any, index: number) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input required placeholder="Variant Name (e.g. Regular)" value={variant.name} onChange={(e) => handleVariantChange(index, "name", e.target.value)} className="w-full text-black px-3 py-2 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-primary text-sm" />
                  </div>
                  <div className="w-32">
                    <input required type="number" min="0" placeholder="Price (Rs)" value={variant.price || ""} onChange={(e) => handleVariantChange(index, "price", Number(e.target.value))} className="w-full text-black px-3 py-2 bg-white border border-stone-300 rounded-md focus:ring-2 focus:ring-primary text-sm" />
                  </div>
                  <button type="button" onClick={() => handleRemoveVariant(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cover Photo */}
        <div className="space-y-6">
          <h2 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-2">Product Images</h2>
          
          <div>
            <p className="text-sm font-bold text-stone-700 mb-2">Cover Photo</p>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-stone-300 border-dashed rounded-xl cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-stone-400" />
                    <p className="text-sm text-stone-500 font-bold"><span className="text-primary">Click to upload</span></p>
                    <p className="text-xs text-stone-400 mt-1">PNG, JPG, WEBP</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
              {imagePreview && (
                <div className="w-32 h-32 relative rounded-xl border-2 border-primary overflow-hidden bg-stone-100 shadow-sm shrink-0">
                  <img src={imagePreview} alt="Cover" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 bg-primary text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Cover</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-2">Status</h2>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} className="w-5 h-5 text-primary rounded border-stone-300 focus:ring-primary" />
              <span className="font-bold text-stone-700">Product is available for purchase</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-5 h-5 text-primary rounded border-stone-300 focus:ring-primary" />
              <span className="font-bold text-stone-700">Feature product on home page</span>
            </label>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-100">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-md cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              isEdit ? "Update Product" : "Create Product"
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
