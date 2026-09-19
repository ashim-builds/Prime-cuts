import React from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, Clock, ArrowRight } from "lucide-react";
import { useAdminLive } from "../../context/AdminLiveContext";

interface AdminDashboardClientProps {
  initialTotalProducts?: number;
  initialAvailableProducts?: number;
  initialTotalOrders?: number;
  initialPendingOrders?: number;
  initialRecentOrders?: any[];
}

export default function AdminDashboardClient({
  initialTotalProducts = 0,
  initialAvailableProducts = 0,
  initialTotalOrders = 0,
  initialPendingOrders = 0,
  initialRecentOrders = [],
}: AdminDashboardClientProps) {
  const { stats, recentOrders } = useAdminLive();

  // Use live data if loaded, otherwise fall back to initial props
  const totalProducts = stats ? stats.totalProducts : initialTotalProducts;
  const availableProducts = stats ? stats.availableProducts : initialAvailableProducts;
  const totalOrders = stats ? stats.totalOrders : initialTotalOrders;
  const pendingOrders = stats ? stats.pendingOrders : initialPendingOrders;
  const displayOrders = recentOrders.length > 0 ? recentOrders : initialRecentOrders;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-stone-900">Dashboard</h1>

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
        <div className="p-6 border-b border-stone-100 flex justify-between items-center">
          <h2 className="text-xl font-black text-stone-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-primary font-bold text-sm flex items-center gap-1 hover:underline cursor-pointer">
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
                  <td colSpan={5} className="block md:table-cell p-8 text-center text-stone-400 font-medium">No orders found.</td>
                </tr>
              ) : (
                displayOrders.map((order: any) => {
                  const orderId = order.id || order._id;
                  const customerName = order.customerInfo?.name || order.customer_name || "Customer";
                  const total = typeof order.totalAmount === "number" ? order.totalAmount : parseFloat(order.total_amount || "0");
                  return (
                    <tr key={orderId} className="block md:table-row bg-white md:bg-transparent border border-stone-150 md:border-0 rounded-xl p-4 mb-4 md:mb-0 space-y-2.5 md:space-y-0 relative shadow-sm md:shadow-none hover:bg-stone-50 transition-colors">
                      <td className="flex md:table-cell justify-between items-center p-0 md:p-4 border-b border-stone-100 md:border-0 pb-2 md:pb-0">
                        <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">Order #</span>
                        <Link to={`/admin/orders/${orderId}`} className="font-bold text-primary hover:underline cursor-pointer">
                          {order.orderNumber || order.order_number}
                        </Link>
                      </td>
                      <td className="flex md:table-cell justify-between items-center p-0 md:p-4 border-b border-stone-100 md:border-0 pb-2 md:pb-0 font-bold text-stone-700">
                        <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">Customer</span>
                        <span>{customerName}</span>
                      </td>
                      <td className="flex md:table-cell justify-between items-center p-0 md:p-4 border-b border-stone-100 md:border-0 pb-2 md:pb-0 font-black text-stone-900">
                        <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">Amount</span>
                        <span>Rs. {total.toFixed(2)}</span>
                      </td>
                      <td className="flex md:table-cell justify-between items-center p-0 md:p-4 border-b border-stone-100 md:border-0 pb-2 md:pb-0">
                        <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">Status</span>
                        <span className={`px-2 py-1 rounded-md text-xs font-bold capitalize ${order.status === 'pending' ? 'bg-orange-100 text-orange-600 animate-pulse' :
                          order.status === 'completed' || order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-600'
                          }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="flex md:table-cell justify-between items-center p-0 md:p-4 last:border-0 pt-1 md:pt-0 text-sm font-bold text-stone-500 capitalize">
                        <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">Type</span>
                        <span>{order.orderType || order.order_type}</span>
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
