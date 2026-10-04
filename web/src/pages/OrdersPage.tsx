import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Package,
  Calendar,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Store,
  Printer,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { useCart } from "../context/CartContext";
import { printThermalReceipt } from "../utils/printThermalReceipt";
import SEO from "../components/SEO";

export default function OrdersPage() {
  const { user, isLoading } = useUser();
  const { addWeightItem, addVariantItem, openCart } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login?from=/orders");
      return;
    }

    async function loadOrders() {
      if (!user) return;
      setLoadingOrders(true);
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.success && data.orders) {
          setOrders(data.orders);
        } else {
          setError(data.error || "Failed to load orders");
        }
      } catch (err) {
        setError("Network error loading orders");
      } finally {
        setLoadingOrders(false);
      }
    }

    if (user) {
      loadOrders();
    }
  }, [user, isLoading, navigate]);

  const handleReorder = (order: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setReorderingId(order.id || order._id);

    const items = order.items || [];
    for (const item of items) {
      if (item.selectedWeightInGrams) {
        addWeightItem(
          {
            id: item.productId || item.id || `reorder-${item.productName}`,
            name: item.productName || item.name,
            slug: item.slug || "meat-cut",
            priceType: "weight",
            pricePerKg: item.pricePerKgAtTimeOfOrder || item.unitPriceAtTimeOfOrder || item.price,
            image: item.image || "/images/meat_goat_bone.jpg",
          },
          item.selectedWeightInGrams,
          item.qty || 1
        );
      } else {
        addVariantItem(
          {
            id: item.productId || item.id || `reorder-${item.productName}`,
            name: item.productName || item.name,
            slug: item.slug || "meat-cut",
            priceType: "variant",
            image: item.image || "/images/meat_sausages.jpg",
          },
          item.selectedVariantName || item.variantName || "Standard",
          item.unitPriceAtTimeOfOrder || item.price || 0,
          item.qty || 1
        );
      }
    }

    setTimeout(() => {
      setReorderingId(null);
      openCart();
    }, 400);
  };

  const handlePrintSlip = (order: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    printThermalReceipt(order);
  };

  if (isLoading || loadingOrders) {
    return (
      <div className="min-h-[70vh] bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="text-stone-500 font-semibold text-sm animate-pulse flex items-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-primary" /> Loading your orders...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] bg-[#f8f9fa] flex flex-col items-center justify-center p-4 text-center">
        <p className="text-red-600 font-bold mb-4">{error}</p>
        <Link to="/" className="px-6 py-3 bg-primary text-white font-black rounded-xl text-sm shadow-md shadow-primary/20">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-stone-900 py-6 md:py-10">
      <SEO
        title="My Meat Orders & Live Tracking"
        description="Track your live fresh meat orders and view receipts from Prime Cuts Butcher House Pokhara."
        url="/orders"
      />
      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-red-50 px-2 py-0.5 rounded border border-red-100">
              Customer Account
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">My Meat Orders</h1>
          </div>
          <a
            href="/#shop-cuts"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order Fresh Meat</span>
          </a>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-stone-900 mb-2">No Past Orders Yet</h2>
            <p className="text-stone-500 text-xs sm:text-sm max-w-sm mx-auto mb-6 leading-relaxed">
              When you order fresh goat, chicken, sausages or eggs, your live tracking and receipts will appear here!
            </p>
            <a
              href="/#shop-cuts"
              className="inline-flex items-center gap-2 bg-primary text-white font-black uppercase text-xs tracking-wider px-6 py-3.5 rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Fresh Cuts</span>
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const orderId = order.id || order._id;
              const orderNumber = order.orderNumber || order.order_number;
              const totalAmount = Number(order.totalAmount || order.total_amount || 0);
              const createdAt = order.createdAt || order.created_at;
              const items = order.items || [];

              const isReordering = reorderingId === orderId;

              let statusBadge = "bg-amber-50 text-amber-800 border-amber-200";
              let StatusIcon = Clock;

              if (order.status === "delivered" || order.status === "completed") {
                statusBadge = "bg-emerald-50 text-emerald-800 border-emerald-200";
                StatusIcon = CheckCircle2;
              } else if (order.status === "cancelled") {
                statusBadge = "bg-red-50 text-red-800 border-red-200";
                StatusIcon = XCircle;
              } else if (order.status === "ready") {
                statusBadge = "bg-purple-50 text-purple-800 border-purple-200";
                StatusIcon = Package;
              } else if (order.status === "confirmed" || order.status === "preparing") {
                statusBadge = "bg-blue-50 text-blue-800 border-blue-200";
                StatusIcon = Clock;
              }

              return (
                <div
                  key={orderId}
                  className="bg-white border border-stone-200 hover:border-stone-300 rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all shadow-xs"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-3.5 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
                          #{orderNumber}
                        </span>
                        <span className="text-xs text-stone-500 font-semibold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-stone-400" />
                          {new Date(createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wide px-3 py-1 rounded-full border ${statusBadge}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{order.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Items List Preview - Strictly Single-Line Per Item */}
                  <div className="py-2.5 space-y-1.5 bg-stone-50/80 rounded-xl px-3 my-2 border border-stone-100">
                    {items.map((item: any, idx: number) => {
                      const weightUnit = item.selectedWeightInGrams
                        ? item.selectedWeightInGrams >= 1000
                          ? `${item.selectedWeightInGrams / 1000}kg`
                          : `${item.selectedWeightInGrams}g`
                        : item.selectedVariantName || "";

                      return (
                        <div key={idx} className="flex justify-between items-center text-xs gap-2">
                          <div className="flex items-center gap-1.5 text-stone-800 min-w-0 flex-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            <span className="font-bold truncate text-[11.5px]">
                              {item.productName || item.name}
                            </span>
                            <span className="text-stone-500 text-[10.5px] font-semibold shrink-0 whitespace-nowrap">
                              ({weightUnit} × {item.qty})
                            </span>
                          </div>
                          <span className="font-extrabold text-stone-900 text-xs shrink-0 whitespace-nowrap">
                            Rs. {Number(item.calculatedPrice || item.price || 0).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total & Action Buttons - Single Line Total & Clean Responsive Buttons */}
                  <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0">
                      <div className="flex items-baseline gap-1.5 truncate">
                        <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider shrink-0">
                          Total:
                        </span>
                        <span className="text-base sm:text-lg font-black text-stone-900 shrink-0">
                          Rs. {totalAmount.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-[9.5px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 shrink-0 whitespace-nowrap">
                        {order.orderType === "delivery" ? "Delivery" : "Pickup"} • {order.paymentMethod?.toUpperCase() || "COD"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2">
                      {/* Reorder Button */}
                      <button
                        onClick={(e) => handleReorder(order, e)}
                        disabled={isReordering}
                        className="col-span-1 sm:flex-none py-1.5 px-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-transform active:scale-95 shadow-xs cursor-pointer whitespace-nowrap"
                      >
                        <RotateCcw className={`w-3 h-3 ${isReordering ? "animate-spin" : ""}`} />
                        <span>{isReordering ? "Adding..." : "Reorder"}</span>
                      </button>

                      {/* Print Receipt Slip */}
                      <button
                        onClick={(e) => handlePrintSlip(order, e)}
                        className="col-span-1 sm:flex-none py-1.5 px-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-stone-200 whitespace-nowrap"
                        title="Print POS / Kitchen Receipt"
                      >
                        <Printer className="w-3 h-3 text-stone-500" />
                        <span>Receipt</span>
                      </button>

                      {/* Track / Details Button */}
                      <Link
                        to={`/orders/${orderNumber}`}
                        className="col-span-1 sm:flex-none py-1.5 px-3 bg-stone-900 hover:bg-black text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-0.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        <span>Track</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
