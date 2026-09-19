import React from "react";
import { Link } from "react-router-dom";
import { FileText, ShoppingBag, Truck, RefreshCcw, AlertTriangle, ChevronRight } from "lucide-react";

const sections = [
  {
    icon: ShoppingBag,
    title: "Fresh Meat Ordering & Weights",
    color: "bg-red-50",
    iconColor: "text-primary",
    items: [
      "All meat orders are prepared fresh daily upon confirmation.",
      "Weights are measured accurately on digital scales prior to vacuum/hygienic packaging.",
      "Custom weight orders are accepted in grams (250g, 500g, 1kg+) as per availability.",
      "Prices displayed on the website are in Nepali Rupees (NPR) per kg or per variant and are subject to market changes.",
      "We reserve the right to contact you if a specific cut requires customized butchering or substitution.",
    ],
  },
  {
    icon: Truck,
    title: "Chilled Express Delivery",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    items: [
      "Delivery is available across Pokhara, Lekhnath, and surrounding accessible routes.",
      "Due to the perishable nature of fresh meat, orders are dispatched in insulated, chilled containers.",
      "Customers must ensure someone is available at the provided delivery address to receive and promptly refrigerate the meat.",
      "Standard delivery charges apply based on distance and order total.",
    ],
  },
  {
    icon: RefreshCcw,
    title: "Cancellations & Freshness Guarantee",
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
    items: [
      "Orders can be cancelled while in 'pending' status before butchering begins.",
      "Once custom cutting or packaging has commenced, perishable meat cannot be cancelled or returned.",
      "If you receive any damaged packaging or suspect temperature compromise, notify our team within 1 hour of delivery for immediate resolution.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Meat Storage & Food Hygiene",
    color: "bg-red-50",
    iconColor: "text-red-600",
    items: [
      "Immediately refrigerate fresh meat between 0°C to 4°C upon receipt.",
      "Cook thoroughly within 24 hours of delivery or freeze at -18°C for longer shelf life.",
      "We adhere to strict sterile cutting board and knife hygiene standards with zero chemical additives.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero */}
      <div className="bg-[#111111] text-white py-14 px-4 border-b border-stone-800">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3">Terms & Conditions</h1>
          <p className="text-stone-400 font-medium text-sm md:text-base">
            Prime Cuts (Artisanal Butcher House) · Pokhara, Nepal
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-7 md:p-10 space-y-10">
          
          {/* Intro */}
          <section>
            <p className="text-stone-600 font-medium leading-relaxed">
              By accessing and placing orders with <strong className="text-stone-900">Prime Cuts (Butcher House)</strong>, you agree to be bound by these Terms & Conditions. Please read them carefully before purchasing our fresh meat cuts.
            </p>
          </section>

          {/* Acceptance */}
          <section>
            <h2 className="text-xl font-black text-stone-900 mb-3">Acceptance of Terms</h2>
            <p className="text-stone-600 font-medium leading-relaxed">
              By creating an account or placing an order through our platform, you confirm that you are at least 13 years of age and have the legal capacity to enter into a binding agreement. These terms apply to all visitors, users, and customers of our service.
            </p>
          </section>

          {/* Dynamic sections */}
          {sections.map((section) => (
            <section key={section.title}>
              <div className="flex items-center gap-2.5 mb-4">
                <div className={`w-9 h-9 ${section.color} rounded-xl flex items-center justify-center`}>
                  <section.icon className={`w-5 h-5 ${section.iconColor}`} />
                </div>
                <h2 className="text-xl font-black text-stone-900">{section.title}</h2>
              </div>
              <ul className="space-y-2.5">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-stone-600 font-medium leading-relaxed text-sm md:text-base">
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {/* Payments */}
          <section>
            <h2 className="text-xl font-black text-stone-900 mb-3">Payment</h2>
            <div className="text-stone-600 font-medium leading-relaxed space-y-2">
              <p>We accept the following payment methods:</p>
              <ul className="space-y-2 pl-4 mt-3">
                {[
                  "Cash on Delivery (COD): Pay in cash when your order is delivered or at pickup.",
                  "QR Scan & Pay: Scan our Fonepay / eSewa / Bank QR code and complete payment before order confirmation.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                For QR payments, please retain a screenshot of your payment confirmation. We are not liable for payments made to incorrect QR codes or accounts.
              </p>
            </div>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-xl font-black text-stone-900 mb-3">User Accounts</h2>
            <div className="text-stone-600 font-medium leading-relaxed space-y-2">
              <ul className="space-y-2">
                {[
                  "You are responsible for maintaining the confidentiality of your account credentials.",
                  "You agree to notify us immediately of any unauthorized use of your account.",
                  "We reserve the right to suspend or terminate accounts that violate these terms.",
                  "Each customer may maintain one account per email address.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-xl font-black text-stone-900 mb-3">Changes to These Terms</h2>
            <p className="text-stone-600 font-medium leading-relaxed">
              We reserve the right to update these Terms & Conditions at any time. Changes will be posted on this page with an updated date. Continued use of our service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          {/* Governing Law */}
          <section className="bg-stone-50 rounded-2xl p-6">
            <h2 className="text-lg font-black text-stone-900 mb-2">Governing Law</h2>
            <p className="text-stone-600 font-medium leading-relaxed text-sm">
              These Terms & Conditions are governed by the laws of Nepal. Any disputes arising from the use of our service shall be subject to the jurisdiction of the courts of Nepal.
            </p>
          </section>

        </div>

        {/* Back links */}
        <div className="mt-8 text-center">
          <Link to="/" className="text-sm font-bold text-stone-500 hover:text-primary transition-colors">
            ← Back to Home
          </Link>
          <span className="mx-3 text-stone-300">·</span>
          <Link to="/privacy-policy" className="text-sm font-bold text-stone-500 hover:text-primary transition-colors">
            Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
