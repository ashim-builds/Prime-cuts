import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Package, Calendar } from "lucide-react";
import { useUser } from "../context/UserContext";

export default function OrdersPage() {
  const { user, isLoading } = useUser();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");

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

  if (isLoading || loadingOrders) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <p className="text-stone-500 font-medium">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
        <p className="text-red-500 font-medium">Failed to load orders: {error}</p>
        <Link to="/" className="mt-4 text-primary font-bold">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen pt-8 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-black mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-100 text-center">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-stone-400" />
            </div>
            <h2 className="text-xl font-bold text-black mb-2">No orders yet</h2>
            <p className="text-stone-500 mb-6">Looks like you haven't placed any orders yet.</p>
            <Link 
              to="/shop" 
              className="inline-flex bg-primary text-black font-black uppercase text-sm tracking-wide px-6 py-3 rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const orderId = order.id || order._id;
              const orderNumber = order.orderNumber || order.order_number;
              const totalAmount = typeof order.totalAmount === "number" ? order.totalAmount : parseFloat(order.total_amount || "0");
              const createdAt = order.createdAt || order.created_at;

              return (
                <Link 
                  to={`/order/${orderNumber}`}
                  key={orderId}
                  className="block bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-stone-100 hover:border-primary transition-colors group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block bg-stone-100 text-stone-800 text-xs font-bold px-2 py-1 rounded mb-2">
                        {orderNumber}
                      </span>
                      <h3 className="font-bold text-black text-lg">Rs. {totalAmount.toFixed(2)}</h3>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        order.status === 'delivered' || order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-stone-500 pt-4 border-t border-stone-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 font-medium group-hover:text-primary transition-colors">
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
