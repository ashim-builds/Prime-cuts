import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

interface AdminOrdersClientProps {
  initialOrders?: any[];
}

export default function AdminOrdersClient({ initialOrders = [] }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [loading, setLoading] = useState(initialOrders.length === 0);

  useEffect(() => {
    let active = true;

    async function fetchOrders() {
      try {
        const res = await fetch("/api/admin/orders");
        if (!res.ok) return;

        const data = await res.json();
        if (active && data.success && data.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Failed to fetch live admin orders list:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchOrders();
    // Poll updates every 5s
    const interval = setInterval(fetchOrders, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
      <div className="p-4 md:p-0">
        <table className="block md:table w-full text-left">
          <thead className="hidden md:table-header-group bg-stone-50 border-b border-stone-100">
            <tr>
              <th className="p-4 font-bold text-stone-500 text-sm">Order Number</th>
              <th className="p-4 font-bold text-stone-500 text-sm">Date</th>
              <th className="p-4 font-bold text-stone-500 text-sm">Customer</th>
              <th className="p-4 font-bold text-stone-500 text-sm">Type</th>
              <th className="p-4 font-bold text-stone-500 text-sm">Payment</th>
              <th className="p-4 font-bold text-stone-500 text-sm">Status</th>
              <th className="p-4 font-bold text-stone-500 text-sm">Total</th>
              <th className="p-4 font-bold text-stone-500 text-sm">Action</th>
            </tr>
          </thead>
          <tbody className="block md:table-row-group divide-y divide-stone-100 md:divide-y-0">
            {orders.map((order: any) => {
              const orderId = order.id || order._id;
              const customerName = order.customerInfo?.name || order.customer_name || "Customer";
              const total = typeof order.totalAmount === "number" ? order.totalAmount : parseFloat(order.total_amount || "0");
              const orderNumber = order.orderNumber || order.order_number;
              const createdAt = order.createdAt || order.created_at;
              const paymentStatus = order.paymentStatus || order.payment_status;
              const paymentMethod = order.paymentMethod || order.payment_method;
              const orderType = order.orderType || order.order_type;

              return (
                <tr key={orderId} className="block md:table-row bg-white md:bg-transparent border border-stone-150 md:border-0 rounded-xl p-4 mb-4 md:mb-0 space-y-2.5 md:space-y-0 relative shadow-sm md:shadow-none hover:bg-stone-50 transition-colors">
                  <td className="flex md:table-cell justify-between items-center p-0 md:p-4 border-b border-stone-100 md:border-0 pb-2 md:pb-0">
                    <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">Order Number</span>
                    <span className="font-black text-stone-900">{orderNumber}</span>
                  </td>
                  <td className="flex md:table-cell justify-between items-center p-0 md:p-4 border-b border-stone-100 md:border-0 pb-2 md:pb-0 text-sm font-medium text-stone-500">
                    <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">Placed At</span>
                    <span className="text-right md:text-left whitespace-nowrap">
                      <div>{new Date(createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </span>
                  </td>
                  <td className="flex md:table-cell justify-between items-center p-0 md:p-4 border-b border-stone-100 md:border-0 pb-2 md:pb-0 font-bold text-stone-700">
                    <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">Customer</span>
                    <span>{customerName}</span>
                  </td>
                  <td className="flex md:table-cell justify-between items-center p-0 md:p-4 border-b border-stone-100 md:border-0 pb-2 md:pb-0 text-sm font-bold text-stone-500 capitalize">
                    <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">Type</span>
                    <span>{orderType}</span>
                  </td>
                  <td className="flex md:table-cell justify-between items-center p-0 md:p-4 border-b border-stone-100 md:border-0 pb-2 md:pb-0">
                    <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">Payment</span>
                    <div className="flex flex-col items-end md:items-start text-xs font-semibold text-stone-600">
                      <span className="capitalize">{paymentMethod === 'qr' ? 'QR Pay' : 'COD'}</span>
                      <span className={`text-[10px] uppercase font-bold ${paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'
                        }`}>
                        {paymentStatus}
                      </span>
                    </div>
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
                  <td className="flex md:table-cell justify-between items-center p-0 md:p-4 border-b border-stone-100 md:border-0 pb-2 md:pb-0 font-black text-stone-900">
                    <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">Total</span>
                    <span>Rs. {total.toFixed(2)}</span>
                  </td>
                  <td className="flex md:table-cell justify-between items-center p-0 md:p-4 last:border-0 pt-1 md:pt-0">
                    <span className="md:hidden font-bold text-stone-400 text-[10px] uppercase tracking-wider">Action</span>
                    <Link
                      to={`/admin/orders/${orderId}`}
                      className="inline-flex items-center justify-center p-2 bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-black rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {!loading && orders.length === 0 && (
              <tr className="block md:table-row bg-white md:bg-transparent">
                <td colSpan={8} className="block md:table-cell p-8 text-center text-stone-400 font-medium">
                  No orders have been placed yet.
                </td>
              </tr>
            )}
            {loading && (
              <tr className="block md:table-row bg-white md:bg-transparent">
                <td colSpan={8} className="block md:table-cell p-8 text-center text-stone-400 font-medium">
                  Loading orders...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
