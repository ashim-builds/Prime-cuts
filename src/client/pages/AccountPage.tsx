import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, LogOut, Package } from "lucide-react";
import { useUser } from "../context/UserContext";

export default function AccountPage() {
  const { user, isLoading, logout } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-500 font-medium">Loading account...</div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen pt-8 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-black mb-8">My Account</h1>

        <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden mb-6">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-black">{user.name}</h2>
                <p className="text-stone-500">Customer</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-lg border border-stone-100">
                <Mail className="w-5 h-5 text-stone-400" />
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Email</p>
                  <p className="text-black font-medium">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-lg border border-stone-100">
                  <Phone className="w-5 h-5 text-stone-400" />
                  <div>
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Phone</p>
                    <p className="text-black font-medium">{user.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link 
            to="/orders" 
            className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex items-center gap-4 hover:border-primary transition-colors group cursor-pointer"
          >
            <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Package className="w-6 h-6 text-stone-600 group-hover:text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-black">My Orders</h3>
              <p className="text-sm text-stone-500">View your order history</p>
            </div>
          </Link>

          <button 
            onClick={logout}
            className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex items-center gap-4 hover:border-red-500 transition-colors group text-left cursor-pointer"
          >
            <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center group-hover:bg-red-50 transition-colors">
              <LogOut className="w-6 h-6 text-stone-600 group-hover:text-red-500" />
            </div>
            <div>
              <h3 className="font-bold text-black group-hover:text-red-600">Logout</h3>
              <p className="text-sm text-stone-500">Sign out of your account</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
