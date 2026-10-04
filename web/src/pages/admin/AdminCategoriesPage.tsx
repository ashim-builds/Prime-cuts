import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Loader2, X, Check, AlertCircle, Eye, EyeOff, Search, Layers, Sparkles } from "lucide-react";
import { Category } from "@/types/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("/images/cat_steaks.jpg");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("/images/cat_steaks.jpg");
  const [active, setActive] = useState(true);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", { credentials: "include" });
      const data = await res.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
      } else {
        setError(data.error || "Failed to load categories.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setImage("/images/cat_steaks.jpg");
    setImageFile(null);
    setImagePreview("/images/cat_steaks.jpg");
    setActive(true);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    const currentImg = cat.image || "/images/cat_steaks.jpg";
    setImage(currentImg);
    setImageFile(null);
    setImagePreview(currentImg);
    setActive(cat.active);
    setError("");
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      let finalImageUrl = image.trim() || "/images/cat_steaks.jpg";

      // If user uploaded a new image file for the category
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
        finalImageUrl = uploadJson.url;
      }

      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : "/api/admin/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: description.trim(),
          image: finalImageUrl,
          active,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to save category.");
      }

      setSuccess(editingCategory ? "Category updated successfully!" : "Category created successfully!");
      setTimeout(() => setSuccess(""), 3500);
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to delete category.");
      }
      setSuccess("Category deleted successfully.");
      setTimeout(() => setSuccess(""), 3500);
      setDeleteTarget(null);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || "Failed to delete category.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredCategories = categories.filter((cat) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      cat.name?.toLowerCase().includes(q) ||
      cat.slug?.toLowerCase().includes(q) ||
      cat.description?.toLowerCase().includes(q)
    );
  });

  const totalCuts = categories.reduce((sum, cat) => sum + (cat.productCount ?? cat.product_count ?? 0), 0);
  const liveCount = categories.filter((c) => c.active && (c.productCount ?? c.product_count ?? 0) > 0).length;

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">Meat Categories</h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Manage your butcher categories and storefront visibility.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-primary text-white font-bold px-4 py-2.5 rounded-xl hover:bg-primary-hover active:scale-95 transition-all shadow-md shadow-primary/20 cursor-pointer w-full sm:w-auto text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Quick Summary Stats Bar */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-wider">Total</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-stone-900">{categories.length}</span>
            <span className="text-[10px] sm:text-xs text-stone-500 font-semibold">Cats</span>
          </div>
        </div>
        <div className="bg-emerald-50/70 border border-emerald-200/80 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wider">Live</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-800">{liveCount}</span>
            <span className="text-[10px] sm:text-xs text-emerald-600 font-semibold">On Home</span>
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] sm:text-xs font-bold text-stone-400 uppercase tracking-wider">Inventory</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-primary">{totalCuts}</span>
            <span className="text-[10px] sm:text-xs text-stone-500 font-semibold">Total Cuts</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-primary shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search & Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search categories by name or slug..."
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-stone-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm text-stone-900 font-semibold placeholder:text-stone-400 outline-none shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-600 px-1.5 py-0.5 rounded"
          >
            Clear
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-10 text-center text-stone-400 font-medium bg-white rounded-2xl border border-stone-200">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
          Loading categories...
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredCategories.length === 0 && (
        <div className="p-8 text-center text-stone-500 bg-white rounded-2xl border border-stone-200 space-y-3">
          <Layers className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="font-bold text-stone-800">No categories found</p>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            {searchQuery
              ? `No categories match "${searchQuery}". Try a different search term.`
              : "Click 'Add Category' above to create your first meat category."}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Clear Search Filter
            </button>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 📱 MOBILE VIEW: RESPONSIVE CARDS (Visible on < md) */}
      {/* ========================================================= */}
      {!loading && filteredCategories.length > 0 && (
        <div className="grid grid-cols-1 gap-3.5 md:hidden">
          {filteredCategories.map((cat) => {
            const pCount = cat.productCount ?? cat.product_count ?? 0;
            const isVisibleOnHome = cat.active && pCount > 0;

            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-4 space-y-3 relative transition-all active:border-stone-300"
              >
                {/* Card Top: Name, Status & Action Icons */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-black text-stone-900 tracking-tight truncate">
                      {cat.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[11px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
                        /{cat.slug}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-black ${
                          pCount > 0
                            ? "bg-red-50 text-primary border border-red-200"
                            : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {pCount} {pCount === 1 ? "Cut" : "Cuts"}
                      </span>
                    </div>
                  </div>

                  {/* Actions (Touch-friendly buttons) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 transition-all cursor-pointer"
                      title="Edit Category"
                      aria-label="Edit Category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(cat)}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 active:scale-95 text-primary transition-all cursor-pointer"
                      title="Delete Category"
                      aria-label="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {cat.description && (
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed bg-stone-50/70 p-2 rounded-xl border border-stone-100">
                    {cat.description}
                  </p>
                )}

                {/* Card Bottom: Visibility Badge & Details */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    Homepage Status
                  </span>
                  <div>
                    {isVisibleOnHome ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live on Homepage
                      </span>
                    ) : !cat.active ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600 border border-stone-200">
                        <EyeOff className="w-3.5 h-3.5" />
                        Disabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Eye className="w-3.5 h-3.5" />
                        0 Cuts (Hidden)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 💻 DESKTOP VIEW: POLISHED DATA TABLE (Visible on >= md) */}
      {/* ========================================================= */}
      {!loading && filteredCategories.length > 0 && (
        <div className="hidden md:block bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-stone-50/90 border-b border-stone-200 text-stone-500 text-xs uppercase tracking-wider font-extrabold">
              <tr>
                <th className="p-4">Category Name</th>
                <th className="p-4">URL Slug</th>
                <th className="p-4">Products</th>
                <th className="p-4">Homepage Visibility</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {filteredCategories.map((cat) => {
                const pCount = cat.productCount ?? cat.product_count ?? 0;
                const isVisibleOnHome = cat.active && pCount > 0;

                return (
                  <tr key={cat.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-4">
                      <p className="font-extrabold text-stone-900 text-base">{cat.name}</p>
                      {cat.description && (
                        <p className="text-xs text-stone-400 mt-0.5 line-clamp-1 max-w-sm">{cat.description}</p>
                      )}
                    </td>
                    <td className="p-4 font-mono text-xs text-stone-500">
                      <span className="bg-stone-100 px-2.5 py-1 rounded-md">/{cat.slug}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black ${
                          pCount > 0 ? "bg-red-50 text-primary border border-red-200" : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {pCount} {pCount === 1 ? "Cut" : "Cuts"}
                      </span>
                    </td>
                    <td className="p-4">
                      {isVisibleOnHome ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Live on Homepage
                        </span>
                      ) : !cat.active ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600 border border-stone-200">
                          <EyeOff className="w-3.5 h-3.5" />
                          Disabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200" title="Add a product cut to this category to display it on the homepage">
                          <Eye className="w-3.5 h-3.5" />
                          0 Cuts (Hidden)
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-black transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-primary transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                {editingCategory ? "Edit Category" : "Add New Meat Category"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Fresh Chicken, Buff & Beef, Goat & Mutton"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-stone-900 font-semibold outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. chicken, buff-beef"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-stone-900 font-mono text-xs sm:text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description for customer shop filters..."
                  className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-stone-900 text-sm outline-none resize-none"
                />
              </div>

              {/* Category Image Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Category Image
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl border border-stone-200 bg-stone-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Category Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Layers className="w-6 h-6 text-stone-400" />
                    )}
                  </div>
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 border-dashed rounded-xl cursor-pointer text-xs font-bold text-stone-700 transition-colors">
                    <span className="text-primary font-black">+ Choose Category Image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-stone-300 focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm font-bold text-stone-800">
                    Category Active (Ready to show when cuts exist)
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 sm:px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 transition-colors text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 sm:px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover active:scale-95 transition-all shadow-md shadow-primary/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCategory ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 border border-stone-200 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-primary flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black text-stone-900">Delete Category?</h3>
              <p className="text-sm text-stone-500 mt-1">
                Are you sure you want to delete <strong className="text-stone-900">"{deleteTarget.name}"</strong>?
                {Number(deleteTarget.productCount || 0) > 0 && (
                  <span className="block text-red-600 font-bold mt-2 bg-red-50 p-2.5 rounded-xl border border-red-200 text-xs">
                    ⚠️ Warning: There are {deleteTarget.productCount} cuts assigned to this category.
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 active:scale-95 transition-all shadow-md shadow-red-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
