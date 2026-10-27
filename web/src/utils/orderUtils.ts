/**
 * Utility functions for orders and delivery schedules
 */

export function getOrderDeliverySlot(order: any): string | null {
  if (!order) return null;
  if (order.deliveryTimeSlot && typeof order.deliveryTimeSlot === "string") {
    return order.deliveryTimeSlot.trim();
  }
  if (order.delivery_time_slot && typeof order.delivery_time_slot === "string") {
    return order.delivery_time_slot.trim();
  }
  if (order.notes && typeof order.notes === "string") {
    const match = order.notes.match(/\[Slot:\s*([^\]]+)\]/i);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

export function getCleanOrderNotes(order: any): string {
  if (!order || !order.notes || typeof order.notes !== "string") return "";
  return order.notes.replace(/\[Slot:\s*[^\]]+\]/gi, "").trim();
}
