import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import MobileAppHeader from "./MobileAppHeader";
import MobileAppNavBar from "./MobileAppNavBar";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import DisableDevtools from "./DisableDevtools";
import PushNotificationSetup from "./PushNotificationSetup";
import StoreStatusBanner from "./StoreStatusBanner";
import { StoreStatusProvider } from "../context/StoreStatusContext";

export default function ShopLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/" || location.pathname === "/shop";

  return (
    <StoreStatusProvider>
      <div className={`flex flex-col min-h-screen ${isHomePage ? "bg-[#121214] text-white" : "bg-[#f8f9fa] text-stone-900"}`}>
        <DisableDevtools />
        {isHomePage && <StoreStatusBanner />}
        {isHomePage && <MobileAppHeader />}
        <Navbar />
        <CartDrawer />
        <main className={`flex-grow flex flex-col ${isHomePage ? "pb-0" : "pb-28 md:pb-0"}`}>
          <Outlet />
        </main>
        {isHomePage && <Footer />}
        <MobileAppNavBar />
        <PushNotificationSetup />
      </div>
    </StoreStatusProvider>
  );
}
