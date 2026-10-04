import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Loader2 } from "lucide-react";

import ShopLayout from "./components/ShopLayout";
import ScrollToTop from "./components/ScrollToTop";

// Eager load primary landing page for zero-delay first paint
import HomePage from "./pages/HomePage";

// Lazy load secondary customer pages
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Lazy load heavy admin suite
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminProductsPage = lazy(() => import("./pages/admin/AdminProductsPage"));
const AdminNewProductPage = lazy(() => import("./pages/admin/AdminNewProductPage"));
const AdminEditProductPage = lazy(() => import("./pages/admin/AdminEditProductPage"));
const AdminCategoriesPage = lazy(() => import("./pages/admin/AdminCategoriesPage"));
const AdminOrdersPage = lazy(() => import("./pages/admin/AdminOrdersPage"));
const AdminOrderDetailPage = lazy(() => import("./pages/admin/AdminOrderDetailPage"));
const AdminGuidePage = lazy(() => import("./pages/admin/AdminGuidePage"));
const AdminProtectedRoute = lazy(() => import("./components/admin/AdminProtectedRoute"));

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function PageLoadingFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 p-8">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Loading...</span>
    </div>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ScrollToTop />
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* ==================== STOREFRONT ==================== */}
          <Route element={<ShopLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<Navigate to="/" replace />} />

            <Route
              path="/product/:slug"
              element={<ProductDetailPage />}
            />

            <Route path="/checkout" element={<CheckoutPage />} />

            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/my-orders" element={<OrdersPage />} />

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
      </Suspense>
    </GoogleOAuthProvider>
  );
}