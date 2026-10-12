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
import FloatingCartBar from "./FloatingCartBar";
import FloatingSupportWidget from "./FloatingSupportWidget";
import PWAInstallPrompt from "./PWAInstallPrompt";
import { StoreStatusProvider } from "../context/StoreStatusContext";
import { PWAProvider } from "../context/PWAContext";

export default function ShopLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/" || location.pathname === "/shop";

  return (
    <PWAProvider>
      <StoreStatusProvider>
      <div className={`flex flex-col min-h-screen ${isHomePage ? "bg-[#121214] text-white" : "bg-[#f8f9fa] text-stone-900"}`}>
        <DisableDevtools />
        <PWAInstallPrompt />
        {isHomePage && <StoreStatusBanner />}
        {isHomePage && <MobileAppHeader />}
        <Navbar />
        <CartDrawer />
        <main className={`flex-grow flex flex-col ${isHomePage ? "pb-0" : "pb-28 md:pb-0"}`}>
          <Outlet />
        </main>
        {isHomePage && <Footer />}
        <FloatingCartBar />
        <FloatingSupportWidget />
        <MobileAppNavBar />
        <PushNotificationSetup />
      </div>
    </StoreStatusProvider>
  </PWAProvider>
  );
}
