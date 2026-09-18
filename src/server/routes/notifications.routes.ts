import { Router, Request, Response } from "express";
import { query } from "../db";
import { getAuthUser } from "../auth";
import { RowDataPacket } from "mysql2";

const router = Router();

// Get customer notifications
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      res.json({ success: true, notifications: [] });
      return;
    }

    const notifs = await query<RowDataPacket[]>(
      `SELECT n.id, n.recipient_type, n.recipient_id, n.type, n.title, n.message, n.order_id, n.is_read, n.created_at,
              o.order_number, o.total_amount, o.status, o.payment_status
       FROM notifications n
       LEFT JOIN orders o ON n.order_id = o.id
       WHERE n.recipient_type = 'USER' AND n.recipient_id = ?
       ORDER BY n.created_at DESC LIMIT 50`,
      [auth.userId]
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
        total: parseFloat(n.total_amount || 0),
        status: n.status,
        paymentStatus: n.payment_status,
      } : undefined,
    }));

    res.json({ success: true, notifications: mapped });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch notifications." });
  }
});

// Unread count
router.get("/unread-count", async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      res.json({ success: true, count: 0 });
      return;
    }

    const rows = await query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM notifications WHERE recipient_type = 'USER' AND recipient_id = ? AND is_read = FALSE",
      [auth.userId]
    );

    res.json({ success: true, count: rows[0]?.count || 0 });
  } catch (error) {
    res.status(500).json({ success: false, count: 0 });
  }
});

// Mark all as read
router.patch("/read-all", async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = await getAuthUser(req);
    if (auth) {
      await query("UPDATE notifications SET is_read = TRUE WHERE recipient_type = 'USER' AND recipient_id = ?", [auth.userId]);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Mark single as read
router.patch("/:id/read", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const auth = await getAuthUser(req);
    if (auth) {
      await query("UPDATE notifications SET is_read = TRUE WHERE id = ? AND recipient_type = 'USER' AND recipient_id = ?", [id, auth.userId]);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default router;
