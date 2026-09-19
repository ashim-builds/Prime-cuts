import React, { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { Truck, ArrowRight, Loader2, MapPin, Edit3, QrCode, Banknote, X, Pin, CheckCircle, Phone } from "lucide-react";

// Lazy load map to avoid SSR/bundle issues
const MapPicker = lazy(() => import("../components/MapPicker"));

const NAME_REGEX = /^[a-zA-Z\s]{2,60}$/;
const PHONE_REGEX = /^9\d{9}$/;

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    orderType: "delivery" as "pickup" | "delivery",
    paymentMethod: "cod" as "cod" | "qr",
    address: "",
    notes: ""
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showManualAddress, setShowManualAddress] = useState(false);

  // Autofill user details when loaded
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || "",
        phone: prev.phone || user.phone || "",
        email: prev.email || user.email || ""
      }));
    }
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-black mb-4">Your cart is empty!</h2>
        <button onClick={() => navigate("/shop")} className="px-6 py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 cursor-pointer">
          Go to Shop
        </button>
      </div>
    );
  }

  const DELIVERY_FEE = cartTotal < 100 ? 10 : 0;
  const grandTotal = cartTotal + (formData.orderType === "delivery" ? DELIVERY_FEE : 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let cleanValue = value;

    if (name === "name") {
      cleanValue = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (name === "phone") {
      cleanValue = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "email") {
      cleanValue = value.replace(/\s/g, "");
    } else if (name === "notes" && value.length > 100) {
      return;
    }

    setFormData({ ...formData, [name]: cleanValue });
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddressSelect = (address: string) => {
    setFormData(prev => ({ ...prev, address }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!NAME_REGEX.test(formData.name.trim())) {
      errors.name = "Name must contain only letters and spaces (2–60 characters), no numbers.";
    }
    if (!PHONE_REGEX.test(formData.phone.trim())) {
      errors.phone = "Phone number must be exactly 10 digits and start with 9 (e.g. 9812345678).";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (formData.orderType === "delivery" && formData.address.trim().length < 5) {
      errors.address = "Please enter a valid delivery address (at least 5 characters).";
    }
    if (formData.notes.length > 100) {
      errors.notes = "Notes cannot exceed 100 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildPayload = () => ({
    customerInfo: {
      name: formData.name,
      phone: formData.phone,
      email: formData.email
    },
    orderType: formData.orderType,
    paymentMethod: formData.paymentMethod,
    address: formData.orderType === "delivery" ? formData.address : undefined,
    notes: formData.notes || undefined,
    items: items.map(item => ({
      productId: item.product.id,
      qty: item.qty,
      priceType: item.product.priceType,
      weightInGrams: item.weightInGrams,
      variantName: item.variantName,
    }))
  });

  const submitOrder = async (payload: any) => {
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success && data.orderNumber) {
        clearCart();
        navigate(`/order/${data.orderNumber}`);
      } else {
        setErrorMsg(data.error || "Something went wrong.");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validateForm()) {
      setErrorMsg("Please fix the errors below before placing your order.");
      return;
    }

    if (formData.paymentMethod === "qr") {
      setPendingPayload(buildPayload());
      setShowQrModal(true);
      return;
    }

    await submitOrder(buildPayload());
  };

  const handleQrConfirm = async () => {
    setShowQrModal(false);
    if (pendingPayload) {
      await submitOrder(pendingPayload);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-2xl md:text-4xl font-black text-black mb-6 md:mb-8">CHECKOUT</h1>

        {/* QR Payment Modal */}
        {showQrModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 md:p-8 relative">
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <QrCode className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-xl font-black text-stone-900">QR Scan & Pay</h3>
                <p className="text-sm text-stone-500 font-medium mt-1">Scan the QR code to pay</p>
              </div>

              <div className="flex flex-col items-center gap-3 mb-6">
                <div className="w-48 h-48 bg-stone-100 border-2 border-dashed border-stone-300 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-stone-400 mx-auto mb-2" />
                    <p className="text-xs text-stone-400 font-semibold">Shop QR Code</p>
                    <p className="text-[10px] text-stone-400">(Add your QR image here)</p>
                  </div>
                </div>
                <div className="text-center bg-amber-50 rounded-xl p-3 border border-amber-100 w-full">
                  <p className="text-sm font-black text-stone-900">Amount to Pay</p>
                  <p className="text-2xl font-black text-primary">Rs. {grandTotal.toFixed(2)}</p>
                </div>
              </div>

              <div className="text-xs text-stone-500 font-medium bg-stone-50 rounded-xl p-3 mb-5 space-y-2">
                <p className="flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span><strong>Note:</strong> Use order reference in payment remark</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  <span>Screenshot your payment for confirmation</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>Contact us if payment fails</span>
                </p>
              </div>

              <button
                onClick={handleQrConfirm}
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-black font-black rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</>
                ) : (
                  <>I&apos;ve Paid — Place Order <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <form onSubmit={handleSubmit} className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-stone-100 flex flex-col gap-7">
              
              {errorMsg && (
                <div className="p-4 bg-red-50 text-red-600 font-semibold rounded-xl border border-red-100 text-sm">
                  {errorMsg}
                </div>
              )}

              {/* 1. Customer Details */}
              <div>
                <h3 className="text-base md:text-lg font-black text-black mb-3">1. Your Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-600 mb-1">Full Name *</label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full h-12 px-4 rounded-xl border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-black font-medium text-sm ${
                        fieldErrors.name ? "border-red-400 bg-red-50" : "border-stone-300"
                      }`}
                      placeholder="Ram Bahadur"
                    />
                    {fieldErrors.name && (
                      <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.name}</p>
                    )}
                    <p className="text-[10px] text-stone-400 mt-0.5">Letters and spaces only (no numbers)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-600 mb-1">Phone Number *</label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={10}
                      className={`w-full h-12 px-4 rounded-xl border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-black font-medium text-sm ${
                        fieldErrors.phone ? "border-red-400 bg-red-50" : "border-stone-300"
                      }`}
                      placeholder="9812345678"
                    />
                    {fieldErrors.phone && (
                      <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.phone}</p>
                    )}
                    <p className="text-[10px] text-stone-400 mt-0.5">10 digits, starting with 9</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-stone-600 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full h-12 px-4 rounded-xl border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-black font-medium text-sm ${
                        fieldErrors.email ? "border-red-400 bg-red-50" : "border-stone-300"
                      }`}
                      placeholder="ram@example.com"
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Delivery Address */}
              <div>
                <h3 className="text-base md:text-lg font-black text-black mb-3">2. Pin Your Delivery Address</h3>
                
                <Suspense fallback={
                  <div className="h-[300px] rounded-2xl bg-stone-100 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                }>
                  <MapPicker
                    onAddressSelect={handleAddressSelect}
                    initialAddress={formData.address}
                  />
                </Suspense>

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowManualAddress(!showManualAddress)}
                    className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 font-bold transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    {showManualAddress ? "Hide manual entry" : "Type address manually instead"}
                  </button>
                  {showManualAddress && (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      maxLength={250}
                      className={`mt-2 w-full p-4 rounded-xl border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-black font-medium text-sm ${
                        fieldErrors.address ? "border-red-400 bg-red-50" : "border-stone-300"
                      }`}
                      placeholder="Enter your full delivery address, nearby landmarks..."
                    />
                  )}
                  {fieldErrors.address && (
                    <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.address}</p>
                  )}
                </div>
              </div>

              {/* 3. Payment Method */}
              <div>
                <h3 className="text-base md:text-lg font-black text-black mb-3">
                  3. Payment Method
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "cod" }))}
                    className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 font-bold transition-all text-sm cursor-pointer ${
                      formData.paymentMethod === "cod"
                        ? "border-primary bg-primary/10 text-black"
                        : "border-stone-200 text-stone-500 hover:border-stone-300"
                    }`}
                  >
                    <Banknote className="w-6 h-6" />
                    <span>Cash on Delivery</span>
                    <span className="text-[10px] font-semibold text-stone-400">Pay when received</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "qr" }))}
                    className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 font-bold transition-all text-sm cursor-pointer ${
                      formData.paymentMethod === "qr"
                        ? "border-primary bg-primary/10 text-black"
                        : "border-stone-200 text-stone-500 hover:border-stone-300"
                    }`}
                  >
                    <QrCode className="w-6 h-6" />
                    <span>QR Scan & Pay</span>
                    <span className="text-[10px] font-semibold text-stone-400">Fonepay / eSewa / Bank</span>
                  </button>
                </div>
              </div>

              {/* 4. Order Notes */}
              <div>
                <h3 className="text-base md:text-lg font-black text-black mb-3">
                  4. Order Notes (Optional)
                </h3>
                <div className="relative">
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    maxLength={100}
                    className={`w-full p-4 rounded-xl border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-black font-medium text-sm ${
                      fieldErrors.notes ? "border-red-400 bg-red-50" : "border-stone-300"
                    }`}
                    placeholder="Any special requests? Let us know!"
                  />
                  <span className={`absolute bottom-3 right-3 text-xs font-bold ${
                    formData.notes.length >= 90 ? "text-red-500" : "text-stone-400"
                  }`}>
                    {formData.notes.length}/100
                  </span>
                </div>
                {fieldErrors.notes && (
                  <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.notes}</p>
                )}
              </div>

            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-stone-100 lg:sticky lg:top-28">
              <h3 className="text-lg font-black text-black mb-4 border-b border-stone-100 pb-4">Order Summary</h3>
              
              <div className="flex flex-col gap-3 mb-5 max-h-[35vh] overflow-y-auto pr-1">
                {items.map(item => {
                  let itemTotal = 0;
                  let unitText = "";
                  if (item.product.priceType === 'weight' && item.weightInGrams && item.product.pricePerKg) {
                    itemTotal = (item.weightInGrams / 1000) * item.product.pricePerKg * item.qty;
                    unitText = item.weightInGrams >= 1000 ? `${item.weightInGrams/1000}kg` : `${item.weightInGrams}g`;
                  } else if (item.product.priceType === 'variant' && item.variantPrice) {
                    itemTotal = item.variantPrice * item.qty;
                    unitText = item.variantName || "";
                  }
                  return (
                    <div key={item.cartItemId} className="flex gap-3 items-center">
                      <div className="relative w-14 h-14 bg-stone-50 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[13px] text-black leading-tight truncate">{item.product.name}</h4>
                        <div className="text-[11px] font-bold text-stone-400 mt-0.5">{unitText} × {item.qty}</div>
                      </div>
                      <span className="font-black text-[13px] text-black shrink-0">Rs. {itemTotal.toFixed(0)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="border-t border-stone-100 pt-4 mb-5 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500 font-bold">Subtotal</span>
                  <span className="font-bold text-stone-800">Rs. {cartTotal.toFixed(2)}</span>
                </div>

                {formData.orderType === "delivery" && (
                  <div className="flex justify-between text-sm items-start">
                    <span className="text-stone-500 font-bold">Delivery</span>
                    {DELIVERY_FEE === 0 ? (
                      <span className="font-bold text-green-600 flex items-center gap-1">
                        FREE <CheckCircle className="w-3.5 h-3.5 inline" />
                      </span>
                    ) : (
                      <div className="text-right">
                        <span className="font-bold text-stone-800">Rs. 10.00</span>
                        <p className="text-[10px] text-stone-400">Min. order Rs. 100</p>
                      </div>
                    )}
                  </div>
                )}

                {formData.orderType === "delivery" && DELIVERY_FEE > 0 && (
                  <p className="text-[11px] text-amber-600 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 shrink-0" /> Add Rs. {(100 - cartTotal).toFixed(0)} more for free delivery!
                  </p>
                )}

                <div className="flex justify-between text-sm items-center">
                  <span className="text-stone-500 font-bold">Payment</span>
                  <span className="font-bold text-stone-800 flex items-center gap-1">
                    {formData.paymentMethod === "qr" ? (
                      <><QrCode className="w-3.5 h-3.5" /> QR Scan & Pay</>
                    ) : (
                      <><Banknote className="w-3.5 h-3.5" /> Cash on Delivery</>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-stone-100">
                  <span className="font-black text-stone-900">Total</span>
                  <span className="text-xl md:text-2xl font-black text-black">Rs. {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery address preview */}
              {formData.orderType === "delivery" && formData.address && (
                <div className="flex items-start gap-2 bg-stone-50 rounded-xl p-3 mb-4 border border-stone-100">
                  <MapPin className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-stone-600 font-medium leading-snug line-clamp-2">{formData.address}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 text-sm cursor-pointer ${
                  isSubmitting ? "bg-stone-200 text-stone-400 cursor-wait" : "bg-primary text-white hover:bg-primary-hover shadow-xl shadow-primary/30 active:scale-98"
                }`}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : formData.paymentMethod === "qr" ? (
                  <><QrCode className="w-5 h-5" /> Pay & Place Meat Order</>
                ) : (
                  <>Place Meat Order <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
