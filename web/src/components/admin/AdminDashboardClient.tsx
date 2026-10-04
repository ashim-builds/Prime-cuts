import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Clock,
  ArrowRight,
  TrendingUp,
  Banknote,
  QrCode,
  Scale,
  Power,
  CheckCircle2,
  AlertCircle,
  Settings,
  Save,
  Loader2,
} from "lucide-react";
import { useAdminLive } from "../../context/AdminLiveContext";

interface AdminDashboardClientProps {
  initialTotalProducts?: number;
  initialAvailableProducts?: number;
  initialTotalOrders?: number;
  initialPendingOrders?: number;
  initialRecentOrders?: any[];
}

interface DailySummaryData {
  totalOrders: number;
  totalRevenue: number;
  totalCashRevenue: number;
  totalQrRevenue: number;
  totalKgSold: number;
  totalPiecesSold: number;
  categoryBreakdown: Record<string, { count: number; grams: number; revenue: number }>;
}

export default function AdminDashboardClient({
  initialTotalProducts = 0,
  initialAvailableProducts = 0,
  initialTotalOrders = 0,
  initialPendingOrders = 0,
  initialRecentOrders = [],
}: AdminDashboardClientProps) {
  const { stats, recentOrders } = useAdminLive();

  // Daily report & store status state
  const [dailySummary, setDailySummary] = useState<DailySummaryData | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const [storeStatus, setStoreStatus] = useState<{
    isOpen: boolean;
    mode: "auto" | "force_open" | "force_closed";
    openTime: string;
    closeTime: string;
    freeDeliveryThreshold: number;
    deliveryCharge: number;
    closedMessage: string;
    riderPhone: string;
  }>({
    isOpen: true,
    mode: "auto",
    openTime: "07:00",
    closeTime: "20:00",
    freeDeliveryThreshold: 899,
    deliveryCharge: 50,
    closedMessage: "Our butcher shop is currently closed. Accepting pre-orders for morning delivery!",
    riderPhone: "+9779714324919",
  });

  const [savingStore, setSavingStore] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);

  // Fetch Daily Summary
  const fetchDailySummary = async () => {
    try {
      const res = await fetch("/api/admin/reports/daily-summary");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.summary) {
          setDailySummary(json.summary);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch daily summary:", err);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Fetch Store Status
  const fetchStoreSettings = async () => {
    try {
      const res = await fetch("/api/store/status");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setStoreStatus({
            isOpen: Boolean(json.isOpen),
            mode: json.mode || "auto",
            openTime: json.openTime || "07:00",
            closeTime: json.closeTime || "20:00",
            freeDeliveryThreshold: Number(json.freeDeliveryThreshold || 899),
            deliveryCharge: Number(json.deliveryCharge || 50),
            closedMessage: json.closedMessage || "Shop is closed.",
            riderPhone: json.riderPhone || "+9779714324919",
          });
        }
      }
    } catch (err) {
      console.warn("Failed to load store settings:", err);
    }
  };

  useEffect(() => {
    fetchDailySummary();
    fetchStoreSettings();
  }, []);

  const handleUpdateStoreMode = async (newMode: "auto" | "force_open" | "force_closed") => {
    setSavingStore(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/admin/store/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: newMode,
          openTime: storeStatus.openTime,
          closeTime: storeStatus.closeTime,
          closedMessage: storeStatus.closedMessage,
          riderPhone: storeStatus.riderPhone,
          freeDeliveryThreshold: storeStatus.freeDeliveryThreshold,
          deliveryCharge: storeStatus.deliveryCharge,
        }),
      });
      if (res.ok) {
        setStoreStatus((prev) => ({ ...prev, mode: newMode }));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
        await fetchStoreSettings();
      }
    } catch (err) {
      console.error("Failed to update store mode:", err);
    } finally {
      setSavingStore(false);
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStore(true);
    try {
      const res = await fetch("/api/admin/store/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storeStatus),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setIsEditingSchedule(false);
        setTimeout(() => setSaveSuccess(false), 2000);
        await fetchStoreSettings();
      }
    } catch (err) {
      console.error("Failed to save schedule:", err);
    } finally {
      setSavingStore(false);
    }
  };

  const totalProducts = stats ? stats.totalProducts : initialTotalProducts;
  const availableProducts = stats ? stats.availableProducts : initialAvailableProducts;
  const totalOrders = stats ? stats.totalOrders : initialTotalOrders;
  const pendingOrders = stats ? stats.pendingOrders : initialPendingOrders;
  const displayOrders = recentOrders.length > 0 ? recentOrders : initialRecentOrders;

  return (
    <div className="space-y-6">
      {/* Header & Quick Store Status Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900">Admin Dashboard</h1>
          <p className="text-xs sm:text-sm text-stone-500 font-semibold mt-0.5">
            Prime Cuts Butcher House • Khudi Chowk, Pokhara
          </p>
        </div>

        {/* Store Open/Close Mode Control Card */}
        <div className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-sm border border-stone-200/80 flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 px-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                storeStatus.isOpen ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-xs font-black uppercase tracking-wider text-stone-800">
              {storeStatus.isOpen ? "Shop Open" : "Shop Closed"}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200/60">
            <button
              onClick={() => handleUpdateStoreMode("auto")}
              disabled={savingStore}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                storeStatus.mode === "auto"
                  ? "bg-white text-stone-900 shadow-xs font-black"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Auto (7AM-8PM)
            </button>
            <button
              onClick={() => handleUpdateStoreMode("force_open")}
              disabled={savingStore}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                storeStatus.mode === "force_open"
                  ? "bg-emerald-600 text-white shadow-xs font-black"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Force Open
            </button>
            <button
              onClick={() => handleUpdateStoreMode("force_closed")}
              disabled={savingStore}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                storeStatus.mode === "force_closed"
                  ? "bg-red-600 text-white shadow-xs font-black"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Force Closed
            </button>
          </div>

          <button
            onClick={() => setIsEditingSchedule(!isEditingSchedule)}
            className="p-1.5 text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors cursor-pointer"
            title="Configure Hours & Thresholds"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Schedule & Store Settings Drawer / Accordion */}
      {isEditingSchedule && (
        <form
          onSubmit={handleSaveSchedule}
          className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
            <h3 className="font-black text-sm text-stone-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" /> Store Schedule & Delivery Settings
            </h3>
            <span className="text-xs text-stone-400">Nepal Time (UTC+5:45)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Open Time (24h)</label>
              <input
                type="time"
                value={storeStatus.openTime}
                onChange={(e) => setStoreStatus({ ...storeStatus, openTime: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-stone-300 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Close Time (24h)</label>
              <input
                type="time"
                value={storeStatus.closeTime}
                onChange={(e) => setStoreStatus({ ...storeStatus, closeTime: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-stone-300 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Free Delivery Over (Rs.)</label>
              <input
                type="number"
                value={storeStatus.freeDeliveryThreshold}
                onChange={(e) =>
                  setStoreStatus({ ...storeStatus, freeDeliveryThreshold: Number(e.target.value) })
                }
                className="w-full h-10 px-3 rounded-xl border border-stone-300 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Delivery Charge (Rs.)</label>
              <input
                type="number"
                value={storeStatus.deliveryCharge}
                onChange={(e) =>
                  setStoreStatus({ ...storeStatus, deliveryCharge: Number(e.target.value) })
                }
                className="w-full h-10 px-3 rounded-xl border border-stone-300 font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditingSchedule(false)}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingStore}
              className="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {savingStore ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Schedule</span>
            </button>
          </div>
        </form>
      )}

      {/* Today's Sales & Meat Breakdown Report Card */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center border border-primary/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">Today's Sales & Meat Report</h3>
              <p className="text-xs text-stone-400">Live metrics for today's orders</p>
            </div>
          </div>
          <button
            onClick={fetchDailySummary}
            className="text-[11px] font-bold text-stone-400 hover:text-white underline cursor-pointer self-start sm:self-auto"
          >
            Refresh Summary
          </button>
        </div>

        {loadingSummary || !dailySummary ? (
          <div className="py-6 text-center text-stone-500 font-semibold text-xs">
            Calculating today's sales...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="bg-stone-800/60 p-4 rounded-2xl border border-stone-700/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Today's Revenue
              </span>
              <p className="text-xl sm:text-2xl font-black text-white">
                Rs. {dailySummary.totalRevenue.toFixed(2)}
              </p>
              <span className="text-[10px] text-stone-400 mt-1 block">
                {dailySummary.totalOrders} total orders today
              </span>
            </div>

            {/* Total Meat Sold */}
            <div className="bg-stone-800/60 p-4 rounded-2xl border border-stone-700/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-primary" /> Total Meat Sold
              </span>
              <p className="text-xl sm:text-2xl font-black text-emerald-400">
                {dailySummary.totalKgSold} kg
              </p>
              <span className="text-[10px] text-stone-400 mt-1 block">
                + {dailySummary.totalPiecesSold} items / eggs
              </span>
            </div>

            {/* QR / Online Revenue */}
            <div className="bg-stone-800/60 p-4 rounded-2xl border border-stone-700/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-blue-400" /> QR / Online Paid
              </span>
              <p className="text-xl sm:text-2xl font-black text-blue-400">
                Rs. {dailySummary.totalQrRevenue.toFixed(2)}
              </p>
              <span className="text-[10px] text-stone-400 mt-1 block">
                {dailySummary.totalRevenue > 0
                  ? `${Math.round((dailySummary.totalQrRevenue / dailySummary.totalRevenue) * 100)}% of sales`
                  : "0%"}
              </span>
            </div>

            {/* Cash to Collect */}
            <div className="bg-stone-800/60 p-4 rounded-2xl border border-stone-700/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1 flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5 text-amber-400" /> Cash on Delivery
              </span>
              <p className="text-xl sm:text-2xl font-black text-amber-400">
                Rs. {dailySummary.totalCashRevenue.toFixed(2)}
              </p>
              <span className="text-[10px] text-stone-400 mt-1 block">Rider cash to deposit</span>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Grid (2x2 on Mobile, 4-col on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-stone-400">Total Products</p>
            <p className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5">{totalProducts}</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-stone-400">Available</p>
            <p className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5">{availableProducts}</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center shrink-0">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-stone-400">Total Orders</p>
            <p className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5">{totalOrders}</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-stone-400">Pending Orders</p>
            <p className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2 mt-0.5">
              {pendingOrders}
              {pendingOrders > 0 && (
                <span className="inline-flex w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-stone-100 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-black text-stone-900">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-primary font-bold text-xs sm:text-sm flex items-center gap-1 hover:underline cursor-pointer"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-4 md:p-0">
          <table className="block md:table w-full text-left">
            <thead className="hidden md:table-header-group bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="p-4 font-bold text-stone-500 text-sm">Order #</th>
                <th className="p-4 font-bold text-stone-500 text-sm">Customer</th>
                <th className="p-4 font-bold text-stone-500 text-sm">Amount</th>
                <th className="p-4 font-bold text-stone-500 text-sm">Status</th>
                <th className="p-4 font-bold text-stone-500 text-sm">Type</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group divide-y divide-stone-100 md:divide-y-0">
              {displayOrders.length === 0 ? (
                <tr className="block md:table-row bg-white md:bg-transparent">
                  <td
                    colSpan={5}
                    className="block md:table-cell p-8 text-center text-stone-400 font-medium"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                displayOrders.map((order: any) => {
                  const orderId = order.id || order._id;
                  const customerName = order.customerInfo?.name || order.customer_name || "Customer";
                  const total =
                    typeof order.totalAmount === "number"
                      ? order.totalAmount
                      : parseFloat(order.total_amount || "0");
                  return (
                    <tr
                      key={orderId}
                      className="block md:table-row bg-white md:bg-transparent border border-stone-150 md:border-0 rounded-xl p-4 mb-4 md:mb-0 space-y-2.5 md:space-y-0 relative shadow-sm md:shadow-none hover:bg-stone-50 transition-colors"
                    >
                      <td className="flex md:table-cell justify-between items-center p-0 md:p-4 border-b border-stone-100 md:border-0 pb-2 md:pb-0">
                        <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">
                          Order #
                        </span>
                        <Link
                          to={`/admin/orders/${orderId}`}
                          className="font-bold text-primary hover:underline cursor-pointer"
                        >
                          {order.orderNumber || order.order_number}
                        </Link>
                      </td>
                      <td className="flex md:table-cell justify-between items-center p-0 md:p-4 border-b border-stone-100 md:border-0 pb-2 md:pb-0 font-bold text-stone-700">
                        <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">
                          Customer
                        </span>
                        <span>{customerName}</span>
                      </td>
                      <td className="flex md:table-cell justify-between items-center p-0 md:p-4 border-b border-stone-100 md:border-0 pb-2 md:pb-0 font-black text-stone-900">
                        <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">
                          Amount
                        </span>
                        <span>Rs. {total.toFixed(2)}</span>
                      </td>
                      <td className="flex md:table-cell justify-between items-center p-0 md:p-4 border-b border-stone-100 md:border-0 pb-2 md:pb-0">
                        <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">
                          Status
                        </span>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                            order.status === "delivered" || order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : order.status === "ready"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="flex md:table-cell justify-between items-center p-0 md:p-4">
                        <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">
                          Type
                        </span>
                        <span className="capitalize font-semibold text-xs text-stone-600">
                          {order.orderType || order.order_type}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
