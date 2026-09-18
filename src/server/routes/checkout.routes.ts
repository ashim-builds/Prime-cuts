import { Router, Request, Response } from "express";
import { query } from "../db";
import { getAuthUser } from "../auth";
import { checkoutSchema } from "../validations";
import { sendPushToAdmin } from "../webpush";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import crypto from "crypto";

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = await getAuthUser(req);
    if (!auth) {
      res.status(401).json({ success: false, error: "You must be logged in to place an order." });
      return;
    }

    const validation = checkoutSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ success: false, error: validation.error.issues[0]?.message || "Invalid order details." });
      return;
    }

    const { customerInfo, orderType, paymentMethod, address, notes, items } = validation.data;

    let finalSubtotal = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const prods = await query<RowDataPacket[]>("SELECT * FROM products WHERE id = ?", [item.productId]);
      if (prods.length === 0 || !prods[0].available) {
        res.status(400).json({ success: false, error: "One or more products in your cart is unavailable." });
        return;
      }

      const product = prods[0];
      const variants = typeof product.variants === "string" ? JSON.parse(product.variants) : (product.variants || []);
      const weightOptions = typeof product.weight_options === "string" ? JSON.parse(product.weight_options) : (product.weight_options || []);
      let calculatedPrice = 0;

      const orderItemRecord: any = {
        productId: product.id,
        productName: product.name,
        qty: item.qty,
        priceType: product.price_type,
      };

      if (product.price_type === "weight") {
        if (!item.weightInGrams || item.weightInGrams < 1 || item.weightInGrams > 20000) {
          res.status(400).json({ success: false, error: "Invalid weight selected." });
          return;
        }

        const pricePerKg = parseFloat(product.price_per_kg || 0);
        if (pricePerKg <= 0) {
          res.status(400).json({ success: false, error: `Price for ${product.name} is misconfigured.` });
          return;
        }

        calculatedPrice = (item.weightInGrams / 1000) * pricePerKg * item.qty;
        orderItemRecord.selectedWeightInGrams = item.weightInGrams;
        orderItemRecord.pricePerKgAtTimeOfOrder = pricePerKg;
      } else if (product.price_type === "variant") {
        if (!item.variantName) {
          res.status(400).json({ success: false, error: `Missing variant selection for ${product.name}.` });
          return;
        }

        const variant = variants.find((v: any) => v.name === item.variantName);
        if (!variant || variant.price < 0) {
          res.status(400).json({ success: false, error: `Invalid variant selected for ${product.name}.` });
          return;
        }

        calculatedPrice = variant.price * item.qty;
        orderItemRecord.selectedVariantName = variant.name;
        orderItemRecord.unitPriceAtTimeOfOrder = variant.price;
      }

      orderItemRecord.calculatedPrice = Math.round(calculatedPrice * 100) / 100;
      finalSubtotal += orderItemRecord.calculatedPrice;
      validatedItems.push(orderItemRecord);
    }

    finalSubtotal = Math.round(finalSubtotal * 100) / 100;

    // Delivery charge rule: Rs 10 if delivery AND subtotal < 100
    const deliveryCharge = (orderType === "delivery" && finalSubtotal < 100) ? 10.00 : 0.00;
    const grandTotal = Math.round((finalSubtotal + deliveryCharge) * 100) / 100;

    // Generate consecutive order number
    const latestOrders = await query<RowDataPacket[]>(
      "SELECT order_number FROM orders WHERE order_number LIKE 'CC-%' ORDER BY created_at DESC LIMIT 1"
    );

    let nextNumber = 1000;
    if (latestOrders.length > 0 && latestOrders[0].order_number) {
      const lastNum = parseInt(latestOrders[0].order_number.replace("CC-", ""), 10);
      if (!isNaN(lastNum)) {
        nextNumber = lastNum + 1;
      }
    }
    const orderNumber = `CC-${nextNumber}`;
    const orderId = "ord_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);

    await query<ResultSetHeader>(
      `INSERT INTO orders (
        id, order_number, user_id, customer_name, customer_phone, customer_email,
        items, total_amount, delivery_charge, order_type, payment_method, payment_status,
        address, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        orderId,
        orderNumber,
        auth.userId,
        customerInfo.name.trim(),
        customerInfo.phone.trim(),
        customerInfo.email?.trim() || null,
        JSON.stringify(validatedItems),
        grandTotal,
        deliveryCharge,
        orderType,
        paymentMethod || "cod",
        "pending",
        orderType === "delivery" ? address || null : null,
        notes || null,
      ]
    );

    // Clear user's DB cart
    await query("UPDATE users SET cart = ? WHERE id = ?", [JSON.stringify([]), auth.userId]);

    // Create Notification for ADMIN
    const notifId = "notif_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    await query(
      "INSERT INTO notifications (id, recipient_type, recipient_id, type, title, message, order_id) VALUES (?, 'ADMIN', 'admin', 'NEW_ORDER', 'New Order Received', ?, ?)",
      [
        notifId,
        `Order #${orderNumber}\nCustomer placed a new order.\nNPR ${grandTotal.toFixed(2)}`,
        orderId,
      ]
    );

    // Send Web Push to Admin
    sendPushToAdmin({
      title: `🛎 New Order — ${orderNumber}`,
      body: `${customerInfo.name} • Rs. ${grandTotal.toFixed(2)} • ${orderType}`,
      url: `/admin/orders/${orderId}`,
    }).catch(() => {});

    res.json({
      success: true,
      orderNumber,
      deliveryCharge,
      grandTotal,
    });
  } catch (error) {
    console.error("[Checkout Error]", error);
    res.status(500).json({ success: false, error: "Failed to process checkout." });
  }
});

export default router;
