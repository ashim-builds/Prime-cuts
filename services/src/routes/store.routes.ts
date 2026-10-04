import { Router, Request, Response } from "express";
import { query } from "../db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { requireAdminMiddleware } from "../auth";

const router = Router();

function getNepalCurrentTime(): { hours: number; minutes: number; timeString: string; dayOfWeek: number } {
  // Nepal is UTC + 5 hours 45 minutes
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const nepalMs = utcMs + (5 * 60 + 45) * 60000;
  const nepalDate = new Date(nepalMs);

  const hours = nepalDate.getHours();
  const minutes = nepalDate.getMinutes();
  const timeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  return { hours, minutes, timeString, dayOfWeek: nepalDate.getDay() };
}

// GET /api/store/status - Public endpoint for store operating status
router.get("/status", async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await query<RowDataPacket[]>("SELECT * FROM store_settings WHERE id = 'store_main' LIMIT 1");
    const settings = rows[0] || {
      store_status_mode: "auto",
      open_time: "07:00",
      close_time: "20:00",
      auto_schedule_enabled: 1,
      closed_message: "Our butcher shop is currently closed. We are accepting pre-orders for fresh morning delivery!",
      phone: "+9779714324919",
      rider_phone: "+9779714324919",
      free_delivery_threshold: 899,
      delivery_charge: 50,
    };

    const nepal = getNepalCurrentTime();
    let isOpen = true;

    if (settings.store_status_mode === "force_open") {
      isOpen = true;
    } else if (settings.store_status_mode === "force_closed") {
      isOpen = false;
    } else {
      // Auto schedule check
      const current = nepal.timeString;
      const open = settings.open_time || "07:00";
      const close = settings.close_time || "20:00";
      isOpen = current >= open && current < close;
    }

    res.json({
      success: true,
      isOpen,
      mode: settings.store_status_mode,
      openTime: settings.open_time || "07:00",
      closeTime: settings.close_time || "20:00",
      autoScheduleEnabled: Boolean(settings.auto_schedule_enabled),
      closedMessage: settings.closed_message || "Our butcher shop is currently closed. We are accepting pre-orders for fresh morning delivery!",
      phone: settings.phone || "+9779714324919",
      riderPhone: settings.rider_phone || "+9779714324919",
      freeDeliveryThreshold: Number(settings.free_delivery_threshold || 899),
      deliveryCharge: Number(settings.delivery_charge || 50),
      currentNepalTime: nepal.timeString,
    });
  } catch (error: any) {
    console.error("[Store Status Error]", error);
    res.status(500).json({ success: false, error: "Failed to fetch store status." });
  }
});

// PUT /api/admin/store/status - Admin endpoint to update store status & hours
router.put("/status", requireAdminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      mode,
      openTime,
      closeTime,
      closedMessage,
      riderPhone,
      phone,
      freeDeliveryThreshold,
      deliveryCharge,
    } = req.body;

    await query<ResultSetHeader>(
      `UPDATE store_settings SET 
        store_status_mode = COALESCE(?, store_status_mode),
        open_time = COALESCE(?, open_time),
        close_time = COALESCE(?, close_time),
        closed_message = COALESCE(?, closed_message),
        rider_phone = COALESCE(?, rider_phone),
        phone = COALESCE(?, phone),
        free_delivery_threshold = COALESCE(?, free_delivery_threshold),
        delivery_charge = COALESCE(?, delivery_charge)
      WHERE id = 'store_main'`,
      [
        mode || null,
        openTime || null,
        closeTime || null,
        closedMessage || null,
        riderPhone || null,
        phone || null,
        freeDeliveryThreshold !== undefined ? Number(freeDeliveryThreshold) : null,
        deliveryCharge !== undefined ? Number(deliveryCharge) : null,
      ]
    );

    res.json({ success: true, message: "Store status settings updated successfully." });
  } catch (error: any) {
    console.error("[Admin Store Update Error]", error);
    res.status(500).json({ success: false, error: "Failed to update store settings." });
  }
});

export default router;
