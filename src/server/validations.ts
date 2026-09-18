import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60, "Name too long").regex(/^[a-zA-Z\s]+$/, "Name must contain only letters and spaces"),
  email: z.string().email("Invalid email address").max(100),
  phone: z.string().regex(/^9\d{9}$/, "Phone must be a valid 10-digit number starting with 9").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const checkoutSchema = z.object({
  customerInfo: z.object({
    name: z.string().min(2).max(60).regex(/^[a-zA-Z\s]+$/),
    phone: z.string().regex(/^9\d{9}$/),
    email: z.string().email().optional().or(z.literal("")),
  }),
  orderType: z.enum(["pickup", "delivery"]),
  paymentMethod: z.enum(["cod", "qr"]).default("cod"),
  address: z.string().max(250).optional(),
  notes: z.string().max(100).optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      qty: z.number().int().positive().max(100),
      priceType: z.enum(["weight", "variant"]),
      weightInGrams: z.number().positive().max(20000).optional(),
      variantName: z.string().max(50).optional(),
    })
  ).min(1, "At least one item is required"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"]),
});

export function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
