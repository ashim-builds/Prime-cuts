import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Truck, Store, MapPin, User, Phone, MessageCircle, ShoppingBag } from "lucide-react";
import CopyOrderButton from "../components/CopyOrderButton";
import LiveOrderSection from "../components/LiveOrderSection";
import PushNotificationSetup from "../components/PushNotificationSetup";

export default function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      if (!orderNumber) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${orderNumber}`);
        if (!res.ok) {
          setError("Order not found");
          return;
        }
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
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-stone-400 font-medium">Loading order details...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-black mb-2">Order Not Found</h2>
        <p className="text-stone-500 mb-6">{error || "The requested order does not exist."}</p>
        <Link to="/shop" className="px-6 py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90">
          Return to Shop
        </Link>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const whatsappPhone = "+9779865311559";
  const orderTextString = `*Prime Cuts (Butcher House)*
Order #${order.orderNumber}

*Customer:*
${order.customerInfo.name}
${order.customerInfo.phone}

*Items:*
${(order.items || []).map((item: any) => `- ${item.productName} (${item.selectedWeightInGrams ? (item.selectedWeightInGrams >= 1000 ? item.selectedWeightInGrams/1000 + 'kg' : item.selectedWeightInGrams + 'g') : (item.selectedVariantName || '')}) x ${item.qty} - Rs. ${item.calculatedPrice.toFixed(2)}`).join('\n')}

*Total:*
Rs. ${order.totalAmount.toFixed(2)}

*Order Type:*
${order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}${order.orderType === 'delivery' ? `\n\n*Address:*\n${order.address}` : ''}${order.notes ? `\n\n*Notes:*\n${order.notes}` : ''}`;

  const whatsappUrl = `https://wa.me/${whatsappPhone.replace('+', '')}?text=${encodeURIComponent(orderTextString)}`;

  return (
    <div className="min-h-screen bg-[#fafafa] py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 text-center mb-8">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-black mb-2">Order Confirmed!</h1>
          <p className="text-stone-500 font-medium">Thank you for your order, {order.customerInfo.name}.</p>
          <div className="mt-6 inline-flex items-center gap-2 bg-stone-100 px-4 py-2 rounded-lg">
            <span className="text-stone-500 font-semibold text-sm">Order Number:</span>
            <span className="font-black text-black tracking-wider">{order.orderNumber}</span>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          
          {/* Header Bar */}
          <div className="bg-stone-50 border-b border-stone-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-black text-stone-900 text-lg">Order Details</h2>
              <p className="text-xs font-semibold text-stone-400 mt-0.5">Please review your order information</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Date</p>
              <p className="font-bold text-black text-sm">{orderDate}</p>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Live Status & Payment Method Details */}
            <LiveOrderSection
              orderNumber={order.orderNumber}
              initialStatus={order.status}
              paymentMethod={order.paymentMethod || "cod"}
              paymentStatus={order.paymentStatus || "pending"}
            />

            {/* Customer & Delivery Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-stone-100">
              <div>
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4">Customer Details</h3>
                <div className="space-y-3 text-sm font-semibold text-stone-800">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-stone-400" /> {order.customerInfo.name}
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-stone-400" /> {order.customerInfo.phone}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4">Order Type</h3>
                <div className="space-y-3 text-sm font-semibold text-stone-800">
                  {order.orderType === 'delivery' ? (
                    <>
                      <div className="flex items-center gap-3 text-primary mb-3">
                        <Truck className="w-4 h-4" /> Delivery
                      </div>
                      <div className="flex items-start gap-3 mb-3 text-stone-600">
                        <MapPin className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" /> 
                        <span className="text-sm leading-snug">{order.address}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 text-primary">
                      <Store className="w-4 h-4" /> Store Pickup
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="pt-8 border-t border-stone-100">
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4">Order Items</h3>
              <div className="space-y-4">
                {(order.items || []).map((item: any, index: number) => {
                  const unitText = item.selectedWeightInGrams
                    ? (item.selectedWeightInGrams >= 1000 ? `${item.selectedWeightInGrams / 1000}kg` : `${item.selectedWeightInGrams}g`)
                    : item.selectedVariantName || "";
                  const priceDetail = item.pricePerKgAtTimeOfOrder
                    ? `Rs. ${item.pricePerKgAtTimeOfOrder}/kg`
                    : item.unitPriceAtTimeOfOrder
                    ? `Rs. ${item.unitPriceAtTimeOfOrder} each`
                    : "";
                  return (
                    <div key={index} className="flex justify-between items-center bg-stone-50 p-4 rounded-xl">
                      <div>
                        <h4 className="font-bold text-[15px] text-black">{item.productName}</h4>
                        <div className="text-[12px] font-bold text-stone-500 mt-1">
                          {unitText} × {item.qty}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-[15px] text-black">Rs. {item.calculatedPrice.toFixed(2)}</div>
                        {priceDetail && <div className="text-[11px] font-medium text-stone-400 mt-0.5">{priceDetail}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total */}
            <div className="pt-8 border-t border-stone-100 flex justify-between items-end">
              <div>
                <p className="text-stone-500 font-bold">Total Amount</p>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Price includes delivery fee if applicable</p>
              </div>
              <div className="text-3xl font-black text-black">
                Rs. {order.totalAmount.toFixed(2)}
              </div>
            </div>

          </div>
        </div>

        {/* WhatsApp & Action Buttons */}
        <div className="mt-8 flex flex-col gap-4">
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-5 bg-[#25D366] text-white rounded-xl font-black text-lg hover:bg-[#1ebd5a] transition-all shadow-lg shadow-[#25D366]/30 cursor-pointer"
          >
            <MessageCircle className="w-6 h-6 fill-white text-white" />
            Send Order via WhatsApp
          </a>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CopyOrderButton orderText={orderTextString} />
            
            <Link 
              to="/shop" 
              className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-stone-200 rounded-xl font-bold text-stone-700 hover:bg-stone-50 transition-colors shadow-sm cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              Continue Shopping
            </Link>

            <a 
              href={`tel:${whatsappPhone}`}
              className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-stone-200 rounded-xl font-bold text-stone-700 hover:bg-stone-50 transition-colors shadow-sm cursor-pointer"
            >
              <Phone className="w-5 h-5" />
              Contact Shop
            </a>
          </div>
        </div>

      </div>

      {order.userId && (
        <PushNotificationSetup userId={order.userId.toString()} />
      )}

    </div>
  );
}
