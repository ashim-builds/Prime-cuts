import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Image as ImageIcon, Search, Filter, AlertCircle, Loader2 } from "lucide-react";
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
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
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
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-md">
          <div
            className={`rounded-2xl shadow-2xl p-4 flex items-center gap-3 text-white ${
              feedback.type === "success" ? "bg-emerald-600" : "bg-red-600"
            }`}
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="flex-1 text-sm font-bold">{feedback.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Meat Products</h1>
          <p className="text-sm font-semibold text-stone-500 mt-1">
            Manage your cuts, prices per kg, stock status, and categories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/categories"
            className="flex items-center gap-2 bg-white text-stone-700 font-bold px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors shadow-sm text-sm"
          >
            Manage Categories
          </Link>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 bg-primary text-white font-black px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Cut / Product
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search cut name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider shrink-0">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
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

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-4 md:p-0">
          <table className="block md:table w-full text-left">
            <thead className="hidden md:table-header-group bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="p-4 font-bold text-stone-500 text-sm">Image</th>
                <th className="p-4 font-bold text-stone-500 text-sm">Product Cut</th>
                <th className="p-4 font-bold text-stone-500 text-sm">Category</th>
                <th className="p-4 font-bold text-stone-500 text-sm">Price</th>
                <th className="p-4 font-bold text-stone-500 text-sm">Stock Status</th>
                <th className="p-4 font-bold text-stone-500 text-sm">Featured</th>
                <th className="p-4 font-bold text-stone-500 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group divide-y divide-stone-100 md:divide-y-0">
              {filteredProducts.map((product: any) => {
                const productId = product.id || product._id;
                const isAvailable = product.available ?? product.isAvailable ?? true;
                const isFeatured = product.featured ?? product.isFeatured ?? false;

                return (
                  <tr
                    key={productId}
                    className="block md:table-row bg-white md:bg-transparent border border-stone-200 md:border-0 rounded-xl p-4 mb-4 md:mb-0 space-y-2.5 md:space-y-0 relative shadow-sm md:shadow-none hover:bg-stone-50/80 transition-colors"
                  >
                    <td className="flex md:table-cell justify-between items-center p-0 md:p-4 border-b border-stone-100 md:border-0 pb-2 md:pb-0">
                      <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">Image</span>
                      <div className="w-14 h-14 rounded-xl bg-stone-100 relative overflow-hidden border border-stone-200 flex items-center justify-center shrink-0">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-stone-400" />
                        )}
                      </div>
                    </td>

                    <td className="flex md:table-cell justify-between items-center p-0 md:p-4 border-b border-stone-100 md:border-0 pb-2 md:pb-0">
                      <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">Product Name</span>
                      <div className="text-right md:text-left">
                        <p className="font-bold text-stone-900 text-base">{product.name}</p>
                        <p className="text-xs text-stone-400 font-medium line-clamp-1 max-w-xs">{product.description}</p>
                      </div>
                    </td>

                    <td className="flex md:table-cell justify-between items-center p-0 md:p-4 border-b border-stone-100 md:border-0 pb-2 md:pb-0">
                      <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">Category</span>
                      <span className="inline-block px-3 py-1 bg-stone-100 text-stone-800 rounded-lg text-xs font-bold border border-stone-200">
                        {product.category || "Unassigned"}
                      </span>
                    </td>

                    <td className="flex md:table-cell justify-between items-center p-0 md:p-4 border-b border-stone-100 md:border-0 pb-2 md:pb-0 font-black text-stone-900">
                      <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">Price</span>
                      <span className="text-primary font-black text-sm md:text-base">
                        {product.priceType === "weight" || product.price_type === "weight"
                          ? `Rs. ${product.pricePerKg ?? product.price_per_kg}/kg`
                          : product.variants?.[0]?.price
                          ? `From Rs. ${product.variants[0].price}`
                          : "—"}
                      </span>
                    </td>

                    <td className="flex md:table-cell justify-between items-center p-0 md:p-4 border-b border-stone-100 md:border-0 pb-2 md:pb-0">
                      <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">Stock</span>
                      <div>
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
                    </td>

                    <td className="flex md:table-cell justify-between items-center p-0 md:p-4 border-b border-stone-100 md:border-0 pb-2 md:pb-0">
                      <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">Featured</span>
                      <span>
                        {isFeatured ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-red-100 text-primary border border-red-200">
                            ★ Featured
                          </span>
                        ) : (
                          <span className="text-stone-300 text-xs font-medium">—</span>
                        )}
                      </span>
                    </td>

                    <td className="flex md:table-cell justify-between items-center p-0 md:p-4 last:border-0 pt-1 md:pt-0 text-right">
                      <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">Actions</span>
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/${productId}/edit`}
                          className="p-2 bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900 rounded-lg transition-colors cursor-pointer"
                          title="Edit Cut"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setProductToDelete({ id: productId, name: product.name })}
                          className="p-2 bg-stone-100 text-stone-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete Cut"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && filteredProducts.length === 0 && (
                <tr className="block md:table-row bg-white md:bg-transparent">
                  <td colSpan={7} className="block md:table-cell p-12 text-center text-stone-400 font-medium">
                    <p className="text-base font-bold text-stone-600">No meat products found</p>
                    <p className="text-xs text-stone-400 mt-1">
                      {searchQuery || selectedCategory !== "all"
                        ? "Try adjusting your search or category filter."
                        : "Click 'Add Cut / Product' to list your first meat item."}
                    </p>
                  </td>
                </tr>
              )}

              {loading && (
                <tr className="block md:table-row bg-white md:bg-transparent">
                  <td colSpan={7} className="block md:table-cell p-12 text-center text-stone-400 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span>Loading butcher inventory...</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">Delete Product?</h3>
              <p className="text-sm font-medium text-stone-500 mt-1">
                Are you sure you want to delete <span className="font-bold text-stone-900">"{productToDelete.name}"</span>? This will remove it from the catalog and homepage.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl text-stone-600 font-bold hover:bg-stone-100 transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!!deletingId}
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-red-600 text-white font-black hover:bg-red-700 transition-colors text-sm shadow-md shadow-red-600/20 disabled:opacity-70 cursor-pointer flex items-center gap-2"
              >
                {deletingId ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Delete Cut
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
