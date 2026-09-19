import React from "react";
import { Link } from "react-router-dom";
import { Shield, Eye, Cookie, Mail, Phone, ChevronRight } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero */}
      <div className="bg-[#111111] text-white py-14 px-4 border-b border-stone-800">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3">Privacy Policy</h1>
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
              At <strong className="text-stone-900">Prime Cuts (Butcher House)</strong>, we respect your privacy and are committed to protecting your personal data. This policy explains what information we collect, how we use it, and your rights regarding your data.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-black text-stone-900">Information We Collect</h2>
            </div>
            <div className="text-stone-600 font-medium leading-relaxed space-y-3">
              <p>When you use our service, we may collect:</p>
              <ul className="space-y-2 pl-4">
                {[
                  "Full name and contact information (phone number, email address)",
                  "Delivery address and map coordinates (only when placing delivery orders)",
                  "Shopping Cart details: Selected items, weights, and quantities are saved securely in our MySQL database linked directly to your authenticated user account",
                  "Order history including items, quantities, prices, and timestamps",
                  "Account credentials (email and encrypted password — passwords are never stored in plain text)",
                  "Google account information if you choose to sign in with Google (name, email, profile photo)",
                  "Device and browser information for security purposes",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* How We Use Your Data */}
          <section>
            <h2 className="text-xl font-black text-stone-900 mb-4">How We Use Your Information</h2>
            <div className="text-stone-600 font-medium leading-relaxed space-y-2">
              <p>We use your information to:</p>
              <ul className="space-y-2 pl-4">
                {[
                  "Process and fulfill your fresh meat orders",
                  "Send order confirmation and butchering status updates",
                  "Contact you for cold-chain delivery coordination via phone or WhatsApp",
                  "Maintain your account and order history",
                  "Improve our products and services",
                  "Ensure the security of our platform and prevent fraud",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Data Storage */}
          <section>
            <h2 className="text-xl font-black text-stone-900 mb-4">Data Storage & Security</h2>
            <div className="text-stone-600 font-medium leading-relaxed space-y-3">
              <p>
                Your data is stored securely in our MySQL database with encrypted connections. We implement industry-standard security practices including:
              </p>
              <ul className="space-y-2 pl-4">
                {[
                  "Password hashing using bcrypt (cost factor 12) — your plain password is never stored",
                  "Encrypted HTTPS connections for all data transfers",
                  "HTTP-only secure cookies for authentication tokens",
                  "Rate limiting on login and registration to prevent brute-force attacks",
                  "Regular security audits of our codebase",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                <Cookie className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-black text-stone-900">Cookies</h2>
            </div>
            <div className="text-stone-600 font-medium leading-relaxed space-y-2">
              <p>We use cookies for the following purposes:</p>
              <ul className="space-y-2 pl-4">
                {[
                  "Authentication: Secure HTTP-only cookies to keep you logged in",
                  "Session management for admin access",
                  "No third-party advertising or tracking cookies are used",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Third Parties */}
          <section>
            <h2 className="text-xl font-black text-stone-900 mb-4">Third-Party Services</h2>
            <div className="text-stone-600 font-medium leading-relaxed space-y-2">
              <p>We use limited third-party services:</p>
              <ul className="space-y-2 pl-4">
                {[
                  "Google OAuth: For optional \"Sign in with Google\" (governed by Google's Privacy Policy)",
                  "Cloudinary: For product image hosting (images are stored on Cloudinary's servers)",
                  "OpenStreetMap (via Leaflet): For delivery address selection (no account data is shared)",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3">We do <strong>not</strong> sell, trade, or share your personal information with any other third parties.</p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-xl font-black text-stone-900 mb-4">Your Rights</h2>
            <div className="text-stone-600 font-medium leading-relaxed">
              <p className="mb-3">You have the right to:</p>
              <ul className="space-y-2 pl-4">
                {[
                  "Access the personal information we hold about you",
                  "Request correction of inaccurate data",
                  "Request deletion of your account and associated data",
                  "Withdraw consent for data processing at any time",
                  "Receive a copy of your data in a portable format",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4">To exercise any of these rights, contact us using the information below.</p>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-stone-50 rounded-2xl p-6">
            <h2 className="text-lg font-black text-stone-900 mb-4">Contact Us</h2>
            <div className="space-y-2 text-stone-600 font-medium text-sm">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <a href="tel:+9779865311559" className="hover:text-primary transition-colors">+977 9865311559</a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:info@primecuts.com" className="hover:text-primary transition-colors">info@primecuts.com</a>
              </p>
            </div>
          </section>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link to="/" className="text-sm font-bold text-stone-500 hover:text-primary transition-colors">
            ← Back to Home
          </Link>
          <span className="mx-3 text-stone-300">·</span>
          <Link to="/terms" className="text-sm font-bold text-stone-500 hover:text-primary transition-colors">
            Terms & Conditions →
          </Link>
        </div>
      </div>
    </div>
  );
}
