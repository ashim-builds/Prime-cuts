import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { initializeDatabase } from "./db";

// Route imports
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import productsRoutes from "./routes/products.routes";
import cartRoutes from "./routes/cart.routes";
import checkoutRoutes from "./routes/checkout.routes";
import ordersRoutes from "./routes/orders.routes";
import notificationsRoutes from "./routes/notifications.routes";
import pushRoutes from "./routes/push.routes";
import uploadRoutes from "./routes/upload.routes";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "5001", 10);

// Basic middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

// Static public directory (for images, favicon, icons, manifest, service worker)
const publicDir = path.resolve(process.cwd(), "public");
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", (req, res, next) => {
  // Shortcut to /api/products/categories
  req.url = "/categories";
  productsRoutes(req, res, next);
});
app.use("/api/featured-products", (req, res, next) => {
  req.url = "/featured";
  productsRoutes(req, res, next);
});
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/push", pushRoutes);
app.use("/api/upload", uploadRoutes);

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Production: serve Vite build
const clientDistDir = path.resolve(process.cwd(), "dist/client");
if (fs.existsSync(clientDistDir)) {
  app.use(express.static(clientDistDir));
  app.get("*", (req: Request, res: Response) => {
    // If request does not start with /api, serve index.html
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(clientDistDir, "index.html"));
    } else {
      res.status(404).json({ error: "API route not found" });
    }
  });
}

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Gracefully handle malformed JSON from client body-parser
  if (err instanceof SyntaxError && (err as any).status === 400 && "body" in err) {
    res.status(400).json({
      success: false,
      error: "Invalid JSON format in request body.",
    });
    return;
  }

  if (err.status && err.status < 500) {
    res.status(err.status).json({
      success: false,
      error: err.message || "Client request error",
    });
    return;
  }

  console.error("[Server Unhandled Error]", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "An unexpected error occurred.",
  });
});

// Bootstrap Server
async function startServer() {
  const server = app.listen(PORT, "0.0.0.0", async () => {
    console.log(`========================================`);
    console.log(`🥩 Prime Cuts | Artisanal Butcher House Server Running!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`========================================`);

    try {
      await initializeDatabase();
    } catch (dbError: any) {
      console.warn(`⚠️ Database connection warning:`, dbError.message || dbError);
      console.warn(`👉 Note: Start MySQL with 'npm run docker:up' or local MySQL service.`);
    }
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use by another process.`);
      console.error(`👉 Tip: Free the port or run: taskkill /F /IM node.exe`);
    } else {
      console.error("❌ Server error:", err);
    }
    process.exit(1);
  });

  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  process.on("unhandledRejection", (reason) => {
    console.error("[Server unhandledRejection]:", reason);
  });
  process.on("uncaughtException", (err) => {
    console.error("[Server uncaughtException]:", err);
  });
}

startServer();

export default app;
