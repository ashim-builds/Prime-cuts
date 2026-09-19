import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Home, Search, ChevronRight } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-4 py-20">
      <div className="text-center max-w-lg mx-auto">

        {/* Animated 404 */}
        <div className="mb-8 relative">
          <div className="text-[140px] md:text-[180px] font-black text-stone-100 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 md:w-36 md:h-36 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/30 animate-bounce">
              <ShoppingBag className="w-14 h-14 md:w-16 md:h-16 text-black" />
            </div>
          </div>
        </div>

        {/* Meat message */}
        <h1 className="text-3xl md:text-4xl font-black text-stone-900 mb-3">
          Oops! Cut Not Found
        </h1>
        <p className="text-stone-500 font-medium text-base md:text-lg mb-2">
          Looks like this cut is out of the case or the page has been moved.
        </p>
        <p className="text-stone-400 text-sm font-medium mb-10">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3.5 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 w-full sm:w-auto justify-center cursor-pointer"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <Link
            to="/shop"
            className="flex items-center gap-2 px-6 py-3.5 bg-white border-2 border-stone-200 text-stone-700 font-black rounded-xl hover:border-primary hover:text-black transition-all w-full sm:w-auto justify-center cursor-pointer"
          >
            <Search className="w-5 h-5" />
            Browse Shop
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-10 pt-8 border-t border-stone-200">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Popular Pages</p>
          <div className="flex flex-col items-center gap-2">
            {[
              { label: "Fresh Meats", href: "/shop" },
              { label: "My Orders", href: "/orders" },
              { label: "My Account", href: "/account" },
            ].map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center gap-1.5 text-sm font-bold text-stone-500 hover:text-primary transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
