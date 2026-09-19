import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Upload,
  AlertCircle,
  X,
  Check,
  Package,
  Layers,
  Sparkles,
  Eye,
  Trash2,
  Banknote,
  Flame,
  Image as ImageIcon,
} from "lucide-react";
import { Product } from "@/types/types";

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

  const [currentStep, setCurrentStep] = useState<number>(1);
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
    fetch("/api/admin/categories")
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
    pricePerKg: currentProduct?.pricePerKg
      ? String(currentProduct.pricePerKg)
      : currentProduct?.price_per_kg
      ? String(currentProduct.price_per_kg)
      : "",
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
        pricePerKg: currentProduct.pricePerKg
          ? String(currentProduct.pricePerKg)
          : currentProduct.price_per_kg
          ? String(currentProduct.price_per_kg)
          : "",
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

  // Validation before going to next step
  const validateStep = (step: number): boolean => {
    setError("");
    if (step === 1) {
      if (!formData.name.trim()) {
        setError("Please enter the product cut name.");
        return false;
      }
      if (!formData.category.trim()) {
        setError("Please select a category for this cut.");
        return false;
      }
      if (!formData.slug.trim()) {
        setError("Please provide a valid URL slug.");
        return false;
      }
    } else if (step === 2) {
      if (!formData.pricePerKg || numericPricePerKg <= 0) {
        setError("Please enter a valid price for 1 kg (greater than 0).");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1));
    }
  };

  const prevStep = () => {
    setError("");
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) return;

    setLoading(true);
    setError("");

    try {
      // Upload primary image if new file selected
      let uploadedImageUrl = formData.existingImage || "";
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
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        priceType: "weight",
        pricePerKg: numericPricePerKg,
        weightOptions: STANDARD_WEIGHT_OPTIONS,
        allowCustomWeight: formData.allowCustomWeight,
        variants: [],
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

  const steps = [
    { number: 1, title: "Cut Details", icon: Package, desc: "Name & Category" },
    { number: 2, title: "1 Kg Pricing", icon: Banknote, desc: "Price per 1 kg" },
    { number: 3, title: "Photos", icon: Layers, desc: "Cover & Gallery" },
    { number: 4, title: "Visibility", icon: Sparkles, desc: "Stock & Preview" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Top Navigation & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2.5 bg-white rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {isEdit ? "Edit Meat Cut" : "Add New Meat Cut"}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-stone-500">
              Set 1 kg base price; all other weights calculate automatically
            </p>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {success && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-lg animate-fade-in">
          <div className="bg-emerald-600 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3">
            <Check className="w-5 h-5 shrink-0 stroke-[3]" />
            <p className="flex-1 text-sm font-bold">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-lg animate-fade-in">
          <div className="bg-red-600 text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="flex-1 text-sm font-bold leading-snug">{error}</p>
            <button onClick={() => setError("")} className="p-1 hover:bg-red-500 rounded-lg cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP INDICATOR BAR */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="grid grid-cols-4 gap-2">
          {steps.map((s) => {
            const isCompleted = currentStep > s.number;
            const isActive = currentStep === s.number;

            return (
              <button
                key={s.number}
                type="button"
                onClick={() => {
                  if (s.number < currentStep || validateStep(currentStep)) {
                    setCurrentStep(s.number);
                  }
                }}
                className={`flex flex-col sm:flex-row items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer text-left ${
                  isActive
                    ? "bg-red-50/80 border border-primary/30 shadow-xs"
                    : isCompleted
                    ? "hover:bg-stone-50 text-stone-700"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                    isActive
                      ? "bg-primary text-white shadow-xs"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.number}
                </div>
                <div className="hidden sm:block min-w-0">
                  <p
                    className={`text-xs font-black truncate leading-tight ${
                      isActive ? "text-primary" : "text-stone-900"
                    }`}
                  >
                    {s.title}
                  </p>
                  <p className="text-[10px] text-stone-400 font-medium truncate mt-0.5">{s.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP FORM CONTAINER */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
        {/* STEP 1: CUT DETAILS */}
        {currentStep === 1 && (
          <div className="p-6 sm:p-8 space-y-6 animate-fade-in">
            <div className="border-b border-stone-100 pb-4">
              <span className="text-[11px] font-black tracking-wider uppercase text-primary bg-red-50 px-2.5 py-1 rounded-md">
                Step 1 of 4
              </span>
              <h2 className="text-xl font-black text-stone-900 mt-2">Cut Information</h2>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Enter the cut name, meat category, and butcher description
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                  Cut Name <span className="text-primary">*</span>
                </label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full text-stone-900 font-bold px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white focus:outline-none transition-all text-sm"
                  placeholder="e.g. Fresh Chicken Curry Cut"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                  URL Slug <span className="text-primary">*</span>
                </label>
                <input
                  required
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full text-stone-900 font-bold px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white focus:outline-none transition-all text-sm"
                  placeholder="e.g. fresh-chicken-curry-cut"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-stone-700">
                  Meat Category <span className="text-primary">*</span>
                </label>
                <Link
                  to="/admin/categories"
                  className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                >
                  + Add / Manage Categories
                </Link>
              </div>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full text-stone-900 font-bold px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white focus:outline-none transition-all text-sm cursor-pointer"
              >
                <option value="" disabled>
                  -- Select Meat Category --
                </option>
                {categories.map((cat) => (
                  <option key={cat.id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-1.5">
                Butcher Notes & Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full text-stone-900 font-medium px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-primary focus:bg-white focus:outline-none transition-all text-sm leading-relaxed"
                placeholder="e.g. Tender and hygienically packed chicken cuts, perfect for homestyle curry or gravy..."
              />
            </div>
          </div>
        )}

        {/* STEP 2: 1 KG PRICING */}
        {currentStep === 2 && (
          <div className="p-6 sm:p-8 space-y-6 animate-fade-in">
            <div className="border-b border-stone-100 pb-4">
              <span className="text-[11px] font-black tracking-wider uppercase text-primary bg-red-50 px-2.5 py-1 rounded-md">
                Step 2 of 4
              </span>
              <h2 className="text-xl font-black text-stone-900 mt-2">1 Kg Base Price</h2>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Enter the price for 1 kg. All weights (250g, 500g, 750g, 1kg, 2kg, etc.) divide & calculate automatically.
              </p>
            </div>

            {/* Main 1 kg Price Input */}
            <div className="bg-stone-50/80 p-5 sm:p-6 rounded-2xl border border-stone-200 space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-stone-800">
                Price for 1 Kilogram (Rs.) <span className="text-primary">*</span>
              </label>
              <div className="relative max-w-md">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-black text-base sm:text-lg">
                  Rs.
                </span>
                <input
                  required
                  type="number"
                  min="1"
                  step="any"
                  name="pricePerKg"
                  value={formData.pricePerKg}
                  onChange={handleChange}
                  placeholder="e.g. 800"
                  className="w-full text-stone-900 font-black text-xl sm:text-2xl pl-14 pr-16 py-3.5 bg-white border-2 border-stone-200 focus:border-primary rounded-xl focus:ring-4 focus:ring-primary/10 focus:outline-none shadow-xs transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs uppercase tracking-wider">
                  / 1 kg
                </span>
              </div>
              <p className="text-xs font-medium text-stone-500">
                Customers can select 250g, 500g, 750g, 1kg, 2kg or any custom grams based on this rate.
              </p>
            </div>

            {/* Custom Weight Option */}
            <div className="pt-2 border-t border-stone-100">
              <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="allowCustomWeight"
                  checked={formData.allowCustomWeight}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary rounded border-stone-300 focus:ring-primary cursor-pointer"
                />
                <div>
                  <span className="text-sm font-bold text-stone-800">
                    Allow customers to enter custom weight (e.g. 350g, 1200g)
                  </span>
                  <p className="text-xs text-stone-400 font-medium">
                    Automatically calculates exact price down to the gram
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* STEP 3: CUT PHOTOS */}
        {currentStep === 3 && (
          <div className="p-6 sm:p-8 space-y-6 animate-fade-in">
            <div className="border-b border-stone-100 pb-4">
              <span className="text-[11px] font-black tracking-wider uppercase text-primary bg-red-50 px-2.5 py-1 rounded-md">
                Step 3 of 4
              </span>
              <h2 className="text-xl font-black text-stone-900 mt-2">Cut Images</h2>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Upload photos of the cut (Optional)
              </p>
            </div>

            {/* Cover Photo */}
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-stone-700 mb-2">
                Main Cover Photo (Optional)
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="flex flex-col items-center justify-center w-full sm:w-2/3 h-36 border-2 border-stone-300 border-dashed rounded-2xl cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors p-4">
                  <Upload className="w-7 h-7 text-stone-400 mb-2" />
                  <p className="text-xs font-black text-stone-700">
                    <span className="text-primary">Click to upload cover</span> or drag and drop
                  </p>
                  <p className="text-[10px] text-stone-400 font-medium mt-0.5">PNG, JPG, WEBP up to 5MB</p>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>

                {imagePreview ? (
                  <div className="w-36 h-36 relative rounded-2xl border-2 border-primary overflow-hidden bg-stone-100 shadow-sm shrink-0 group">
                    <img src={imagePreview} alt="Cover Preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded uppercase shadow-xs">
                      Cover
                    </span>
                    <button
                      type="button"
                      onClick={removeCoverImage}
                      className="absolute top-1.5 right-1.5 p-1.5 bg-red-600 text-white rounded-lg opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-sm hover:scale-105"
                      title="Remove Cover Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-36 h-36 rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 bg-stone-50 shrink-0 p-3 text-center">
                    <ImageIcon className="w-8 h-8 text-stone-300 mb-1 stroke-[1.5]" />
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider leading-tight">
                      No Image Uploaded
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Photos */}
            <div className="pt-4 border-t border-stone-100">
              <p className="text-xs font-black uppercase tracking-wider text-stone-700 mb-2">
                Additional Gallery Photos (Optional)
              </p>
              <label className="flex items-center justify-center w-full py-3.5 border-2 border-stone-200 border-dashed rounded-2xl cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors gap-2">
                <Upload className="w-4 h-4 text-stone-400" />
                <span className="text-xs font-bold text-stone-600">Add More Photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleGalleryChange}
                />
              </label>

              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                  {galleryPreviews.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 group">
                      <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: AVAILABILITY & LIVE PREVIEW */}
        {currentStep === 4 && (
          <div className="p-6 sm:p-8 space-y-6 animate-fade-in">
            <div className="border-b border-stone-100 pb-4">
              <span className="text-[11px] font-black tracking-wider uppercase text-primary bg-red-50 px-2.5 py-1 rounded-md">
                Step 4 of 4
              </span>
              <h2 className="text-xl font-black text-stone-900 mt-2">Visibility & Final Review</h2>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Set stock status and preview how your cut will look to customers
              </p>
            </div>

            {/* Status Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Stock Status */}
              <div
                onClick={() => setFormData((prev) => ({ ...prev, isAvailable: !prev.isAvailable }))}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  formData.isAvailable
                    ? "bg-emerald-50/60 border-emerald-300"
                    : "bg-red-50/60 border-red-300"
                }`}
              >
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-stone-500">Stock Availability</p>
                  <p className="text-base font-black text-stone-900 mt-0.5">
                    {formData.isAvailable ? "In Stock (Available)" : "Out of Stock (Sold Out)"}
                  </p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${
                    formData.isAvailable ? "bg-emerald-600" : "bg-red-600"
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </div>

              {/* Featured Status */}
              <div
                onClick={() => setFormData((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  formData.isFeatured
                    ? "bg-red-50/60 border-primary/40"
                    : "bg-stone-50 border-stone-200"
                }`}
              >
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-stone-500">Homepage Showcase</p>
                  <p className="text-base font-black text-stone-900 mt-0.5">
                    {formData.isFeatured ? "★ Featured on Home" : "Standard Listing"}
                  </p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${
                    formData.isFeatured ? "bg-primary" : "bg-stone-300"
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
            </div>

            {/* Live Customer Preview Card */}
            <div className="pt-4 border-t border-stone-100">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-stone-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-700">
                  Live Customer Preview
                </h3>
              </div>

              <div className="max-w-xs mx-auto bg-white rounded-2xl border border-stone-200 p-3 shadow-md">
                <div className="aspect-[4/3] rounded-xl bg-[#141211] overflow-hidden relative mb-3 flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className={`w-full h-full object-cover ${!formData.isAvailable ? "grayscale" : ""}`}
                    />
                  ) : (
                    <div className="w-full h-full relative flex flex-col items-center justify-center bg-gradient-to-br from-[#1c1917] via-[#141211] to-[#0a0a0a] overflow-hidden p-4 text-center select-none">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(204,4,17,0.2)_0%,transparent_70%)] pointer-events-none" />
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.07] border border-white/10 backdrop-blur-md flex items-center justify-center shadow-lg mb-1.5 text-primary">
                          <Flame className="w-5 h-5 stroke-[2] fill-primary/25" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
                          Prime Cuts
                        </p>
                        <p className="text-[8px] font-bold text-stone-400 uppercase tracking-wider mt-0.5">
                          Fresh Cut
                        </p>
                      </div>
                    </div>
                  )}

                  <span className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {formData.category || "Unassigned"}
                  </span>
                  {formData.isFeatured && (
                    <span className="absolute top-2 right-2 bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                      ★ Featured
                    </span>
                  )}
                </div>
                <h4 className="font-black text-stone-900 text-sm truncate">
                  {formData.name || "Untitled Meat Cut"}
                </h4>
                <p className="text-primary font-black text-base mt-0.5">
                  Rs. {numericPricePerKg > 0 ? numericPricePerKg : "0"}
                  <span className="text-stone-400 text-xs font-bold"> / kg</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM ACTION BUTTONS */}
        <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-5 py-2.5 bg-white text-stone-700 font-bold rounded-xl border border-stone-200 hover:bg-stone-100 transition-colors text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-colors text-sm shadow-md shadow-primary/20 flex items-center gap-2 cursor-pointer ml-auto"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-colors text-sm shadow-lg shadow-primary/30 flex items-center gap-2 cursor-pointer ml-auto disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Cut...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isEdit ? "Update Meat Cut" : "Save & Publish Cut"}</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
