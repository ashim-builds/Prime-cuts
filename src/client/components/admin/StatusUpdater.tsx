import React, { useState } from "react";
import { Loader2 } from "lucide-react";

export default function StatusUpdater({
  orderId,
  currentStatus,
  onStatusChange
}: {
  orderId: string;
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update status");
      }
      setStatus(newStatus);
      if (onStatusChange) onStatusChange(newStatus);
    } catch (err: any) {
      alert(err.message || "Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <select
        value={status}
        onChange={handleStatusChange}
        disabled={loading}
        className="px-4 py-2 bg-white border border-stone-200 rounded-lg font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
      >
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="preparing">Preparing</option>
        <option value="ready">Ready for Pickup / Delivery</option>
        <option value="delivered">Delivered / Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      {loading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
    </div>
  );
}
