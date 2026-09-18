import React, { useState } from "react";

interface StockToggleProps {
  productId: string;
  initialAvailable: boolean;
  onToggle?: (newAvailable: boolean) => void;
}

export default function StockToggle({ productId, initialAvailable, onToggle }: StockToggleProps) {
  const [available, setAvailable] = useState(initialAvailable);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const newValue = !available;
    setAvailable(newValue);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: newValue }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update stock status");
      }
      if (onToggle) onToggle(newValue);
    } catch {
      // Revert on failure
      setAvailable(!newValue);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={available ? "Click to mark Out of Stock" : "Click to mark In Stock"}
      className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer border ${
        available
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
          : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
      } ${loading ? "opacity-60 cursor-wait" : ""}`}
    >
      <span
        className={`w-2 h-2 rounded-full transition-colors duration-200 ${
          available ? "bg-emerald-500" : "bg-red-500"
        }`}
      />
      {loading ? "Updating..." : available ? "In Stock" : "Out of Stock"}
    </button>
  );
}
