import React, { useState, useEffect, lazy, Suspense, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import {
  Truck,
  ArrowRight,
  Loader2,
  MapPin,
  Edit3,
  QrCode,
  Banknote,
  X,
  Pin,
  CheckCircle,
  Phone,
  Lock,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Store,
} from "lucide-react";

// Lazy load map to avoid SSR/bundle issues
const MapPicker = lazy(() => import("../components/MapPicker"));

const NAME_REGEX = /^[a-zA-Z\s]{2,60}$/;
const PHONE_REGEX = /^9\d{9}$/;

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const { user, isLoading } = useUser();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any | null>(null);

  // Dynamic QR Specific States
  const [qrRefCode, setQrRefCode] = useState("");
  const [qrTransactionId, setQrTransactionId] = useState("");
  const [qrError, setQrError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [qrSecondsLeft, setQrSecondsLeft] = useState(600); // 10 mins

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    orderType: "delivery" as "pickup" | "delivery",
    paymentMethod: "cod" as "cod" | "qr",
    address: "",
    latitude: null as number | null,
    longitude: null as number | null,
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

  // If user is not logged in, redirect to login page
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login?from=/checkout", { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Countdown timer for dynamic QR session
  useEffect(() => {
    if (!showQrModal) return;

    setQrSecondsLeft(600);
    const interval = setInterval(() => {
      setQrSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showQrModal, qrRefCode]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-bold text-stone-600">Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-primary mb-4 shadow-sm">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-stone-900 mb-2">Login Required to Order</h2>
        <p className="text-sm text-stone-500 font-medium mb-6 leading-relaxed">
          Please login or register your account first to proceed with payment and track your meat delivery.
        </p>
        <Link
          to="/login?from=/checkout"
          className="w-full py-3.5 bg-primary text-white font-black text-sm uppercase tracking-wider rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 mb-3"
        >
          Login to Continue
        </Link>
        <Link
          to="/register?from=/checkout"
          className="w-full py-3 bg-stone-100 text-stone-700 font-bold text-sm rounded-xl hover:bg-stone-200 transition-colors"
        >
          Create New Account
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-black mb-4">Your cart is empty!</h2>
        <button onClick={() => navigate("/")} className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-md shadow-primary/20 cursor-pointer">
          Browse Meat Catalog
        </button>
      </div>
    );
  }

  const DELIVERY_FEE = cartTotal < 100 ? 10 : 0;
  const grandTotal = cartTotal + (formData.orderType === "delivery" ? DELIVERY_FEE : 0);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const regenerateQr = () => {
    const newRef = "PC-" + Math.floor(100000 + Math.random() * 900000);
    setQrRefCode(newRef);
    setQrSecondsLeft(600);
    setQrError("");
  };

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

  const handleAddressSelect = (address: string, coords?: { lat: number; lng: number }) => {
    setFormData(prev => ({
      ...prev,
      address,
      latitude: coords ? coords.lat : prev.latitude,
      longitude: coords ? coords.lng : prev.longitude,
    }));
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

  const buildPayload = (txnId?: string) => ({
    customerInfo: {
      name: formData.name,
      phone: formData.phone,
      email: formData.email
    },
    orderType: formData.orderType,
    paymentMethod: formData.paymentMethod,
    paymentStatus: formData.paymentMethod === "qr" && txnId ? "paid" : "pending",
    transactionId: txnId || undefined,
    address: formData.orderType === "delivery" ? formData.address : undefined,
    latitude: formData.orderType === "delivery" && formData.latitude ? formData.latitude : undefined,
    longitude: formData.orderType === "delivery" && formData.longitude ? formData.longitude : undefined,
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
        const errorText = data.error || "Something went wrong.";
        setErrorMsg(errorText);
        if (showQrModal) {
          setQrError(errorText);
        }
      }
    } catch (err) {
      const networkErr = "Network connection issue. Please verify and try again.";
      setErrorMsg(networkErr);
      if (showQrModal) {
        setQrError(networkErr);
      }
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
      const ref = "PC-" + Math.floor(100000 + Math.random() * 900000);
      setQrRefCode(ref);
      setQrTransactionId("");
      setQrError("");
      setPendingPayload(buildPayload());
      setShowQrModal(true);
      return;
    }

    await submitOrder(buildPayload());
  };

  // Called when user clicks "I've Paid — Place Order" in dynamic QR modal
  const handleQrConfirm = async () => {
    setQrError("");

    if (!qrTransactionId || qrTransactionId.trim().length < 4) {
      setQrError("Please enter your 4+ digit Transaction ID or Reference Number from your payment app.");
      return;
    }

    if (qrSecondsLeft <= 0) {
      setQrError("This QR session has expired. Please click 'Regenerate QR' to refresh.");
      return;
    }

    const payloadWithTxn = buildPayload(qrTransactionId.trim());
    await submitOrder(payloadWithTxn);
  };

  // Called when user cancels payment or closes QR modal
  const handleCancelQrPayment = () => {
    setShowQrModal(false);
    setQrTransactionId("");
    setQrError("");
    setPendingPayload(null);
    setErrorMsg("QR payment cancelled. No order was placed, and your cart items remain saved.");
  };

  // Dynamic QR Payload encoded data for Nepal banking apps / wallets
  const dynamicQrData = `PRIME-CUTS|AMOUNT:${grandTotal.toFixed(2)}|REF:${qrRefCode}|NAME:${encodeURIComponent(formData.name || "Customer")}|PHONE:${formData.phone}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(dynamicQrData)}`;

  return (
    <div className="min-h-screen bg-[#fafafa] py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-2xl md:text-4xl font-black text-black mb-6 md:mb-8">CHECKOUT</h1>

        {/* Dynamic QR Payment Modal */}
        {showQrModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5 sm:p-7 relative my-auto animate-in fade-in zoom-in-95 duration-200 border border-stone-100">
              
              {/* Close Button */}
              <button
                type="button"
                onClick={handleCancelQrPayment}
                className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                title="Cancel Payment"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-primary text-xs font-black uppercase tracking-wider mb-2 border border-red-100">
                  <ShieldCheck className="w-3.5 h-3.5" /> Official Merchant QR
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900">Dynamic QR Payment</h3>
                <p className="text-xs text-stone-500 font-semibold mt-0.5">Prime Cuts Butcher House</p>
              </div>

              {/* Dynamic Live Timer Bar */}
              <div className="flex items-center justify-between bg-stone-50 px-3.5 py-2 rounded-xl border border-stone-200 text-xs mb-4">
                <div className="flex items-center gap-1.5 font-bold text-stone-600">
                  <Clock className={`w-4 h-4 ${qrSecondsLeft < 60 ? "text-red-500 animate-pulse" : "text-amber-500"}`} />
                  <span>Session Expiry:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-black text-sm ${qrSecondsLeft < 60 ? "text-red-600" : "text-stone-900"}`}>
                    {formatTimer(qrSecondsLeft)}
                  </span>
                  {qrSecondsLeft === 0 && (
                    <button
                      type="button"
                      onClick={regenerateQr}
                      className="px-2 py-0.5 bg-primary text-white text-[11px] font-bold rounded-md hover:bg-primary-hover flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Refresh
                    </button>
                  )}
                </div>
              </div>

              {/* QR Code Frame */}
              <div className="flex flex-col items-center gap-3 mb-4 bg-stone-50/80 p-4 rounded-2xl border border-stone-200">
                <div className="relative p-3 bg-white rounded-2xl shadow-sm border border-stone-200/80">
                  <img
                    src={qrImageUrl}
                    alt="Dynamic Merchant QR Code"
                    className={`w-48 h-48 sm:w-52 sm:h-52 object-contain transition-opacity duration-300 ${qrSecondsLeft === 0 ? "opacity-20 grayscale" : "opacity-100"}`}
                  />
                  {qrSecondsLeft === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
                      <AlertTriangle className="w-8 h-8 text-red-500 mb-1" />
                      <p className="text-xs font-black text-stone-900">QR Expired</p>
                      <button
                        type="button"
                        onClick={regenerateQr}
                        className="mt-2 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover flex items-center gap-1 cursor-pointer shadow-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Refresh QR
                      </button>
                    </div>
                  )}
                </div>

                {/* Amount to Pay & Order Ref Display with Copy Buttons */}
                <div className="w-full space-y-2">
                  {/* Amount Row */}
                  <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-stone-200">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Exact Amount</span>
                      <span className="text-lg font-black text-primary">Rs. {grandTotal.toFixed(2)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(grandTotal.toFixed(2), "amount")}
                      className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedField === "amount" ? (
                        <><Check className="w-3.5 h-3.5 text-green-600" /> Copied</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> Copy Amount</>
                      )}
                    </button>
                  </div>

                  {/* Ref Code Row */}
                  <div className="flex items-center justify-between bg-white px-3.5 py-2 rounded-xl border border-stone-200 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Payment Remark / Ref</span>
                      <span className="font-mono font-black text-stone-900">{qrRefCode}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(qrRefCode, "ref")}
                      className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedField === "ref" ? (
                        <><Check className="w-3.5 h-3.5 text-green-600" /> Copied</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> Copy Ref</>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Transaction ID Input (Mandatory Verification) */}
              <div className="space-y-1.5 mb-4">
                <label className="block text-xs font-black text-stone-800 uppercase tracking-wider">
                  Transaction ID / Ref No. *
                </label>
                <input
                  type="text"
                  value={qrTransactionId}
                  onChange={(e) => {
                    setQrTransactionId(e.target.value);
                    if (qrError) setQrError("");
                  }}
                  placeholder="e.g. 104829384 or TXN-83921"
                  className={`w-full h-11 px-3.5 rounded-xl border focus:outline-none font-bold text-sm text-stone-900 ${
                    qrError ? "border-red-400 bg-red-50 focus:border-red-500" : "border-stone-300 focus:border-primary focus:ring-1 focus:ring-primary"
                  }`}
                />
                <p className="text-[10px] text-stone-400 font-medium">
                  Enter the reference / transaction ID displayed on your banking/wallet app after paying.
                </p>
                {qrError && (
                  <p className="text-xs text-red-600 font-bold flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {qrError}
                  </p>
                )}
              </div>

              {/* Supported Wallets Pill Row */}
              <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-stone-500 mb-5 flex-wrap">
                <span className="bg-stone-100 px-2.5 py-0.5 rounded-md">Fonepay</span>
                <span className="bg-stone-100 px-2.5 py-0.5 rounded-md">eSewa</span>
                <span className="bg-stone-100 px-2.5 py-0.5 rounded-md">Khalti</span>
                <span className="bg-stone-100 px-2.5 py-0.5 rounded-md">Mobile Banking</span>
              </div>

              {/* Action Buttons: Confirm & Cancel */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleQrConfirm}
                  disabled={isSubmitting || qrSecondsLeft === 0}
                  className="w-full py-3.5 bg-primary text-white font-black text-sm uppercase tracking-wider rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-98"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Verifying & Placing Order...</>
                  ) : (
                    <>I've Paid — Confirm Order <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancelQrPayment}
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
                >
                  Cancel / Payment Failed
                </button>
              </div>

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
                        ? "border-primary bg-red-50 text-stone-900 shadow-xs"
                        : "border-stone-200 text-stone-600 hover:border-stone-300 bg-white"
                    }`}
                  >
                    <Banknote className="w-6 h-6 text-primary" />
                    <span className="font-extrabold text-stone-900">Cash on Delivery</span>
                    <span className="text-[10px] font-semibold text-stone-500">Pay when received</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "qr" }))}
                    className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 font-bold transition-all text-sm cursor-pointer ${
                      formData.paymentMethod === "qr"
                        ? "border-primary bg-red-50 text-stone-900 shadow-xs"
                        : "border-stone-200 text-stone-600 hover:border-stone-300 bg-white"
                    }`}
                  >
                    <QrCode className="w-6 h-6 text-primary" />
                    <span className="font-extrabold text-stone-900">QR Scan & Pay</span>
                    <span className="text-[10px] font-semibold text-stone-500">Fonepay / eSewa / Bank</span>
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
