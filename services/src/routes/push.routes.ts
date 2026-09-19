import { Router, Request, Response } from "express";
import { query } from "../db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import crypto from "crypto";

const router = Router();

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";

// Return VAPID Public Key
router.get("/vapid", (req: Request, res: Response) => {
  res.json({ publicKey: vapidPublicKey });
});

// Subscribe
router.post("/subscribe", async (req: Request, res: Response): Promise<void> => {
  try {
    const { subscription, type, userId } = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      res.status(400).json({ success: false, error: "Invalid subscription payload." });
      return;
    }

    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    const existing = await query<RowDataPacket[]>("SELECT id FROM push_subscriptions WHERE endpoint = ?", [endpoint]);
    if (existing.length > 0) {
      await query("UPDATE push_subscriptions SET user_id = ?, type = ?, p256dh = ?, auth = ? WHERE endpoint = ?", [
        userId || null,
        type || "customer",
        p256dh,
        auth,
        endpoint,
      ]);
    } else {
      const subId = "sub_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
      await query<ResultSetHeader>(
        "INSERT INTO push_subscriptions (id, user_id, type, endpoint, p256dh, auth) VALUES (?, ?, ?, ?, ?, ?)",
        [subId, userId || null, type || "customer", endpoint, p256dh, auth]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("[Push Subscribe Error]", error);
    res.status(500).json({ success: false, error: "Failed to save push subscription." });
  }
});

// Unsubscribe
router.delete("/subscribe", async (req: Request, res: Response): Promise<void> => {
  try {
    const { endpoint } = req.body;
    if (endpoint) {
      await query("DELETE FROM push_subscriptions WHERE endpoint = ?", [endpoint]);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to remove subscription." });
  }
});

export default router;
