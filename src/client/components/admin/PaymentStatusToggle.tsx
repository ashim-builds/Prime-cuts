import React, { useState } from "react";
import { Loader2, CheckCircle2, Clock } from "lucide-react";

export default function PaymentStatusToggle({
  orderId,
  currentPaymentStatus,
  onStatusChange,
}: {
  orderId: string;
  currentPaymentStatus: "pending" | "paid";
  onStatusChange?: (newStatus: "pending" | "paid") => void;
}) {
  const [status, setStatus] = useState(currentPaymentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggle = async () => {
    const newStatus = status === "paid" ? "pending" : "paid";
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update payment status.");
      }
      setStatus(newStatus);
      if (onStatusChange) onStatusChange(newStatus);
    } catch (err: any) {
      setError(err.message || "Failed to update payment status.");
    } finally {
      setLoading(false);
    }
  };

  const isPaid = status === "paid";

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-bold text-stone-400">Payment Status</p>
      <div className="flex items-center gap-3">
        {/* Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-colors ${
            isPaid
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {isPaid ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <Clock className="w-3.5 h-3.5" />
          )}
          {status}
        </span>

        {/* Toggle button */}
        <button
          onClick={toggle}
          disabled={loading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-50 cursor-pointer ${
            isPaid
              ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
              : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          }`}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isPaid ? (
            "Mark Unpaid"
          ) : (
            "Mark as Paid ✓"
          )}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
    </div>
  );
}
