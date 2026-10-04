import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Search, Phone, ShoppingBag, Truck, Store, ArrowRight, RefreshCw, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

interface AdminOrdersClientProps {
  initialOrders?: any[];
}

export default function AdminOrdersClient({ initialOrders = [] }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [loading, setLoading] = useState(initialOrders.length === 0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrders = async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/orders", { credentials: "include" });
      if (!res.ok) return;

      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch live admin orders list:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;

    fetchOrders();
    // Poll updates every 5s
    const interval = setInterval(() => {
      if (active) fetchOrders(false);
    }, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const getStatusBadge = (status: string) => {
    const s = (status || "pending").toLowerCase();
    switch (s) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Pending
          </span>
        );
      case "confirmed":
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        );
      case "completed":
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-red-50 text-red-700 border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
            {status}
          </span>
        );
    }
  };

  const filteredOrders = orders.filter((order) => {
    const status = (order.status || "pending").toLowerCase();
    const matchesStatus =
      selectedStatus === "all" ||
      status === selectedStatus ||
      (selectedStatus === "active" && status !== "delivered" && status !== "completed" && status !== "cancelled");

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;

    const orderNumber = (order.orderNumber || order.order_number || "").toLowerCase();
    const customerName = (order.customerInfo?.name || order.customer_name || "").toLowerCase();
    const customerPhone = (order.customerInfo?.phone || order.customer_phone || "").toLowerCase();
    const transactionId = (order.transactionId || order.transaction_id || "").toLowerCase();

    const matchesSearch =
      orderNumber.includes(q) ||
      customerName.includes(q) ||
      customerPhone.includes(q) ||
      transactionId.includes(q);

    return matchesStatus && matchesSearch;
  });

  const pendingCount = orders.filter((o) => (o.status || "").toLowerCase() === "pending").length;
  const activeCount = orders.filter((o) => {
    const s = (o.status || "").toLowerCase();
    return s === "pending" || s === "confirmed" || s === "processing";
  }).length;

  return (
    <div className="space-y-4 pb-6">
      {/* Controls: Search, Filters & Refresh */}
      <div className="space-y-3">
        {/* Search Bar & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, customer, phone..."
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-stone-200 focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm text-stone-900 font-semibold placeholder:text-stone-400 outline-none shadow-xs"
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
          <button
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing}
            className="p-2.5 bg-white border border-stone-200 hover:bg-stone-50 active:scale-95 text-stone-600 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Refresh Orders"
            aria-label="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>

        {/* Filter Pills (Scrollable on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: "all", label: "All Orders", count: orders.length },
            { id: "pending", label: "Pending", count: pendingCount, highlight: pendingCount > 0 },
            { id: "active", label: "In Progress", count: activeCount },
            { id: "delivered", label: "Delivered", count: orders.filter((o) => (o.status || "").toLowerCase() === "delivered" || (o.status || "").toLowerCase() === "completed").length },
            { id: "cancelled", label: "Cancelled", count: orders.filter((o) => (o.status || "").toLowerCase() === "cancelled").length },
          ].map((tab) => {
            const isSelected = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer select-none active:scale-95 ${
                  isSelected
                    ? "bg-primary text-white shadow-xs shadow-primary/25"
                    : "bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : tab.highlight
                      ? "bg-red-500 text-white"
                      : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-12 text-center text-stone-400 font-medium bg-white rounded-2xl border border-stone-200">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading live orders...
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredOrders.length === 0 && (
        <div className="p-8 text-center text-stone-500 bg-white rounded-2xl border border-stone-200 space-y-3">
          <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="font-bold text-stone-800">No orders found</p>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            {searchQuery
              ? `No orders matching "${searchQuery}".`
              : selectedStatus !== "all"
              ? `No orders with status "${selectedStatus}".`
              : "No orders have been placed yet."}
          </p>
        </div>
      )}

      {/* ========================================================= */}
      {/* 📱 MOBILE VIEW: DEDICATED ORDER CARDS (Visible on < md) */}
      {/* ========================================================= */}
      {!loading && filteredOrders.length > 0 && (
        <div className="grid grid-cols-1 gap-3.5 md:hidden">
          {filteredOrders.map((order: any) => {
            const orderId = order.id || order._id;
            const customerName = order.customerInfo?.name || order.customer_name || "Customer";
            const customerPhone = order.customerInfo?.phone || order.customer_phone || "";
            const total = typeof order.totalAmount === "number" ? order.totalAmount : parseFloat(order.total_amount || "0");
            const orderNumber = order.orderNumber || order.order_number;
            const createdAt = order.createdAt || order.created_at;
            const paymentStatus = (order.paymentStatus || order.payment_status || "pending").toLowerCase();
            const paymentMethod = order.paymentMethod || order.payment_method || "cod";
            const transactionId = order.transactionId || order.transaction_id || "";
            const orderType = (order.orderType || order.order_type || "delivery").toLowerCase();
            const itemCount = Array.isArray(order.items) ? order.items.length : 0;

            return (
              <div
                key={orderId}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-4 space-y-3 relative transition-all active:border-stone-300"
              >
                {/* Card Top: Order Number, Date/Time & Status */}
                <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-stone-900 text-sm tracking-tight">
                        #{orderNumber}
                      </span>
                      {orderType === "delivery" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md border border-purple-200/60">
                          <Truck className="w-3 h-3" /> Delivery
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200/60">
                          <Store className="w-3 h-3" /> Pickup
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-stone-400 font-medium mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Customer & Payment details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Customer</span>
                    <p className="font-bold text-stone-900 truncate">{customerName}</p>
                    {customerPhone && (
                      <a
                        href={`tel:${customerPhone}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="w-3 h-3" />
                        {customerPhone}
                      </a>
                    )}
                  </div>

                  <div className="space-y-1 text-right">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Payment</span>
                    <p className="font-bold text-stone-800">
                      {paymentMethod === "qr" ? "QR Scan & Pay" : "Cash on Delivery"}
                    </p>
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      <span
                        className={`inline-block text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${
                          paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {paymentStatus === "paid" ? "✓ Paid" : "⏳ Unpaid"}
                      </span>
                      {transactionId && (
                        <span className="inline-block text-[9px] font-mono font-bold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded border border-stone-200 truncate max-w-[110px]" title={`Txn: ${transactionId}`}>
                          #{transactionId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Item count, Grand Total & Link to Details */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      {itemCount} {itemCount === 1 ? "Item" : "Items"}
                    </span>
                    <span className="text-base font-black text-primary">
                      Rs. {total.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {orderType === "delivery" && (
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `*🥩 Prime Cuts — Delivery Dispatch*\nOrder: #${orderNumber}\nCustomer: ${customerName} (${customerPhone})\n${order.address ? `Address: ${order.address}\n` : ""}${
                            order.latitude && order.longitude
                              ? `Google Maps: https://www.google.com/maps?q=${order.latitude},${order.longitude}\n`
                              : ""
                          }*Collect: Rs. ${total.toFixed(2)} (${paymentStatus === "paid" ? "PAID ONLINE" : "COLLECT CASH"})*`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-2 bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                        title="Dispatch to Rider on WhatsApp"
                      >
                        🛵 Dispatch
                      </a>
                    )}

                    <Link
                      to={`/admin/orders/${orderId}`}
                      className="flex items-center gap-1 px-3 py-2 bg-stone-900 text-white font-bold text-xs rounded-xl hover:bg-stone-800 active:scale-95 transition-all shadow-xs cursor-pointer"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 💻 DESKTOP VIEW: FULL DATA TABLE (Visible on >= md) */}
      {/* ========================================================= */}
      {!loading && filteredOrders.length > 0 && (
        <div className="hidden md:block bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-stone-50/90 border-b border-stone-200 text-stone-500 text-xs uppercase tracking-wider font-extrabold">
              <tr>
                <th className="p-4">Order #</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Type</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4">Total</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {filteredOrders.map((order: any) => {
                const orderId = order.id || order._id;
                const customerName = order.customerInfo?.name || order.customer_name || "Customer";
                const customerPhone = order.customerInfo?.phone || order.customer_phone || "";
                const total = typeof order.totalAmount === "number" ? order.totalAmount : parseFloat(order.total_amount || "0");
                const orderNumber = order.orderNumber || order.order_number;
                const createdAt = order.createdAt || order.created_at;
                const paymentStatus = (order.paymentStatus || order.payment_status || "pending").toLowerCase();
                const paymentMethod = order.paymentMethod || order.payment_method;
                const transactionId = order.transactionId || order.transaction_id || "";
                const orderType = order.orderType || order.order_type;

                return (
                  <tr key={orderId} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-4 font-black text-stone-900">
                      #{orderNumber}
                    </td>
                    <td className="p-4 text-xs font-medium text-stone-500 whitespace-nowrap">
                      <div>{new Date(createdAt).toLocaleDateString()}</div>
                      <div className="text-[11px] text-stone-400">
                        {new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-stone-800">{customerName}</p>
                      {customerPhone && (
                        <p className="text-xs text-stone-400">{customerPhone}</p>
                      )}
                    </td>
                    <td className="p-4 text-xs font-bold text-stone-600 capitalize">
                      {orderType === "delivery" ? (
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md border border-purple-200/60">
                          <Truck className="w-3 h-3" /> Delivery
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200/60">
                          <Store className="w-3 h-3" /> Pickup
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col text-xs font-semibold text-stone-600">
                        <span className="capitalize">{paymentMethod === "qr" ? "QR Pay" : "COD"}</span>
                        <span
                          className={`text-[10px] uppercase font-black ${
                            paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"
                          }`}
                        >
                          {paymentStatus}
                        </span>
                        {transactionId && (
                          <span className="text-[10px] font-mono text-stone-400 truncate max-w-[120px]" title={`Txn: ${transactionId}`}>
                            #{transactionId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="p-4 font-black text-stone-900">
                      Rs. {total.toFixed(2)}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/admin/orders/${orderId}`}
                        className="inline-flex items-center justify-center p-2 bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-black rounded-xl transition-colors cursor-pointer"
                        title="View Order"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
