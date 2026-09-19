import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { LayoutDashboard, Package, Tags, ShoppingCart, LogOut, Menu, X, Home } from "lucide-react";
import { AdminLiveProvider, useAdminLive } from "../../context/AdminLiveContext";
import AdminPushSetup from "../../components/AdminPushSetup";
import NotificationBell from "../../components/NotificationBell";

function AdminLayoutContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { newOrderNotification, dismissNotification, stats } = useAdminLive();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // Ignore
    } finally {
      navigate("/admin/login", { replace: true });
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: Tags },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden relative">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#111111] text-white relative z-20">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 flex items-center justify-center flex-shrink-0">
              <img src="/favicon-circle.png" alt="Prime Cuts" className="w-full h-full object-contain filter drop-shadow-sm" />
            </div>
            <span className="text-lg font-black text-white">Prime <span className="text-primary">Admin</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell type="admin" />
            {stats && stats.pendingOrders > 0 && (
              <div className="flex items-center justify-center w-6 h-6 bg-red-500 text-white rounded-full text-xs font-black animate-pulse">
                {stats.pendingOrders}
              </div>
            )}
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors relative ${
                  active ? "bg-primary text-white shadow-md shadow-primary/20" : "text-stone-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
                {item.name === "Orders" && stats && stats.pendingOrders > 0 && (
                  <span className="absolute right-4 px-2 py-0.5 bg-red-500 text-white rounded-full text-[10px] font-black animate-pulse">
                    {stats.pendingOrders}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions: Go to Home + Logout */}
        <div className="p-4 border-t border-white/10 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 w-full px-4 py-3 text-stone-400 hover:text-white font-bold transition-colors rounded-xl hover:bg-white/5"
          >
            <Home className="w-5 h-5" />
            Go to Home
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-stone-400 hover:text-red-400 font-bold transition-colors rounded-xl hover:bg-white/5 cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Top Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[#111111] text-white border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
              <img src="/favicon-circle.png" alt="Prime Cuts" className="w-full h-full object-contain filter drop-shadow-sm" />
            </div>
            <span className="text-base font-black text-white">Prime <span className="text-primary">Admin</span></span>
          </Link>
          <div className="flex items-center gap-2.5">
            <NotificationBell type="admin" />
            {stats && stats.pendingOrders > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-black animate-pulse">
                {stats.pendingOrders} pending
              </span>
            )}
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-stone-400 hover:text-red-400 cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-stone-50 pb-28 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile Admin Bottom Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111111]/95 backdrop-blur-xl border-t border-[#242424] z-50 shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
          <div className="flex justify-around items-center px-2 pt-2.5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
            <Link to="/admin" className="flex flex-col items-center gap-1 group py-1 active:scale-95 transition-transform">
              <LayoutDashboard className={`w-5 h-5 transition-colors ${isActive("/admin") ? "text-primary stroke-[2.5]" : "text-stone-400 group-hover:text-white"}`} />
              <span className={`text-[10px] font-bold transition-colors ${isActive("/admin") ? "text-primary" : "text-stone-400 group-hover:text-white"}`}>Dashboard</span>
            </Link>

            <Link to="/admin/products" className="flex flex-col items-center gap-1 group py-1 active:scale-95 transition-transform">
              <Package className={`w-5 h-5 transition-colors ${isActive("/admin/products") ? "text-primary stroke-[2.5]" : "text-stone-400 group-hover:text-white"}`} />
              <span className={`text-[10px] font-bold transition-colors ${isActive("/admin/products") ? "text-primary" : "text-stone-400 group-hover:text-white"}`}>Products</span>
            </Link>

            <Link to="/admin/categories" className="flex flex-col items-center gap-1 group py-1 active:scale-95 transition-transform">
              <Tags className={`w-5 h-5 transition-colors ${isActive("/admin/categories") ? "text-primary stroke-[2.5]" : "text-stone-400 group-hover:text-white"}`} />
              <span className={`text-[10px] font-bold transition-colors ${isActive("/admin/categories") ? "text-primary" : "text-stone-400 group-hover:text-white"}`}>Categories</span>
            </Link>

            <Link to="/admin/orders" className="flex flex-col items-center gap-1 group relative py-1 active:scale-95 transition-transform">
              <div className="relative">
                <ShoppingCart className={`w-5 h-5 transition-colors ${isActive("/admin/orders") ? "text-primary stroke-[2.5]" : "text-stone-400 group-hover:text-white"}`} />
                {stats && stats.pendingOrders > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {stats.pendingOrders}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold transition-colors ${isActive("/admin/orders") ? "text-primary" : "text-stone-400 group-hover:text-white"}`}>Orders</span>
            </Link>

            <Link to="/" className="flex flex-col items-center gap-1 group py-1 active:scale-95 transition-transform">
              <Home className="w-5 h-5 text-stone-400 group-hover:text-white transition-colors" />
              <span className="text-[10px] font-bold text-stone-400 group-hover:text-white transition-colors">Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Alert for incoming orders */}
      {newOrderNotification && newOrderNotification.show && (
        <div className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-[9999] bg-stone-900 border-2 border-primary text-white p-5 rounded-2xl shadow-2xl flex flex-col gap-3 transition-all duration-300 animate-slide-in">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 text-primary">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="font-black uppercase tracking-widest text-[10px]">New Order Incoming</span>
            </div>
            <button onClick={dismissNotification} className="text-stone-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div>
            <p className="text-lg font-black">{newOrderNotification.orderNumber}</p>
            <p className="text-sm font-semibold text-stone-300 mt-1">Customer: {newOrderNotification.customerName}</p>
            <p className="text-xs text-stone-400 mt-0.5">Amount: Rs. {newOrderNotification.amount.toFixed(2)}</p>
          </div>
          <Link
            to="/admin/orders"
            onClick={dismissNotification}
            className="w-full py-2 bg-primary text-black font-black text-xs uppercase tracking-wider rounded-xl text-center hover:bg-primary/90 transition-colors"
          >
            Open Orders
          </Link>
        </div>
      )}
    </div>
  );
}

export default function AdminLayout() {
  return (
    <AdminLiveProvider>
      <AdminLayoutContent />
      <AdminPushSetup />
    </AdminLiveProvider>
  );
}
