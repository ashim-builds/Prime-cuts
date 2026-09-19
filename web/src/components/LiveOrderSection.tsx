import { useEffect, useState, useTransition } from "react";
import { Ban, Loader2, CreditCard, Banknote } from "lucide-react";

interface LiveOrderSectionProps {
  orderNumber: string;
  initialStatus: string;
  paymentMethod: "cod" | "qr";
  paymentStatus: "pending" | "paid";
}

export default function LiveOrderSection({
  orderNumber,
  initialStatus,
  paymentMethod,
  paymentStatus,
}: LiveOrderSectionProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    let active = true;

    const terminalStatuses = ["delivered", "cancelled", "completed"];
    if (terminalStatuses.includes(status)) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderNumber}/status`);
        if (res.ok) {
          const data = await res.json();
          if (active && data.success && data.status) {
            setStatus(data.status);
          }
        }
      } catch (err) {
        console.error("Failed to check live order status:", err);
      }
    }, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [orderNumber, status]);

  const handleCancel = () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    setCancelError("");
    startTransition(async () => {
      try {
        const res = await fetch(`/api/orders/${orderNumber}/cancel`, { method: "POST" });
        const data = await res.json();
        if (data.success && data.status) {
          setStatus(data.status);
        } else {
          setCancelError(data.error || "Failed to cancel order.");
        }
      } catch {
        setCancelError("An error occurred during order cancellation.");
      }
    });
  };

  const isTerminalSuccess = status === "completed" || status === "delivered";
  const isTerminalFail = status === "cancelled";

  return (
    <div className="space-y-6">
      {/* Live status bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50 border border-stone-200/60 p-5 rounded-2xl">
        <div>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">Live Order Status</p>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              status === 'pending' ? 'bg-orange-500 animate-pulse' 
              : isTerminalFail   ? 'bg-red-500' 
              : isTerminalSuccess ? 'bg-green-500' 
              : 'bg-blue-500 animate-pulse'
            }`} />
            <span className={`font-black text-xl uppercase tracking-wider ${
              isTerminalFail ? 'text-red-600' : isTerminalSuccess ? 'text-green-600' : 'text-stone-900'
            }`}>
              {status === "delivered" ? "Delivered ✓" : status}
            </span>
          </div>
        </div>

        {/* Cancellation Button Container */}
        {status === "pending" && (
          <div className="flex flex-col items-end gap-1 shrink-0">
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelling...</>
              ) : (
                <><Ban className="w-3.5 h-3.5" /> Cancel Order</>
              )}
            </button>
            {cancelError && (
              <p className="text-[10px] text-red-500 font-semibold">{cancelError}</p>
            )}
          </div>
        )}
      </div>

      {/* Payment details card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 border border-stone-200/60 p-5 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-stone-200 shrink-0">
            {paymentMethod === "qr" ? (
              <CreditCard className="w-5 h-5 text-stone-700" />
            ) : (
              <Banknote className="w-5 h-5 text-stone-700" />
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Payment Method</p>
            <p className="font-extrabold text-stone-800 mt-0.5">
              {paymentMethod === "qr" ? "QR Scan & Pay" : "Cash on Delivery / Pickup"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-stone-200 shrink-0">
            <span className={`w-2.5 h-2.5 rounded-full ${paymentStatus === 'paid' ? 'bg-green-500' : 'bg-amber-500'}`} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Payment Status</p>
            <span className={`inline-block text-xs font-black uppercase mt-1 px-2.5 py-0.5 rounded-md ${
              paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}>
              {paymentStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
