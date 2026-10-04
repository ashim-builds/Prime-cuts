/**
 * Utility for printing in-page POS Thermal Receipts (80mm/58mm roll format)
 * without opening a blank or new browser tab.
 */
export function printThermalReceipt(order: any) {
  if (typeof window === "undefined" || !document) return;

  // Remove existing iframe if present
  const existingFrame = document.getElementById("thermal-print-frame");
  if (existingFrame) {
    existingFrame.remove();
  }

  // Create invisible iframe in the current document
  const iframe = document.createElement("iframe");
  iframe.id = "thermal-print-frame";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const items = order.items || [];
  const itemsHtml = items
    .map(
      (i: any) => `
      <tr>
        <td style="padding: 3px 0; font-weight: bold; font-size: 11px;">
          ${i.productName || i.name || "Item"}
          <div style="font-weight: normal; color: #444; font-size: 10px;">
            ${
              i.selectedWeightInGrams
                ? i.selectedWeightInGrams >= 1000
                  ? (i.selectedWeightInGrams / 1000) + "kg"
                  : i.selectedWeightInGrams + "g"
                : i.selectedVariantName || ""
            } × ${i.qty || 1}
          </div>
        </td>
        <td style="padding: 3px 0; text-align: right; font-weight: bold; font-size: 11px; vertical-align: top; white-space: nowrap;">
          Rs. ${Number(i.calculatedPrice || i.price || 0).toFixed(2)}
        </td>
      </tr>`
    )
    .join("");

  const orderNumber = order.orderNumber || order.order_number || "";
  const createdAt = order.createdAt || order.created_at ? new Date(order.createdAt || order.created_at).toLocaleString() : "";
  const customerName = order.customerInfo?.name || order.customer_name || order.customerName || "Customer";
  const customerPhone = order.customerInfo?.phone || order.customer_phone || order.customerPhone || "N/A";
  const orderType = (order.orderType || order.order_type || "delivery").toLowerCase();
  const address = order.address || "";
  const notes = order.notes || "";
  const deliveryCharge = Number(order.deliveryCharge || order.delivery_charge || 0);
  const totalAmount = Number(order.totalAmount || order.total_amount || 0);
  const paymentMethod = (order.paymentMethod || order.payment_method || "COD").toUpperCase();
  const paymentStatus = (order.paymentStatus || order.payment_status || "PENDING").toUpperCase();

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) return;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt - Order #${orderNumber}</title>
        <meta charset="utf-8">
        <style>
          @page {
            size: 80mm auto;
            margin: 0mm;
          }
          @media print {
            html, body {
              width: 76mm !important;
              max-width: 80mm !important;
              margin: 0 auto !important;
              padding: 2mm 3mm !important;
              background: #fff !important;
              color: #000 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          body {
            font-family: 'Courier New', Courier, monospace, sans-serif;
            width: 76mm;
            max-width: 80mm;
            margin: 0 auto;
            padding: 4px;
            font-size: 11px;
            line-height: 1.25;
            color: #000;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          table { width: 100%; border-collapse: collapse; }
          td, th { vertical-align: top; }
        </style>
      </head>
      <body>
        <div class="center">
          <div style="font-size: 15px; font-weight: 900; letter-spacing: 1px;">🥩 PRIME CUTS</div>
          <div style="font-size: 10px; font-weight: bold; text-transform: uppercase;">Artisanal Butcher House</div>
          <div style="font-size: 9px; margin-top: 1px;">Khudi Chowk, Pokhara-30, Nepal</div>
          <div style="font-size: 9px;">Tel: +977 9714324919</div>
        </div>
        
        <div class="divider"></div>
        
        <div style="font-size: 10px; line-height: 1.35;">
          <div><b>Order #:</b> ${orderNumber}</div>
          <div><b>Date:</b> ${createdAt}</div>
          <div><b>Customer:</b> ${customerName}</div>
          <div><b>Phone:</b> ${customerPhone}</div>
          <div><b>Type:</b> ${orderType === "delivery" ? "🛵 Doorstep Delivery" : "🏬 Store Pickup"}</div>
          ${address ? `<div><b>Address:</b> ${address}</div>` : ""}
          ${notes ? `<div><b>Notes:</b> ${notes}</div>` : ""}
        </div>

        <div class="divider"></div>

        <table>
          <thead>
            <tr style="border-bottom: 1px dashed #000; font-size: 10px;">
              <th style="text-align: left; padding-bottom: 3px;">ITEM</th>
              <th style="text-align: right; padding-bottom: 3px;">AMT</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="divider"></div>

        <table style="font-size: 11px;">
          ${deliveryCharge > 0 ? `
          <tr>
            <td>Delivery Fee:</td>
            <td style="text-align: right; font-weight: bold;">Rs. ${deliveryCharge.toFixed(2)}</td>
          </tr>` : `
          <tr>
            <td>Delivery:</td>
            <td style="text-align: right; font-weight: bold;">FREE</td>
          </tr>`}
          <tr style="font-size: 13px; font-weight: 900; border-top: 1px solid #000; border-bottom: 1px solid #000;">
            <td style="padding: 4px 0;">TOTAL:</td>
            <td style="padding: 4px 0; text-align: right;">Rs. ${totalAmount.toFixed(2)}</td>
          </tr>
          <tr style="font-size: 10px;">
            <td style="padding-top: 3px;">Payment:</td>
            <td style="padding-top: 3px; text-align: right; font-weight: bold;">${paymentMethod} (${paymentStatus})</td>
          </tr>
        </table>

        <div class="divider"></div>

        <div class="center" style="font-size: 9px; line-height: 1.3;">
          <div>Thank you for ordering with Prime Cuts!</div>
          <div style="font-size: 8px; color: #333; margin-top: 2px;">Fresh Cold-Chain Quality Meat • Pokhara</div>
        </div>
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error("Thermal print error:", err);
    }
  }, 250);
}
