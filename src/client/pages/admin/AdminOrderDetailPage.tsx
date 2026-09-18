import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, MapPin, Package, Phone } from "lucide-react";
import StatusUpdater from "../../components/admin/StatusUpdater";
import PaymentStatusToggle from "../../components/admin/PaymentStatusToggle";
import StaticMapView from "../../components/StaticMapView";

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/orders/${id}`);
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-stone-400 font-medium">
        Loading order details...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <p className="text-red-500 font-bold">{error || "Order not found"}</p>
        <Link to="/admin/orders" className="inline-block px-4 py-2 bg-stone-200 text-stone-700 font-bold rounded-lg">
          Back to Orders
        </Link>
      </div>
    );
  }

  const orderId = order.id || order._id;
  const orderNumber = order.orderNumber || order.order_number;
  const createdAt = order.createdAt || order.created_at;
  const orderType = order.orderType || order.order_type;
  const customerName = order.customerInfo?.name || order.customer_name || "Customer";
  const customerPhone = order.customerInfo?.phone || order.customer_phone || "";
  const customerEmail = order.customerInfo?.email || order.customer_email || "";
  const totalAmount = typeof order.totalAmount === "number" ? order.totalAmount : parseFloat(order.total_amount || "0");
  const paymentMethod = order.paymentMethod || order.payment_method || "cod";
  const paymentStatus = order.paymentStatus || order.payment_status || "pending";
  const address = order.address || "";
  const notes = order.notes || "";
  const items = order.items || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/orders" className="p-2 bg-white rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </Link>
          <h1 className="text-3xl font-black text-stone-900">
            Order #{orderNumber}
          </h1>
        </div>
        <StatusUpdater 
          orderId={orderId.toString()} 
          currentStatus={order.status}
          onStatusChange={(newStatus) => setOrder((prev: any) => ({ ...prev, status: newStatus }))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Customer Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 space-y-4">
          <h2 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Customer Details
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-stone-400">Name</p>
              <p className="font-bold text-stone-800">{customerName}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400">Phone</p>
              <div className="flex items-center gap-2">
                <p className="font-bold text-stone-800">{customerPhone}</p>
                {customerPhone && (
                  <a href={`tel:${customerPhone}`} className="text-primary hover:underline text-sm font-bold">Call</a>
                )}
              </div>
            </div>
            {customerEmail && (
              <div>
                <p className="text-xs font-bold text-stone-400">Email</p>
                <p className="font-bold text-stone-800">{customerEmail}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 space-y-4">
          <h2 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> Order Info
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-stone-400">Date Placed</p>
              <p className="font-bold text-stone-800">{new Date(createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400">Type</p>
              <p className="font-bold text-stone-800 capitalize">{orderType}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400">Total Amount</p>
              <p className="font-black text-lg text-primary">Rs. {totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-stone-400">Payment Method</p>
              <p className="font-bold text-stone-800 capitalize">
                {paymentMethod === 'qr' ? 'QR Scan & Pay' : 'Cash on Delivery'}
              </p>
            </div>
            <div>
              <PaymentStatusToggle
                orderId={orderId.toString()}
                currentPaymentStatus={paymentStatus as "pending" | "paid"}
                onStatusChange={(newStatus) => setOrder((prev: any) => ({ ...prev, paymentStatus: newStatus }))}
              />
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 space-y-4">
          <h2 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Delivery Info
          </h2>
          <div className="space-y-3">
            {orderType === 'delivery' ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-stone-400">Address</p>
                  <p className="font-bold text-stone-800">{address}</p>
                </div>
                <StaticMapView address={address || ""} />
              </div>
            ) : (
              <div className="bg-orange-50 text-orange-600 p-3 rounded-lg font-bold text-sm text-center">
                Customer will pick up at store.
              </div>
            )}
            
            {notes && (
              <div>
                <p className="text-xs font-bold text-stone-400 mt-4">Order Notes</p>
                <p className="text-sm text-stone-600 bg-stone-50 p-3 rounded-lg mt-1 italic">{notes}</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Items */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 space-y-4">
        <h2 className="text-lg font-black text-stone-900 border-b border-stone-100 pb-2">Order Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50">
              <tr>
                <th className="p-3 font-bold text-stone-500 text-sm rounded-l-lg">Product</th>
                <th className="p-3 font-bold text-stone-500 text-sm">Size / Variant</th>
                <th className="p-3 font-bold text-stone-500 text-sm">Qty</th>
                <th className="p-3 font-bold text-stone-500 text-sm">Unit Price</th>
                <th className="p-3 font-bold text-stone-500 text-sm rounded-r-lg text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {items.map((item: any, i: number) => {
                const productName = item.productName || item.name || "Item";
                const calculatedPrice = typeof item.calculatedPrice === "number" 
                  ? item.calculatedPrice 
                  : (item.price || 0) * (item.qty || 1);

                return (
                  <tr key={i}>
                    <td className="p-3 font-bold text-stone-900">{productName}</td>
                    <td className="p-3 text-stone-600 font-medium">
                      {item.selectedWeightInGrams 
                        ? (item.selectedWeightInGrams >= 1000 
                            ? `${item.selectedWeightInGrams/1000}kg` 
                            : `${item.selectedWeightInGrams}g`)
                        : item.selectedVariantName || "-"}
                    </td>
                    <td className="p-3 font-black text-stone-900">x{item.qty}</td>
                    <td className="p-3 text-stone-500">
                      {item.pricePerKgAtTimeOfOrder 
                        ? `Rs. ${item.pricePerKgAtTimeOfOrder}/kg`
                        : item.unitPriceAtTimeOfOrder
                        ? `Rs. ${item.unitPriceAtTimeOfOrder}`
                        : "-"}
                    </td>
                    <td className="p-3 font-black text-stone-900 text-right">Rs. {calculatedPrice.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="p-4 text-right font-bold text-stone-500">Grand Total</td>
                <td className="p-4 text-right font-black text-xl text-primary">Rs. {totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
