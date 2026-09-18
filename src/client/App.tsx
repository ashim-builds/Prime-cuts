import React from "react";
import { Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import ShopLayout from "./components/ShopLayout";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import AccountPage from "./pages/AccountPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import NotFoundPage from "./pages/NotFoundPage";

import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminNewProductPage from "./pages/admin/AdminNewProductPage";
import AdminEditProductPage from "./pages/admin/AdminEditProductPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminOrderDetailPage from "./pages/admin/AdminOrderDetailPage";
import AdminGuidePage from "./pages/admin/AdminGuidePage";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Routes>
        {/* ==================== STOREFRONT ==================== */}
        <Route element={<ShopLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />

          <Route
            path="/product/:slug"
            element={<ProductDetailPage />}
          />

          <Route path="/checkout" element={<CheckoutPage />} />

          <Route path="/orders" element={<OrdersPage />} />

          <Route
            path="/orders/:orderNumber"
            element={<OrderDetailPage />}
          />

          <Route
            path="/order/:orderNumber"
            element={<OrderDetailPage />}
          />

          <Route path="/account" element={<AccountPage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/register" element={<RegisterPage />} />

          <Route path="/terms" element={<TermsPage />} />

          <Route
            path="/privacy-policy"
            element={<PrivacyPolicyPage />}
          />
        </Route>

        {/* ==================== ADMIN LOGIN ==================== */}
        <Route
          path="/admin/login"
          element={<AdminLoginPage />}
        />

        {/* ==================== PROTECTED ADMIN ROUTES ==================== */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route
              index
              element={<AdminDashboardPage />}
            />

            <Route
              path="products"
              element={<AdminProductsPage />}
            />

            <Route
              path="products/new"
              element={<AdminNewProductPage />}
            />

            <Route
              path="products/:id/edit"
              element={<AdminEditProductPage />}
            />

            <Route
              path="categories"
              element={<AdminCategoriesPage />}
            />

            <Route
              path="orders"
              element={<AdminOrdersPage />}
            />

            <Route
              path="orders/:id"
              element={<AdminOrderDetailPage />}
            />

            <Route
              path="guide"
              element={<AdminGuidePage />}
            />
          </Route>
        </Route>

        {/* ==================== 404 ==================== */}
        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </GoogleOAuthProvider>
  );
}