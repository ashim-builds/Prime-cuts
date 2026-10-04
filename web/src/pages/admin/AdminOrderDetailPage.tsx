import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, MapPin, Package, Phone, Mail, Clock, Calendar, CheckCircle2, ShoppingBag, QrCode, Copy, Check } from "lucide-react";
import StatusUpdater from "../../components/admin/StatusUpdater";
import PaymentStatusToggle from "../../components/admin/PaymentStatusToggle";
import StaticMapView from "../../components/StaticMapView";
import { printThermalReceipt } from "../../utils/printThermalReceipt";

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedTxn, setCopiedTxn] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/orders/${id}`, { credentials: "include" });
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          setError(data.error || "Order not found");
        }
      } catch (err) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [id]);

  const copyTxn = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxn(true);
    setTimeout(() => setCopiedTxn(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-stone-400 font-medium">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading order details...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <p className="text-red-500 font-bold">{error || "Order not found"}</p>
        <Link to="/admin/orders" className="inline-block px-5 py-2.5 bg-stone-900 text-white font-bold rounded-xl text-sm">
          Back to Orders
        </Link>
      </div>
    );
  }

  const orderId = order.id || order._id;
  const orderNumber = order.orderNumber || order.order_number;
  const createdAt = order.createdAt || order.created_at;
  const orderType = (order.orderType || order.order_type || "delivery").toLowerCase();
  const customerName = order.customerInfo?.name || order.customer_name || "Customer";
  const customerPhone = order.customerInfo?.phone || order.customer_phone || "";
  const customerEmail = order.customerInfo?.email || order.customer_email || "";
  const totalAmount = typeof order.totalAmount === "number" ? order.totalAmount : parseFloat(order.total_amount || "0");
  const paymentMethod = order.paymentMethod || order.payment_method || "cod";
  const paymentStatus = order.paymentStatus || order.payment_status || "pending";
  const transactionId = order.transactionId || order.transaction_id || "";
  const latitude = order.latitude !== undefined && order.latitude !== null ? parseFloat(order.latitude) : null;
  const longitude = order.longitude !== undefined && order.longitude !== null ? parseFloat(order.longitude) : null;
  const address = order.address || "";
  const notes = order.notes || "";
  const items = order.items || [];

  const handlePrintSlip = () => {
    printThermalReceipt(order);
  };

  const riderDispatchText = `*🥩 Prime Cuts — Delivery Dispatch*
Order: #${orderNumber}
Customer: ${customerName} (${customerPhone})
${address ? `Address: ${address}` : ""}
${latitude && longitude ? `Google Maps Navigation: https://www.google.com/maps?q=${latitude},${longitude}` : ""}

*Items to Deliver:*
${items
  .map(
    (i: any) =>
      `- ${i.productName || i.name} (${
        i.selectedWeightInGrams
          ? i.selectedWeightInGrams >= 1000
            ? i.selectedWeightInGrams / 1000 + "kg"
            : i.selectedWeightInGrams + "g"
          : i.selectedVariantName || ""
      }) x ${i.qty || 1}`
  )
  .join("\n")}

*Total to Collect: Rs. ${totalAmount.toFixed(2)} (${
    paymentMethod === "qr" || paymentStatus === "paid"
      ? "PAID ONLINE (Do NOT collect cash)"
      : "COLLECT CASH"
  })*`;

  const riderWhatsAppUrl = `https://wa.me/?text=${encodeURIComponent(riderDispatchText)}`;

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-8">
      {/* Top Bar / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="p-2 bg-stone-100 rounded-xl hover:bg-stone-200 text-stone-600 hover:text-black transition-colors shrink-0"
            title="Back to Orders"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Order #{orderNumber}
              </h1>
            </div>
            <p className="text-xs text-stone-400 font-medium mt-0.5">
              Placed on {new Date(createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Dispatch to Rider via WhatsApp */}
          {orderType === "delivery" && (
            <a
              href={riderWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span>Dispatch to Rider</span>
            </a>
          )}

          {/* Print Slip */}
          <button
            onClick={handlePrintSlip}
            className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <span>Print Slip</span>
          </button>

          <StatusUpdater
            orderId={orderId.toString()}
            currentStatus={order.status}
            onStatusChange={(newStatus) => setOrder((prev: any) => ({ ...prev, status: newStatus }))}
          />
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Customer Details */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200 space-y-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-stone-100 pb-2.5">
              <User className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider">Customer</h2>
            </div>
            <div className="space-y-2.5 mt-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Name</span>
                <p className="font-bold text-stone-900 text-sm">{customerName}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Phone</span>
                {customerPhone ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-stone-800">{customerPhone}</span>
                    <a
                      href={`tel:${customerPhone}`}
                      className="px-2.5 py-1 bg-red-50 text-primary hover:bg-red-100 font-bold rounded-lg text-[11px] transition-colors inline-flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  </div>
                ) : (
                  <span className="text-stone-400">Not provided</span>
                )}
              </div>
              {customerEmail && (
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Email</span>
                  <p className="font-medium text-stone-700 truncate">{customerEmail}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200 space-y-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-stone-100 pb-2.5">
              <Package className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider">Order & Payment</h2>
            </div>
            <div className="space-y-2.5 mt-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Fulfillment</span>
                <p className="font-bold text-stone-800 capitalize mt-0.5">
                  {orderType === "delivery" ? "🛵 Home Delivery" : "🏬 Store Pickup"}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Payment Method</span>
                <p className="font-bold text-stone-800 mt-0.5 flex items-center gap-1.5">
                  {paymentMethod === "qr" ? (
                    <>
                      <QrCode className="w-3.5 h-3.5 text-primary" />
                      <span>QR Scan & Pay (Fonepay/eSewa)</span>
                    </>
                  ) : (
                    <span>Cash on Delivery (COD)</span>
                  )}
                </p>
              </div>

              {/* Transaction ID if QR payment */}
              {transactionId && (
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200/80">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Transaction / Ref ID</span>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <span className="font-mono font-black text-xs text-emerald-950 truncate">{transactionId}</span>
                    <button
                      type="button"
                      onClick={() => copyTxn(transactionId)}
                      className="p-1 hover:bg-emerald-200/60 rounded text-emerald-800 cursor-pointer"
                      title="Copy Transaction ID"
                    >
                      {copiedTxn ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Payment Status</span>
                <PaymentStatusToggle
                  orderId={orderId.toString()}
                  currentPaymentStatus={paymentStatus as "pending" | "paid"}
                  onStatusChange={(newStatus) => setOrder((prev: any) => ({ ...prev, paymentStatus: newStatus }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery / Address Info */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200 space-y-3.5">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-2.5">
            <MapPin className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider">Delivery Details</h2>
          </div>
          <div className="space-y-2.5 text-xs">
            {orderType === "delivery" ? (
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Address</span>
                  <p className="font-bold text-stone-800 mt-0.5 leading-relaxed">{address || "Standard delivery"}</p>
                </div>
                {address && <StaticMapView address={address} latitude={latitude} longitude={longitude} />}
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-800 p-3 rounded-xl font-bold text-xs border border-amber-200/60">
                Customer will pick up at store counter.
              </div>
            )}

            {notes && (
              <div className="pt-2 border-t border-stone-100">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Special Instructions</span>
                <p className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl mt-1 italic border border-stone-100">
                  "{notes}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items Section */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <h2 className="text-base font-black text-stone-900">Order Items ({items.length})</h2>
          </div>
          <span className="text-xs font-bold text-stone-500">Summary & Pricing</span>
        </div>

        {/* 📱 Mobile Order Items Card List (< md) */}
        <div className="space-y-2.5 md:hidden">
          {items.map((item: any, i: number) => {
            const productName = item.productName || item.name || "Item";
            const calculatedPrice =
              typeof item.calculatedPrice === "number"
                ? item.calculatedPrice
                : (item.price || 0) * (item.qty || 1);
            const variantText = item.selectedWeightInGrams
              ? item.selectedWeightInGrams >= 1000
                ? `${item.selectedWeightInGrams / 1000}kg`
                : `${item.selectedWeightInGrams}g`
              : item.selectedVariantName || "Standard";

            return (
              <div
                key={i}
                className="p-3 bg-stone-50/70 rounded-xl border border-stone-200/80 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <p className="font-bold text-stone-900 text-sm">{productName}</p>
                  <div className="flex items-center gap-2 text-stone-500">
                    <span className="bg-stone-200/80 px-2 py-0.5 rounded-md font-bold text-[11px] text-stone-700">
                      {variantText}
                    </span>
                    <span className="font-black text-stone-800">x{item.qty}</span>
                  </div>
                  {(item.pricePerKgAtTimeOfOrder || item.unitPriceAtTimeOfOrder) && (
                    <p className="text-[11px] text-stone-400">
                      Rate: Rs. {item.pricePerKgAtTimeOfOrder ? `${item.pricePerKgAtTimeOfOrder}/kg` : item.unitPriceAtTimeOfOrder}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Total</span>
                  <span className="font-black text-stone-900 text-sm">
                    Rs. {calculatedPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 💻 Desktop Order Items Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 text-xs uppercase tracking-wider font-extrabold">
              <tr>
                <th className="p-3.5">Product Cut</th>
                <th className="p-3.5">Size / Variant</th>
                <th className="p-3.5">Qty</th>
                <th className="p-3.5">Unit Price</th>
                <th className="p-3.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {items.map((item: any, i: number) => {
                const productName = item.productName || item.name || "Item";
                const calculatedPrice =
                  typeof item.calculatedPrice === "number"
                    ? item.calculatedPrice
                    : (item.price || 0) * (item.qty || 1);
                const variantText = item.selectedWeightInGrams
                  ? item.selectedWeightInGrams >= 1000
                    ? `${item.selectedWeightInGrams / 1000}kg`
                    : `${item.selectedWeightInGrams}g`
                  : item.selectedVariantName || "Standard";

                return (
                  <tr key={i} className="hover:bg-stone-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-stone-900">{productName}</td>
                    <td className="p-3.5 text-stone-600 font-medium">
                      <span className="bg-stone-100 px-2 py-0.5 rounded-md text-xs font-semibold">
                        {variantText}
                      </span>
                    </td>
                    <td className="p-3.5 font-black text-stone-900">x{item.qty}</td>
                    <td className="p-3.5 text-stone-500 text-xs">
                      {item.pricePerKgAtTimeOfOrder
                        ? `Rs. ${item.pricePerKgAtTimeOfOrder}/kg`
                        : item.unitPriceAtTimeOfOrder
                        ? `Rs. ${item.unitPriceAtTimeOfOrder}`
                        : "-"}
                    </td>
                    <td className="p-3.5 font-black text-stone-900 text-right">
                      Rs. {calculatedPrice.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Order Grand Total Box */}
        <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between bg-stone-50 p-4 rounded-xl">
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Grand Total</span>
            <span className="text-[11px] text-stone-400 font-medium">Includes applicable taxes & delivery fees</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-primary">
            Rs. {totalAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
