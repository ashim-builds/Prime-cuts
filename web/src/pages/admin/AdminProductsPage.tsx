import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Image as ImageIcon, Search, Filter, AlertCircle, Loader2, Sparkles, Check } from "lucide-react";
import StockToggle from "../../components/admin/StockToggle";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/admin/products", { credentials: "include" }),
        fetch("/api/admin/categories", { credentials: "include" }),
      ]);
      const [prodData, catData] = await Promise.all([prodRes.json(), catRes.json()]);

      if (prodData.success && prodData.products) {
        setProducts(prodData.products);
      }
      if (catData.success && catData.categories) {
        setCategories(catData.categories);
      }
    } catch (err) {
      console.error("Failed to load products or categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setDeletingId(productToDelete.id);
    try {
      const res = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => (p.id || p._id) !== productToDelete.id));
        setFeedback({ type: "success", message: `"${productToDelete.name}" deleted successfully!` });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to delete product." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to delete product." });
    } finally {
      setDeletingId(null);
      setProductToDelete(null);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" ||
      product.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-5 pb-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-md animate-in fade-in">
          <div
            className={`rounded-2xl shadow-2xl p-4 flex items-center gap-3 text-white ${
              feedback.type === "success" ? "bg-emerald-600" : "bg-red-600"
            }`}
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="flex-1 text-xs sm:text-sm font-bold">{feedback.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">Meat Products</h1>
          <p className="text-xs sm:text-sm font-semibold text-stone-500 mt-0.5">
            Manage your cuts, prices per kg, stock status, and categories.
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            to="/admin/categories"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-white text-stone-700 font-bold px-3.5 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 active:scale-95 transition-all shadow-xs text-xs sm:text-sm"
          >
            Categories
          </Link>
          <Link
            to="/admin/products/new"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-primary text-white font-black px-4 py-2.5 rounded-xl hover:bg-primary-hover active:scale-95 transition-all shadow-md shadow-primary/20 text-xs sm:text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Cut
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search cuts by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-600"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider shrink-0">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((cat) => (
              <option key={cat.id || cat.name} value={cat.name}>
                {cat.name} ({cat.productCount ?? cat.product_count ?? 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-12 text-center text-stone-400 font-medium bg-white rounded-2xl border border-stone-200">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
          Loading products & inventory...
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredProducts.length === 0 && (
        <div className="p-8 text-center text-stone-500 bg-white rounded-2xl border border-stone-200 space-y-3">
          <ImageIcon className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="font-bold text-stone-800">No meat products found</p>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== "all"
              ? "Try adjusting your search or category filter."
              : "Click 'Add Cut' to list your first meat cut."}
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* 📱 MOBILE VIEW: DEDICATED PRODUCT CARDS (Visible on < md) */}
      {/* ========================================================= */}
      {!loading && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 gap-3.5 md:hidden">
          {filteredProducts.map((product: any) => {
            const productId = product.id || product._id;
            const isAvailable = product.available ?? product.isAvailable ?? true;
            const priceDisplay =
              product.priceType === "weight" || product.price_type === "weight"
                ? `Rs. ${product.pricePerKg ?? product.price_per_kg}/kg`
                : product.variants?.length
                ? `Rs. ${product.variants[0].price} (${product.variants[0].name}${product.variants.length > 1 ? ` +${product.variants.length - 1}` : ""})`
                : "—";

            return (
              <div
                key={productId}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-3.5 space-y-3 relative transition-all"
              >
                {/* Top Row: Thumbnail + Title + Actions */}
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl bg-stone-100 overflow-hidden border border-stone-200 shrink-0 flex items-center justify-center">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-stone-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-stone-900 text-sm truncate">{product.name}</h3>
                    <span className="inline-block px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md text-[10px] font-bold mt-1">
                      {product.category || "Unassigned"}
                    </span>
                    <p className="font-black text-primary text-sm mt-1">{priceDisplay}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      to={`/admin/products/${productId}/edit`}
                      className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors cursor-pointer"
                      title="Edit Cut"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setProductToDelete({ id: productId, name: product.name })}
                      className="p-2 bg-red-50 hover:bg-red-100 text-primary rounded-xl transition-colors cursor-pointer"
                      title="Delete Cut"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Row: Stock status toggle */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-500">Available in Shop:</span>
                  <StockToggle
                    productId={productId.toString()}
                    initialAvailable={isAvailable}
                    onToggle={(newVal) => {
                      setProducts((prev) =>
                        prev.map((p) =>
                          (p.id || p._id) === productId
                            ? { ...p, available: newVal, isAvailable: newVal }
                            : p
                        )
                      );
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 💻 DESKTOP VIEW: POLISHED DATA TABLE (Visible on >= md) */}
      {/* ========================================================= */}
      {!loading && filteredProducts.length > 0 && (
        <div className="hidden md:block bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-stone-50/90 border-b border-stone-200 text-stone-500 text-xs uppercase tracking-wider font-extrabold">
              <tr>
                <th className="p-4">Image</th>
                <th className="p-4">Product Cut</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {filteredProducts.map((product: any) => {
                const productId = product.id || product._id;
                const isAvailable = product.available ?? product.isAvailable ?? true;

                return (
                  <tr key={productId} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden border border-stone-200 flex items-center justify-center shrink-0">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-stone-400" />
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-stone-900 text-base">{product.name}</p>
                      {product.description && (
                        <p className="text-xs text-stone-400 font-medium line-clamp-1 max-w-xs">{product.description}</p>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="inline-block px-3 py-1 bg-stone-100 text-stone-800 rounded-lg text-xs font-bold border border-stone-200">
                        {product.category || "Unassigned"}
                      </span>
                    </td>

                    <td className="p-4 font-black text-stone-900">
                      <span className="text-primary font-black text-sm">
                        {product.priceType === "weight" || product.price_type === "weight"
                          ? `Rs. ${product.pricePerKg ?? product.price_per_kg}/kg`
                          : product.variants?.length
                          ? `Rs. ${product.variants[0].price} (${product.variants[0].name}${product.variants.length > 1 ? ` +${product.variants.length - 1}` : ""})`
                          : "—"}
                      </span>
                    </td>

                    <td className="p-4">
                      <StockToggle
                        productId={productId.toString()}
                        initialAvailable={isAvailable}
                        onToggle={(newVal) => {
                          setProducts((prev) =>
                            prev.map((p) =>
                              (p.id || p._id) === productId
                                ? { ...p, available: newVal, isAvailable: newVal }
                                : p
                            )
                          );
                        }}
                      />
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/${productId}/edit`}
                          className="p-2 bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900 rounded-xl transition-colors cursor-pointer"
                          title="Edit Cut"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setProductToDelete({ id: productId, name: product.name })}
                          className="p-2 bg-stone-100 text-stone-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
                          title="Delete Cut"
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

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 border border-stone-200 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-primary flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black text-stone-900">Delete Product Cut?</h3>
              <p className="text-sm text-stone-500 mt-1">
                Are you sure you want to delete <strong className="text-stone-900">"{productToDelete.name}"</strong>?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={Boolean(deletingId)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 active:scale-95 transition-all shadow-md shadow-red-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
              >
                {deletingId && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
