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
