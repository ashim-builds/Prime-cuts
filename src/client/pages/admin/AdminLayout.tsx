import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { LayoutDashboard, Package, Tags, ShoppingCart, LogOut, Menu, X, BookOpen } from "lucide-react";
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
    { name: "Guide", href: "/admin/guide", icon: BookOpen },
  ];

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden relative">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#111111] text-white relative z-20">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 flex items-center justify-center flex-shrink-0">
              <img src="/images/logo.png" alt="Prime Cuts" className="w-full h-full object-contain filter drop-shadow-sm" />
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
            const isActive = item.href === "/admin" 
              ? pathname === "/admin" 
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-colors relative ${
                  isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "text-stone-400 hover:text-white hover:bg-white/5"
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

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-stone-400 hover:text-red-400 font-bold transition-colors rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[#111111] text-white">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
              <img src="/images/logo.png" alt="Prime Cuts" className="w-full h-full object-contain filter drop-shadow-sm" />
            </div>
            <span className="text-base font-black text-white">Prime <span className="text-primary">Admin</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell type="admin" />
            {stats && stats.pendingOrders > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-black animate-pulse">
                {stats.pendingOrders} pending
              </span>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 cursor-pointer">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#111111] text-white absolute top-16 left-0 right-0 z-50 border-t border-white/10 p-4 space-y-2 shadow-xl">
            {navItems.map((item) => {
              const isActive = item.href === "/admin" 
                ? pathname === "/admin" 
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold ${
                    isActive ? "bg-primary text-black" : "text-stone-400"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-stone-400 hover:text-red-400 font-bold cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-stone-50">
          <Outlet />
        </main>
      </div>

      {/* Floating Alert for incoming orders */}
      {newOrderNotification && newOrderNotification.show && (
        <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-[9999] bg-stone-900 border-2 border-primary text-white p-5 rounded-2xl shadow-2xl flex flex-col gap-3 transition-all duration-300 animate-slide-in">
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
          <div className="flex gap-2 mt-2">
            <Link
              to="/admin/orders"
              onClick={dismissNotification}
              className="flex-1 text-center py-2.5 bg-primary text-white font-black text-xs uppercase rounded-lg hover:bg-primary-hover transition-all cursor-pointer shadow-md shadow-primary/20"
            >
              View Orders
            </Link>
            <button
              onClick={dismissNotification}
              className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase rounded-lg transition-all cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <AdminPushSetup />
    </div>
  );
}

export default function AdminLayout() {
  return (
    <AdminLiveProvider>
      <AdminLayoutContent />
    </AdminLiveProvider>
  );
}
