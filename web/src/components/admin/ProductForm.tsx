import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Loader2,
  ArrowLeft,
  Upload,
  AlertCircle,
  X,
  Check,
  Package,
  Trash2,
  Banknote,
  Scale,
  Plus,
  Box,
  Image as ImageIcon,
} from "lucide-react";
import { Product, Variant } from "@/types/types";

interface ProductFormProps {
  product?: Product;
  initialData?: any;
  isEdit?: boolean;
}

const STANDARD_WEIGHT_OPTIONS = [
  { value: 250, unit: "g" },
  { value: 500, unit: "g" },
  { value: 750, unit: "g" },
  { value: 1, unit: "kg" },
  { value: 2, unit: "kg" },
];

export default function ProductForm({ product, initialData, isEdit }: ProductFormProps) {
  const currentProduct = product || initialData;
  const isEditMode = isEdit !== undefined ? isEdit : !!currentProduct;
  const productId = currentProduct?.id || currentProduct?._id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

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

  useEffect(() => {
    fetch("/api/admin/categories", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
          setFormData((prev) => {
            if (!prev.category) {
              return { ...prev, category: data.categories[0].name };
            }
            return prev;
          });
        }
      })
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  const [formData, setFormData] = useState({
    name: currentProduct?.name || "",
    slug: currentProduct?.slug || "",
    description: currentProduct?.description || "",
    category: currentProduct?.category || "",
    priceType: (currentProduct?.priceType || currentProduct?.price_type || (currentProduct?.variants?.length ? "variant" : "weight")) as "weight" | "variant",
    pricePerKg: currentProduct?.pricePerKg
      ? String(currentProduct.pricePerKg)
      : currentProduct?.price_per_kg
      ? String(currentProduct.price_per_kg)
      : "",
    allowCustomWeight: currentProduct ? (currentProduct.allowCustomWeight ?? true) : true,
    variants: (currentProduct?.variants || []) as Variant[],
    existingImage: currentProduct?.image || "",
    existingImages: currentProduct?.images || [],
    isAvailable: currentProduct ? (currentProduct.available ?? currentProduct.isAvailable ?? true) : true,
    isFeatured: currentProduct ? (currentProduct.featured ?? currentProduct.isFeatured ?? false) : false,
  });

  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantPrice, setNewVariantPrice] = useState("");

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
        priceType: (currentProduct.priceType || currentProduct.price_type || (currentProduct.variants?.length ? "variant" : "weight")) as "weight" | "variant",
        pricePerKg: currentProduct.pricePerKg
          ? String(currentProduct.pricePerKg)
          : currentProduct.price_per_kg
          ? String(currentProduct.price_per_kg)
          : "",
        allowCustomWeight: currentProduct.allowCustomWeight ?? true,
        variants: currentProduct.variants || [],
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

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (!isEdit && name === "name") {
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
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

  const removeCoverImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, existingImage: "" }));
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setGalleryFiles((prev) => [...prev, ...newFiles]);
      const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      existingImages: (prev.existingImages || []).filter((_: any, i: number) => i !== index),
    }));
  };

  const numericPricePerKg = parseFloat(formData.pricePerKg) || 0;

  const addVariant = () => {
    if (!newVariantName.trim()) {
      setError("Please enter a quantity name (e.g. 1 Crate (30 pcs) or 1 Plate).");
      return;
    }
    const p = parseFloat(newVariantPrice);
    if (isNaN(p) || p <= 0) {
      setError("Please enter a valid price greater than 0.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: newVariantName.trim(), price: p }],
    }));
    setNewVariantName("");
    setNewVariantPrice("");
    setError("");
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const addPresetVariant = (name: string, price: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { name, price }],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Please enter the product name.");
      return;
    }
    if (!formData.category.trim()) {
      setError("Please select a category.");
      return;
    }
    if (!formData.slug.trim()) {
      setError("Please provide a valid slug.");
      return;
    }

    if (formData.priceType === "weight") {
      if (!formData.pricePerKg || numericPricePerKg <= 0) {
        setError("Please enter a valid price for 1 kg (greater than 0).");
        return;
      }
    } else {
      if (!formData.variants || formData.variants.length === 0) {
        setError("Please add at least one quantity option (e.g. 1 Crate, 1 Plate, 1 Pack).");
        return;
      }
    }

    setLoading(true);

    try {
      let uploadedImageUrl = formData.existingImage || "";
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("file", imageFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          credentials: "include",
          body: uploadData,
        });
        const uploadJson = await uploadRes.json();
        if (!uploadJson.success) throw new Error(uploadJson.error || "Image upload failed");
        uploadedImageUrl = uploadJson.url;
      }

      const uploadedGalleryUrls: string[] = [...(formData.existingImages || [])];
      for (const file of galleryFiles) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          credentials: "include",
          body: uploadData,
        });
        const uploadJson = await uploadRes.json();
        if (uploadJson.success && uploadJson.url) {
          uploadedGalleryUrls.push(uploadJson.url);
        }
      }

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        priceType: formData.priceType,
        pricePerKg: formData.priceType === "weight" ? numericPricePerKg : null,
        weightOptions: formData.priceType === "weight" ? STANDARD_WEIGHT_OPTIONS : [],
        allowCustomWeight: formData.priceType === "weight" ? formData.allowCustomWeight : false,
        variants: formData.priceType === "variant" ? formData.variants : [],
        image: uploadedImageUrl || null,
        images: uploadedGalleryUrls,
        isAvailable: formData.isAvailable,
        available: formData.isAvailable,
        isFeatured: formData.isFeatured,
        featured: formData.isFeatured,
      };

      const endpoint = isEditMode && productId ? `/api/admin/products/${productId}` : "/api/admin/products";
      const method = isEditMode && productId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to save product.");
      }

      setSuccess(isEditMode ? "Product updated successfully!" : "Product created successfully!");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/admin/products"
          className="p-2 bg-white rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-5 h-5 text-stone-700" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            Fill details and save product to store
          </p>
        </div>
      </div>

      {/* Toast Feedback */}
      {success && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-md animate-fade-in">
          <div className="bg-emerald-600 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3">
            <Check className="w-5 h-5 shrink-0 stroke-[3]" />
            <p className="flex-1 text-sm font-bold">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-md animate-fade-in">
          <div className="bg-red-600 text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="flex-1 text-sm font-bold leading-snug">{error}</p>
            <button onClick={() => setError("")} className="p-1 hover:bg-red-500 rounded-lg cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* UNIFIED FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* SECTION 1: BASIC INFO */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-primary" />
            <span>1. Product Details</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Product Name <span className="text-primary">*</span>
            </label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Fresh Goat Meat (Curry Cut) or Buff Steam Momo"
              className="w-full text-stone-900 font-bold px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-primary focus:bg-white focus:outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Category <span className="text-primary">*</span>
              </label>
              <select
                required
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full text-stone-900 font-bold px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:border-primary focus:bg-white focus:outline-none text-sm cursor-pointer"
              >
                <option value="" disabled>-- Select Category --</option>
                {categories.map((cat) => (
                  <option key={cat.id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                URL Slug <span className="text-stone-400 font-normal">(Auto)</span>
              </label>
              <input
                required
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="product-slug"
                className="w-full text-stone-600 font-semibold px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Description <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full text-stone-900 font-medium px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:border-primary focus:bg-white focus:outline-none text-xs leading-relaxed"
              placeholder="Fresh and clean cuts, hygienically prepared..."
            />
          </div>
        </div>

        {/* SECTION 2: PRICING & SELLING TYPE */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
            <Banknote className="w-4 h-4 text-primary" />
            <span>2. Pricing & Selling Units</span>
          </h2>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, priceType: "weight" }))}
              className={`p-2.5 sm:p-3 rounded-xl border-2 transition-all flex items-center gap-2 text-left cursor-pointer ${
                formData.priceType === "weight"
                  ? "bg-red-50/80 border-primary text-primary"
                  : "bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300"
              }`}
            >
              <Scale className="w-4 h-4 shrink-0" />
              <div>
                <p className="text-xs font-black leading-tight">By Weight (kg/g)</p>
                <p className="text-[10px] text-stone-500 font-medium hidden sm:block">Meat cuts (Chicken, Goat, Buff)</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, priceType: "variant" }))}
              className={`p-2.5 sm:p-3 rounded-xl border-2 transition-all flex items-center gap-2 text-left cursor-pointer ${
                formData.priceType === "variant"
                  ? "bg-red-50/80 border-primary text-primary"
                  : "bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300"
              }`}
            >
              <Box className="w-4 h-4 shrink-0" />
              <div>
                <p className="text-xs font-black leading-tight">By Pack / Quantity</p>
                <p className="text-[10px] text-stone-500 font-medium hidden sm:block">Eggs, Momos, Sausages</p>
              </div>
            </button>
          </div>

          {/* Pricing Content */}
          {formData.priceType === "weight" ? (
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Price for 1 Kilogram (Rs.) <span className="text-primary">*</span>
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-black text-sm">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    name="pricePerKg"
                    value={formData.pricePerKg}
                    onChange={handleChange}
                    placeholder="800"
                    className="w-full text-stone-900 font-black text-lg pl-11 pr-14 py-2 bg-stone-50 border border-stone-200 focus:border-primary focus:bg-white rounded-xl focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs uppercase">
                    / 1 kg
                  </span>
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-xs font-bold text-stone-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  name="allowCustomWeight"
                  checked={formData.allowCustomWeight}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary rounded border-stone-300 focus:ring-primary cursor-pointer"
                />
                <span>Allow customers to select custom grams (e.g. 350g, 1.2kg)</span>
              </label>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {/* Add Variant Form */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newVariantName}
                  onChange={(e) => setNewVariantName(e.target.value)}
                  placeholder="e.g. 1 Crate (30 pcs) or 1 Plate (10 pcs)"
                  className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-primary"
                />
                <div className="relative w-full sm:w-28">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={newVariantPrice}
                    onChange={(e) => setNewVariantPrice(e.target.value)}
                    placeholder="Price"
                    className="w-full pl-8 pr-2 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-black text-stone-900 focus:outline-none focus:border-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1">
                {[
                  { name: "1 Crate (30 Eggs)", price: 480 },
                  { name: "1 Dozen (12 Eggs)", price: 200 },
                  { name: "1 Plate Momo (10 pcs)", price: 150 },
                  { name: "Frozen Pack (20 pcs)", price: 280 },
                  { name: "1 Packet (500g)", price: 350 },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addPresetVariant(preset.name, preset.price)}
                    className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-[10px] rounded-md transition-colors cursor-pointer"
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>

              {/* Variant List */}
              {formData.variants.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {formData.variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs"
                    >
                      <span className="font-bold text-stone-900">{v.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-primary">Rs. {v.price}</span>
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 3: PRODUCT PHOTO & AVAILABILITY */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-primary" />
            <span>3. Image & Stock</span>
          </h2>

          <div className="flex items-center gap-3">
            <label className="flex items-center justify-center px-4 py-2.5 border-2 border-dashed border-stone-200 hover:border-stone-400 rounded-xl cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors gap-2 text-xs font-bold text-stone-700 flex-1">
              <Upload className="w-4 h-4 text-stone-400" />
              <span>{imagePreview ? "Change Photo" : "Upload Photo"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>

            {imagePreview && (
              <div className="w-12 h-12 relative rounded-xl border border-stone-200 overflow-hidden shrink-0 group">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Remove Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Stock toggle */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-stone-900 block">Stock Availability</span>
              <span className="text-[10px] text-stone-500 font-medium">
                {formData.isAvailable ? "Available for ordering" : "Marked as Sold Out"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, isAvailable: !prev.isAvailable }))}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                formData.isAvailable
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                  : "bg-red-50 text-red-700 border border-red-300"
              }`}
            >
              {formData.isAvailable ? "✓ In Stock" : "✕ Out of Stock"}
            </button>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-primary text-white font-black text-sm uppercase tracking-wider rounded-2xl hover:bg-primary/90 active:scale-98 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Product...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isEditMode ? "Save Changes" : "Create Product"}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
