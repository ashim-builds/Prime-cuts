import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { UserProvider } from "./context/UserContext";
import { CartProvider } from "./context/CartContext";
import { cleanStaleServiceWorkers } from "./utils/deviceNotification";
import "leaflet/dist/leaflet.css";
import "./index.css";

// Purge any foreign/old service workers running on localhost:3000 from previous projects
cleanStaleServiceWorkers();

// Global Admin & Upload Fetch Interceptor
// Automatically attaches Bearer token & credentials to guarantee admin operations
// persist even if browser cookies are blocked or dropped by proxy/cPanel
const nativeFetch = window.fetch;
window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
  const urlStr = typeof input === "string" ? input : input instanceof Request ? input.url : input.toString();

  if (urlStr.includes("/api/admin") || urlStr.includes("/api/upload")) {
    const token = localStorage.getItem("admin_token");
    const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));

    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const modifiedInit: RequestInit = {
      ...init,
      headers,
      credentials: init?.credentials || "include",
    };

    return nativeFetch(input, modifiedInit);
  }

  return nativeFetch(input, init);
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
