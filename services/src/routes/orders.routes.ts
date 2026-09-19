import { Router, Request, Response } from "express";
import { query } from "../db";
import { getAuthUser, getIsAdmin } from "../auth";
import { sendPushToAdmin, sendPushToUser } from "../webpush";
import { RowDataPacket } from "mysql2";
import crypto from "crypto";

const router = Router();

// Get customer's orders
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      res.status(401).json({ success: false, error: "You must be logged in to view your orders." });
      return;
    }

    const orders = await query<RowDataPacket[]>(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [auth.userId]
    );

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
      address: o.address,
      notes: o.notes,
      status: o.status,
      createdAt: o.created_at,
    }));

    res.json({ success: true, orders: mapped });
  } catch (error) {
    console.error("[Get User Orders Error]", error);
    res.status(500).json({ success: false, error: "Failed to load orders." });
  }
});

// Get single order status (lightweight polling)
router.get("/:orderNumber/status", async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderNumber } = req.params;
    const orders = await query<RowDataPacket[]>("SELECT status FROM orders WHERE order_number = ?", [orderNumber]);
    if (orders.length === 0) {
      res.status(404).json({ success: false, error: "Order not found." });
      return;
    }
    res.json({ success: true, status: orders[0].status });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch status." });
  }
});

// Get single order details (for order confirmation and live tracker)
router.get("/:orderNumber", async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderNumber } = req.params;
    const orders = await query<RowDataPacket[]>("SELECT * FROM orders WHERE order_number = ?", [orderNumber]);
    if (orders.length === 0) {
      res.status(404).json({ success: false, error: "Order not found." });
      return;
    }

    const o = orders[0];
    const auth = await getAuthUser(req);
    const isAdmin = await getIsAdmin(req);

    // If order has userId, verify ownership or admin
    if (o.user_id && (!auth || auth.userId !== o.user_id) && !isAdmin) {
      res.status(403).json({ success: false, error: "Unauthorized access to order." });
      return;
    }

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
        address: o.address,
        notes: o.notes,
        status: o.status,
        createdAt: o.created_at,
      },
    });
  } catch (error) {
    console.error("[Get Order Error]", error);
    res.status(500).json({ success: false, error: "Failed to load order." });
  }
});

// Cancel order (customer)
router.post("/:orderNumber/cancel", async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderNumber } = req.params;
    const auth = await getAuthUser(req);

    if (!auth) {
      res.status(401).json({ success: false, error: "You must be logged in to cancel an order." });
      return;
    }

    const orders = await query<RowDataPacket[]>("SELECT * FROM orders WHERE order_number = ?", [orderNumber]);
    if (orders.length === 0) {
      res.status(404).json({ success: false, error: "Order not found." });
      return;
    }

    const order = orders[0];
    if (order.user_id !== auth.userId) {
      res.status(403).json({ success: false, error: "Unauthorized." });
      return;
    }

    if (order.status !== "pending") {
      res.status(400).json({ success: false, error: `Only pending orders can be cancelled. Order is already ${order.status}.` });
      return;
    }

    await query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [order.id]);

    // Admin Notification
    const notifAdminId = "notif_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    await query(
      "INSERT INTO notifications (id, recipient_type, recipient_id, type, title, message, order_id) VALUES (?, 'ADMIN', 'admin', 'ORDER_CANCELLED_BY_USER', 'Order Cancelled', ?, ?)",
      [notifAdminId, `Order #${order.order_number}\nCustomer cancelled the order.`, order.id]
    );

    // User Notification
    const notifUserId = "notif_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    await query(
      "INSERT INTO notifications (id, recipient_type, recipient_id, type, title, message, order_id) VALUES (?, 'USER', ?, 'ORDER_CANCELLED', 'Order Cancelled', ?, ?)",
      [notifUserId, auth.userId, `Your order #${order.order_number} has been cancelled.`, order.id]
    );

    // Push alerts
    sendPushToAdmin({
      title: "Order Cancelled",
      body: `Order ${order.order_number} was cancelled by customer.`,
      url: `/admin/orders/${order.id}`,
    }).catch(() => {});

    sendPushToUser(auth.userId, {
      title: "Order Cancelled",
      body: `Your order ${order.order_number} was cancelled successfully.`,
      url: `/order/${order.order_number}`,
    }).catch(() => {});

    res.json({ success: true, status: "cancelled" });
  } catch (error) {
    console.error("[Cancel Order Error]", error);
    res.status(500).json({ success: false, error: "Failed to cancel order." });
  }
});

export default router;
