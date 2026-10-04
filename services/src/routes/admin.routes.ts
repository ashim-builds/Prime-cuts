import { Router, Request, Response } from "express";
import { query } from "../db";
import { signAdminToken, requireAdminMiddleware } from "../auth";
import { sendPushToUser } from "../webpush";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import crypto from "crypto";

const router = Router();

// Admin Login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (!password || password !== adminPassword) {
      res.status(401).json({ success: false, error: "Incorrect admin password." });
      return;
    }

    const token = await signAdminToken();

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
    });

    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, error: "Internal server error during admin login." });
  }
});

// Admin Logout
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("admin_token", { path: "/" });
  res.json({ success: true });
});

// Admin Auth Verification
router.get("/me", requireAdminMiddleware, (req: Request, res: Response): void => {
  res.json({ success: true, authenticated: true });
});

// Live updates (Stats + Recent Orders)
router.get("/live-updates", requireAdminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const prodCount = await query<RowDataPacket[]>("SELECT COUNT(*) as count FROM products");
    const availCount = await query<RowDataPacket[]>("SELECT COUNT(*) as count FROM products WHERE available = TRUE");
    const orderCount = await query<RowDataPacket[]>("SELECT COUNT(*) as count FROM orders");
    const pendingCount = await query<RowDataPacket[]>("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'");

    const recentOrders = await query<RowDataPacket[]>(
      "SELECT id, order_number, customer_name, customer_phone, customer_email, items, total_amount, delivery_charge, order_type, payment_method, payment_status, address, notes, status, created_at FROM orders ORDER BY created_at DESC LIMIT 10"
    );

    const mappedOrders = recentOrders.map(o => ({
      _id: o.id,
      id: o.id,
      orderNumber: o.order_number,
      customerInfo: {
        name: o.customer_name,
        phone: o.customer_phone,
        email: o.customer_email || undefined,
      },
      items: typeof o.items === "string" ? JSON.parse(o.items) : (o.items || []),
      totalAmount: parseFloat(o.total_amount),
      deliveryCharge: parseFloat(o.delivery_charge || 0),
      orderType: o.order_type,
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      address: o.address,
      notes: o.notes,
      status: o.status,
      createdAt: o.created_at,
    }));

    res.json({
      success: true,
      stats: {
        totalProducts: Number(prodCount[0]?.count) || 0,
        availableProducts: Number(availCount[0]?.count) || 0,
        totalOrders: Number(orderCount[0]?.count) || 0,
        pendingOrders: Number(pendingCount[0]?.count) || 0,
      },
      recentOrders: mappedOrders,
    });
  } catch (error) {
    console.error("[Admin Live-Updates Error]", error);
    res.status(500).json({ success: false, error: "Failed to fetch live metrics." });
  }
});

// Get all products (Admin)
router.get("/products", requireAdminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await query<RowDataPacket[]>("SELECT * FROM products ORDER BY created_at DESC");
    const mapped = products.map(p => ({
      _id: p.id,
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      image: p.image || null,
      images: typeof p.images === "string" ? JSON.parse(p.images) : (p.images || []),
      category: p.category,
      priceType: p.price_type,
      pricePerKg: p.price_per_kg ? parseFloat(p.price_per_kg) : undefined,
      weightOptions: typeof p.weight_options === "string" ? JSON.parse(p.weight_options) : (p.weight_options || []),
      allowCustomWeight: Boolean(p.allow_custom_weight),
      variants: typeof p.variants === "string" ? JSON.parse(p.variants) : (p.variants || []),
      available: Boolean(p.available),
      featured: Boolean(p.featured),
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
    res.json({ success: true, products: mapped });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch products." });
  }
});

// Get single product (Admin)
router.get("/products/:id", requireAdminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const products = await query<RowDataPacket[]>("SELECT * FROM products WHERE id = ?", [id]);
    if (products.length === 0) {
      res.status(404).json({ success: false, error: "Product not found." });
      return;
    }
    const p = products[0];
    res.json({
      success: true,
      product: {
        _id: p.id,
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        image: p.image || null,
        images: typeof p.images === "string" ? JSON.parse(p.images) : (p.images || []),
        category: p.category,
        priceType: p.price_type,
        pricePerKg: p.price_per_kg ? parseFloat(p.price_per_kg) : undefined,
        weightOptions: typeof p.weight_options === "string" ? JSON.parse(p.weight_options) : (p.weight_options || []),
        allowCustomWeight: Boolean(p.allow_custom_weight),
        variants: typeof p.variants === "string" ? JSON.parse(p.variants) : (p.variants || []),
        available: Boolean(p.available),
        featured: Boolean(p.featured),
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch product." });
  }
});

// ----------------------------------------------------
// Category Management Routes (Admin)
// ----------------------------------------------------

// 1. Get all categories (Admin) with product counts
router.get("/categories", requireAdminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await query<RowDataPacket[]>(`
      SELECT c.*, COUNT(p.id) as productCount
      FROM categories c
      LEFT JOIN products p ON LOWER(p.category) = LOWER(c.name)
      GROUP BY c.id
      ORDER BY c.created_at ASC, c.name ASC
    `);

    res.json({
      success: true,
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description || "",
        image: c.image || "/images/cat_steaks.jpg",
        active: Boolean(c.active),
        productCount: Number(c.productCount) || 0,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })),
    });
  } catch (error: any) {
    console.error("[Admin Get Categories Error]", error);
    res.status(500).json({ success: false, error: "Failed to fetch categories." });
  }
});

// 2. Create category (Admin)
router.post("/categories", requireAdminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, description, image, active } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ success: false, error: "Category name is required." });
      return;
    }

    const trimmedName = name.trim();
    const finalSlug = (slug || trimmedName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const catId = "cat_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);

    await query<ResultSetHeader>(
      `INSERT INTO categories (id, name, slug, description, image, active) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        catId,
        trimmedName,
        finalSlug,
        description?.trim() || "",
        image?.trim() || "/images/cat_steaks.jpg",
        active !== false,
      ]
    );

    res.json({ success: true, id: catId });
  } catch (error: any) {
    console.error("[Admin Create Category Error]", error);
    res.status(500).json({ success: false, error: error.message || "Failed to create category." });
  }
});

// 3. Update category (Admin)
router.put("/categories/:id", requireAdminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, description, image, active } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, error: "Category name is required." });
      return;
    }

    // Check existing category name
    const existing = await query<RowDataPacket[]>("SELECT name FROM categories WHERE id = ?", [id]);
    const oldName = existing[0]?.name;

    const trimmedName = name.trim();
    const finalSlug = (slug || trimmedName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    await query<ResultSetHeader>(
      `UPDATE categories SET name = ?, slug = ?, description = ?, image = ?, active = ? WHERE id = ?`,
      [
        trimmedName,
        finalSlug,
        description?.trim() || "",
        image?.trim() || "/images/cat_steaks.jpg",
        active !== false,
        id,
      ]
    );

    // If category was renamed, also update products assigned to old category
    if (oldName && oldName !== trimmedName) {
      await query("UPDATE products SET category = ? WHERE category = ?", [trimmedName, oldName]);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("[Admin Update Category Error]", error);
    res.status(500).json({ success: false, error: error.message || "Failed to update category." });
  }
});

// 4. Delete category (Admin)
router.delete("/categories/:id", requireAdminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await query("DELETE FROM categories WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (error: any) {
    console.error("[Admin Delete Category Error]", error);
    res.status(500).json({ success: false, error: error.message || "Failed to delete category." });
  }
});

// Create product
router.post("/products", requireAdminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      slug,
      description,
      category,
      priceType,
      pricePerKg,
      weightOptions,
      allowCustomWeight,
      variants,
      image,
      images,
      isAvailable,
      isFeatured,
    } = req.body;

    if (!name || !slug || !category) {
      res.status(400).json({ success: false, error: "Product name, slug, and category are required." });
      return;
    }

    const prodId = "prod_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);

    await query<ResultSetHeader>(
      `INSERT INTO products (
        id, name, slug, description, image, images, category, price_type, price_per_kg,
        weight_options, allow_custom_weight, variants, available, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        prodId,
        name.trim(),
        slug.trim(),
        description?.trim() || "",
        image?.trim() || null,
        JSON.stringify(Array.isArray(images) ? images : []),
        category.trim(),
        priceType === "variant" ? "variant" : "weight",
        priceType === "weight" && pricePerKg ? Number(pricePerKg) : null,
        JSON.stringify(Array.isArray(weightOptions) ? weightOptions : []),
        allowCustomWeight !== false,
        JSON.stringify(Array.isArray(variants) ? variants : []),
        isAvailable !== false,
        Boolean(isFeatured),
      ]
    );

    res.json({ success: true, id: prodId });
  } catch (error: any) {
    console.error("[Create Product Error]", error);
    res.status(500).json({ success: false, error: error.message || "Failed to create product." });
  }
});

// Update product
router.put("/products/:id", requireAdminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      category,
      priceType,
      pricePerKg,
      weightOptions,
      allowCustomWeight,
      variants,
      image,
      images,
      isAvailable,
      isFeatured,
    } = req.body;

    await query<ResultSetHeader>(
      `UPDATE products SET
        name = ?,
        slug = ?,
        description = ?,
        image = ?,
        images = ?,
        category = ?,
        price_type = ?,
        price_per_kg = ?,
        weight_options = ?,
        allow_custom_weight = ?,
        variants = ?,
        available = ?,
        featured = ?
      WHERE id = ?`,
      [
        name.trim(),
        slug.trim(),
        description?.trim() || "",
        image?.trim() || null,
        JSON.stringify(Array.isArray(images) ? images : []),
        category.trim(),
        priceType === "variant" ? "variant" : "weight",
        priceType === "weight" && pricePerKg ? Number(pricePerKg) : null,
        JSON.stringify(Array.isArray(weightOptions) ? weightOptions : []),
        allowCustomWeight !== false,
        JSON.stringify(Array.isArray(variants) ? variants : []),
        isAvailable !== false,
        Boolean(isFeatured),
        id,
      ]
    );

    res.json({ success: true });
  } catch (error: any) {
    console.error("[Update Product Error]", error);
    res.status(500).json({ success: false, error: error.message || "Failed to update product." });
  }
});

// Delete product
router.delete("/products/:id", requireAdminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await query("DELETE FROM products WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to delete product." });
  }
});

// Toggle stock
router.patch("/products/:id/stock", requireAdminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isAvail = req.body.isAvailable !== undefined
      ? Boolean(req.body.isAvailable)
      : req.body.available !== undefined
      ? Boolean(req.body.available)
      : true;

    await query("UPDATE products SET available = ? WHERE id = ?", [isAvail ? 1 : 0, id]);
    res.json({ success: true, available: isAvail, isAvailable: isAvail });
  } catch (error: any) {
    console.error("[Admin Update Stock Error]", error);
    res.status(500).json({ success: false, error: error?.message || "Failed to update stock status." });
  }
});

// Get all orders (Admin)
router.get("/orders", requireAdminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await query<RowDataPacket[]>("SELECT * FROM orders ORDER BY created_at DESC LIMIT 100");
    const mapped = orders.map(o => ({
      _id: o.id,
      id: o.id,
      orderNumber: o.order_number,
      customerInfo: {
        name: o.customer_name,
        phone: o.customer_phone,
        email: o.customer_email || undefined,
      },
      items: typeof o.items === "string" ? JSON.parse(o.items) : (o.items || []),
      totalAmount: parseFloat(o.total_amount),
      deliveryCharge: parseFloat(o.delivery_charge || 0),
      orderType: o.order_type,
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      transactionId: o.transaction_id || undefined,
      address: o.address,
      latitude: o.latitude !== null && o.latitude !== undefined ? parseFloat(o.latitude) : null,
      longitude: o.longitude !== null && o.longitude !== undefined ? parseFloat(o.longitude) : null,
      notes: o.notes,
      status: o.status,
      createdAt: o.created_at,
    }));
    res.json({ success: true, orders: mapped });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch orders." });
  }
});

// Get single order (Admin)
router.get("/orders/:id", requireAdminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const orders = await query<RowDataPacket[]>("SELECT * FROM orders WHERE id = ?", [id]);
    if (orders.length === 0) {
      res.status(404).json({ success: false, error: "Order not found." });
      return;
    }
    const o = orders[0];
    res.json({
      success: true,
      order: {
        _id: o.id,
        id: o.id,
        orderNumber: o.order_number,
        userId: o.user_id,
        customerInfo: {
          name: o.customer_name,
          phone: o.customer_phone,
          email: o.customer_email || undefined,
        },
        items: typeof o.items === "string" ? JSON.parse(o.items) : (o.items || []),
        totalAmount: parseFloat(o.total_amount),
        deliveryCharge: parseFloat(o.delivery_charge || 0),
        orderType: o.order_type,
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        transactionId: o.transaction_id || undefined,
        address: o.address,
        latitude: o.latitude !== null && o.latitude !== undefined ? parseFloat(o.latitude) : null,
        longitude: o.longitude !== null && o.longitude !== undefined ? parseFloat(o.longitude) : null,
        notes: o.notes,
        status: o.status,
        createdAt: o.created_at,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch order details." });
  }
});

// Update order status
router.patch("/orders/:id/status", requireAdminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const orders = await query<RowDataPacket[]>("SELECT * FROM orders WHERE id = ?", [id]);
    if (orders.length === 0) {
      res.status(404).json({ success: false, error: "Order not found." });
      return;
    }

    const order = orders[0];
    const prevStatus = order.status;

    if (prevStatus !== status) {
      await query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);

      if (order.user_id) {
        const notifMeta: Record<string, { type: string; title: string; body: string }> = {
          pending: { type: "ORDER_PLACED", title: "Order Placed", body: `Your order #${order.order_number} has been placed.` },
          confirmed: { type: "ORDER_CONFIRMED", title: "Order Confirmed", body: `Your order #${order.order_number} has been confirmed.` },
          preparing: { type: "ORDER_PREPARING", title: "Order Being Prepared", body: `Your order #${order.order_number} is being prepared.` },
          ready: { type: "ORDER_READY", title: "Order Ready", body: order.order_type === "delivery" ? `Your order #${order.order_number} is ready for delivery.` : `Your order #${order.order_number} is ready for pickup.` },
          delivered: { type: "ORDER_COMPLETED", title: "Order Completed", body: `Your order #${order.order_number} has been completed.` },
          cancelled: { type: "ORDER_CANCELLED", title: "Order Cancelled", body: `Your order #${order.order_number} has been cancelled.` },
        };

        const meta = notifMeta[status];
        if (meta) {
          const notifId = "notif_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
          await query(
            "INSERT INTO notifications (id, recipient_type, recipient_id, type, title, message, order_id) VALUES (?, 'USER', ?, ?, ?, ?, ?)",
            [notifId, order.user_id, meta.type, meta.title, meta.body, id]
          );

          sendPushToUser(order.user_id, {
            title: meta.title,
            body: meta.body,
            url: `/order/${order.order_number}`,
          }).catch(() => { });
        }
      }
    }

    res.json({ success: true, status });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update order status." });
  }
});

// Update payment status
router.patch("/orders/:id/payment", requireAdminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentStatus, transactionId } = req.body;

    if (paymentStatus !== "pending" && paymentStatus !== "paid") {
      res.status(400).json({ success: false, error: "Invalid payment status." });
      return;
    }

    const orders = await query<RowDataPacket[]>("SELECT * FROM orders WHERE id = ?", [id]);
    if (orders.length === 0) {
      res.status(404).json({ success: false, error: "Order not found." });
      return;
    }

    const order = orders[0];
    if (transactionId !== undefined) {
      await query("UPDATE orders SET payment_status = ?, transaction_id = ? WHERE id = ?", [paymentStatus, transactionId || null, id]);
    } else {
      await query("UPDATE orders SET payment_status = ? WHERE id = ?", [paymentStatus, id]);
    }

    if (paymentStatus === "paid" && order.user_id) {
      const msg = `Payment received for order #${order.order_number}.`;
      const notifId = "notif_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
      await query(
        "INSERT INTO notifications (id, recipient_type, recipient_id, type, title, message, order_id) VALUES (?, 'USER', ?, 'ORDER_CONFIRMED', 'Payment Confirmed', ?, ?)",
        [notifId, order.user_id, msg, id]
      );

      sendPushToUser(order.user_id, {
        title: "💳 Payment Confirmed!",
        body: msg,
        url: `/order/${order.order_number}`,
      }).catch(() => { });
    }

    res.json({ success: true, paymentStatus });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update payment status." });
  }
});

// Admin Notifications
router.get("/notifications", requireAdminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const notifs = await query<RowDataPacket[]>(
      `SELECT n.id, n.recipient_type, n.recipient_id, n.type, n.title, n.message, n.order_id, n.is_read, n.created_at,
              o.order_number, o.customer_name, o.total_amount, o.status, o.payment_status
       FROM notifications n
       LEFT JOIN orders o ON n.order_id = o.id
       WHERE n.recipient_type = 'ADMIN'
       ORDER BY n.created_at DESC LIMIT 50`
    );

    const mapped = notifs.map(n => ({
      id: n.id,
      recipientType: n.recipient_type,
      recipientId: n.recipient_id,
      type: n.type,
      title: n.title,
      message: n.message,
      orderId: n.order_id,
      read: Boolean(n.is_read),
      createdAt: n.created_at,
      order: n.order_number ? {
        id: n.order_id,
        orderNumber: n.order_number,
        customerName: n.customer_name,
        total: parseFloat(n.total_amount || 0),
        status: n.status,
        paymentStatus: n.payment_status,
      } : undefined,
    }));

    res.json({ success: true, notifications: mapped });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch admin notifications." });
  }
});

router.get("/notifications/unread-count", requireAdminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM notifications WHERE recipient_type = 'ADMIN' AND is_read = FALSE"
    );
    res.json({ success: true, count: rows[0]?.count || 0 });
  } catch (error) {
    res.status(500).json({ success: false, count: 0 });
  }
});

router.patch("/notifications/read-all", requireAdminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    await query("UPDATE notifications SET is_read = TRUE WHERE recipient_type = 'ADMIN'");
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Quick 1-Click Product Stock Toggle (Admin)
router.patch("/products/:id/toggle-stock", requireAdminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await query<RowDataPacket[]>("SELECT available FROM products WHERE id = ?", [id]);
    if (existing.length === 0) {
      res.status(404).json({ success: false, error: "Product not found." });
      return;
    }

    const currentStatus = Boolean(existing[0].available);
    const newStatus = !currentStatus;

    await query("UPDATE products SET available = ? WHERE id = ?", [newStatus, id]);
    res.json({ success: true, available: newStatus, message: newStatus ? "Product marked In Stock" : "Product marked Sold Out" });
  } catch (error: any) {
    console.error("[Toggle Stock Error]", error);
    res.status(500).json({ success: false, error: "Failed to toggle product stock." });
  }
});

// Daily Sales & Meat kg Sold Summary (Admin)
router.get("/reports/daily-summary", requireAdminMiddleware, async (_req: Request, res: Response): Promise<void> => {
  try {
    // Orders placed today (Nepal time calculation)
    const todayOrders = await query<RowDataPacket[]>(`
      SELECT id, order_number, customer_name, items, total_amount, payment_method, payment_status, status, created_at
      FROM orders
      WHERE DATE(CONVERT_TZ(created_at, '+00:00', '+05:45')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+05:45'))
        AND status != 'cancelled'
    `);

    let totalRevenue = 0;
    let totalCashRevenue = 0;
    let totalQrRevenue = 0;
    let totalGramsSold = 0;
    let totalPiecesSold = 0;

    const categoryBreakdown: Record<string, { count: number; grams: number; revenue: number }> = {};

    for (const order of todayOrders) {
      const amount = parseFloat(order.total_amount || 0);
      totalRevenue += amount;

      if (order.payment_method === "qr" || order.payment_status === "paid") {
        totalQrRevenue += amount;
      } else {
        totalCashRevenue += amount;
      }

      const items = typeof order.items === "string" ? JSON.parse(order.items) : (order.items || []);
      for (const item of items) {
        const itemPrice = parseFloat(item.calculatedPrice || item.price || 0);
        const cat = item.category || "General Meat";
        if (!categoryBreakdown[cat]) {
          categoryBreakdown[cat] = { count: 0, grams: 0, revenue: 0 };
        }

        categoryBreakdown[cat].count += item.qty || 1;
        categoryBreakdown[cat].revenue += itemPrice;

        if (item.selectedWeightInGrams) {
          const g = (item.selectedWeightInGrams || 0) * (item.qty || 1);
          totalGramsSold += g;
          categoryBreakdown[cat].grams += g;
        } else {
          totalPiecesSold += item.qty || 1;
        }
      }
    }

    res.json({
      success: true,
      summary: {
        totalOrders: todayOrders.length,
        totalRevenue,
        totalCashRevenue,
        totalQrRevenue,
        totalKgSold: parseFloat((totalGramsSold / 1000).toFixed(2)),
        totalPiecesSold,
        categoryBreakdown,
      },
    });
  } catch (error: any) {
    console.error("[Daily Summary Error]", error);
    res.status(500).json({ success: false, error: "Failed to generate daily summary." });
  }
});

export default router;

