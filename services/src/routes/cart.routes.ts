import { Router, Request, Response } from "express";
import { query } from "../db";
import { getAuthUser } from "../auth";
import { RowDataPacket } from "mysql2";

const router = Router();

// Get current user's DB cart
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      res.json({ success: true, items: [] });
      return;
    }

    const rows = await query<RowDataPacket[]>("SELECT cart FROM users WHERE id = ?", [auth.userId]);
    if (rows.length === 0) {
      res.json({ success: true, items: [] });
      return;
    }

    const cart = typeof rows[0].cart === "string" ? JSON.parse(rows[0].cart) : (rows[0].cart || []);
    res.json({ success: true, items: cart });
  } catch (error) {
    console.error("[Cart Get Error]", error);
    res.status(500).json({ success: false, items: [], error: "Failed to load cart." });
  }
});

// Sync current user's DB cart
router.post("/sync", async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      res.json({ success: true });
      return;
    }

    const { items } = req.body;
    const boundedItems = Array.isArray(items) ? items.slice(0, 50) : [];

    await query("UPDATE users SET cart = ? WHERE id = ?", [JSON.stringify(boundedItems), auth.userId]);
    res.json({ success: true });
  } catch (error) {
    console.error("[Cart Sync Error]", error);
    res.status(500).json({ success: false, error: "Failed to sync cart." });
  }
});

// Clear current user's DB cart
router.delete("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = await getAuthUser(req);
    if (auth) {
      await query("UPDATE users SET cart = ? WHERE id = ?", [JSON.stringify([]), auth.userId]);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to clear cart." });
  }
});

export default router;
