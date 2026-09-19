import webpush from "web-push";
import { query } from "./db";
import { RowDataPacket } from "mysql2";

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "UUxI2OONbpkGEe4pkpPvvdS_sLw47F8d8pQJ9nJ3Pj4";
const vapidEmail = process.env.VAPID_EMAIL || "mailto:admin@masupasal.com";

try {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
} catch (e) {
  console.warn("[WebPush] VAPID details initialization error:", e);
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

export async function sendPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: PushPayload
) {
  try {
    const stringifiedPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || "/",
      icon: payload.icon || "/icon-192x192.png",
      badge: "/icon-192x192.png",
    });

    await webpush.sendNotification(subscription, stringifiedPayload);
  } catch (error: any) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Expired subscription, remove from MySQL
      await query("DELETE FROM push_subscriptions WHERE endpoint = ?", [subscription.endpoint]);
    }
  }
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  try {
    const subscriptions = await query<RowDataPacket[]>(
      "SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ? AND type = 'customer'",
      [userId]
    );

    for (const sub of subscriptions) {
      await sendPushNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      );
    }
  } catch (error) {
    console.error("[WebPush] Error sending push to user:", error);
  }
}

export async function sendPushToAdmin(payload: PushPayload) {
  try {
    const subscriptions = await query<RowDataPacket[]>(
      "SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE type = 'admin'"
    );

    for (const sub of subscriptions) {
      await sendPushNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      );
    }
  } catch (error) {
    console.error("[WebPush] Error sending push to admin:", error);
  }
}
