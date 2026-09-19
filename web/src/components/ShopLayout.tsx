import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import DisableDevtools from "./DisableDevtools";

export default function ShopLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <DisableDevtools />
      <Navbar />
      <CartDrawer />
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
