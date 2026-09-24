/* =========================================
   SONIVIVA — Admin Notifications Service
   Email, WhatsApp, and In-App Notifications
   ========================================= */

const nodemailer = require('nodemailer');
const { getDb } = require('../db/database');

const ADMIN_EMAIL = 'dappahsonnia@gmail.com';
const ADMIN_WHATSAPP = '233597118637'; // 0597118637
const ADMIN_PHONE = '0256322653';

const SMTP_USER = process.env.SMTP_USER || ADMIN_EMAIL;
const SMTP_PASS = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  if (!SMTP_PASS) {
    return null;
  }
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
  return transporter;
}

/**
 * Generate a pre-formatted WhatsApp link for order dispatch to store admin
 */
function generateWhatsAppOrderLink(order, items = []) {
  const itemsText = items.map(i => `• ${i.product_name || i.name} x${i.quantity} (GH₵ ${Number(i.total || (i.unit_price * i.quantity) || (i.price * i.quantity)).toFixed(2)})`).join('\n');
  const deliveryAddress = [order.shipping_address, order.shipping_city, order.shipping_region].filter(Boolean).join(', ');
  
  const msg = 
`🛒 *NEW ORDER RECEIVED — SONIVIVA*
----------------------------------
*Order Number:* ${order.order_number}
*Customer:* ${order.shipping_name || 'Customer'}
*Phone:* ${order.shipping_phone || 'N/A'}
*Email:* ${order.shipping_email || 'N/A'}
*Address:* ${deliveryAddress || 'Not specified'}

📦 *Items Ordered:*
${itemsText || '• Products'}

💰 *Subtotal:* GH₵ ${Number(order.subtotal).toFixed(2)}
🚚 *Delivery:* GH₵ ${Number(order.delivery_fee || 15).toFixed(2)}
💵 *TOTAL AMOUNT:* GH₵ ${Number(order.total).toFixed(2)}
💳 *Payment Method:* ${(order.payment_method || 'Cash on Delivery').toUpperCase()}
${order.shipping_notes ? `📝 *Notes:* ${order.shipping_notes}\n` : ''}----------------------------------
_Automated Order Dispatch from Soniviva Market_`;

  return `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

/**
 * Notify admin when an order is placed
 */
async function notifyOrderPlaced(order, items = []) {
  const db = getDb();
  const title = `New Order: ${order.order_number}`;
  const message = `${order.shipping_name || 'Customer'} placed an order of GH₵ ${Number(order.total).toFixed(2)} (${items.length} item${items.length === 1 ? '' : 's'}).`;
  
  // 1. Insert In-App Database Notification for Admin
  try {
    db.prepare(`
      INSERT INTO notifications (type, title, message, data)
      VALUES (?, ?, ?, ?)
    `).run('order', title, message, JSON.stringify({
      orderId: order.id,
      orderNumber: order.order_number,
      total: order.total,
      customerName: order.shipping_name,
      customerPhone: order.shipping_phone,
      customerEmail: order.shipping_email,
      itemCount: items.length
    }));
    console.log(`🔔 [NOTIFICATION] Order notification logged in database: ${order.order_number}`);
  } catch (err) {
    console.error('Failed to log order notification in DB:', err.message);
  }

  // 2. Send Email Alert to dappahsonnia@gmail.com
  const itemsHtml = items.map(i => `
    <tr>
      <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:14px; color:#333;">${i.product_name || i.name}</td>
      <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:14px; color:#666; text-align:center;">x${i.quantity}</td>
      <td style="padding:10px 12px; border-bottom:1px solid #eee; font-size:14px; color:#1B5E20; font-weight:600; text-align:right;">GH₵ ${Number(i.total || (i.unit_price * i.quantity) || (i.price * i.quantity)).toFixed(2)}</td>
    </tr>
  `).join('');

  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0; padding:0; background:#FAF9F6; font-family:'Segoe UI', Arial, sans-serif; color:#2D2D2D;">
    <div style="max-width:580px; margin:30px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 6px 25px rgba(0,0,0,0.06); border:1px solid #E5E2DB;">
      
      <!-- Header -->
      <div style="background:linear-gradient(135deg, #1B5E20, #2E7D32); padding:32px 28px; text-align:center;">
        <h1 style="color:#ffffff; margin:0; font-size:24px; letter-spacing:2px; font-weight:800;">SONI<span style="color:#D4A017;">VIVA</span></h1>
        <p style="color:#E8F5E9; margin:6px 0 0; font-size:14px;">🚨 New Customer Order Received</p>
      </div>

      <!-- Main Body -->
      <div style="padding:32px 28px;">
        <div style="background:#E8F5E9; border-left:4px solid #2E7D32; padding:14px 18px; border-radius:4px; margin-bottom:24px;">
          <strong style="color:#1B5E20; font-size:16px;">Order #${order.order_number}</strong>
          <div style="color:#2E7D32; font-size:13px; margin-top:2px;">Total: <strong>GH₵ ${Number(order.total).toFixed(2)}</strong> &bull; Payment: <strong>${(order.payment_method || 'Pending').toUpperCase()}</strong></div>
        </div>

        <h3 style="font-size:15px; text-transform:uppercase; letter-spacing:1px; color:#888; margin:0 0 12px;">Customer Details</h3>
        <table style="width:100%; font-size:14px; margin-bottom:24px; border-collapse:collapse;">
          <tr><td style="padding:6px 0; color:#666; width:120px;">Name:</td><td style="padding:6px 0; font-weight:600; color:#222;">${order.shipping_name || 'N/A'}</td></tr>
          <tr><td style="padding:6px 0; color:#666;">Phone:</td><td style="padding:6px 0; font-weight:600; color:#222;"><a href="tel:${order.shipping_phone}" style="color:#2E7D32; text-decoration:none;">${order.shipping_phone || 'N/A'}</a></td></tr>
          <tr><td style="padding:6px 0; color:#666;">Email:</td><td style="padding:6px 0; color:#222;"><a href="mailto:${order.shipping_email}" style="color:#2E7D32; text-decoration:none;">${order.shipping_email || 'N/A'}</a></td></tr>
          <tr><td style="padding:6px 0; color:#666;">Delivery Address:</td><td style="padding:6px 0; color:#222;">${[order.shipping_address, order.shipping_city, order.shipping_region].filter(Boolean).join(', ') || 'N/A'}</td></tr>
          ${order.shipping_gps ? `<tr><td style="padding:6px 0; color:#666;">GhanaPost GPS:</td><td style="padding:6px 0; font-family:monospace;">${order.shipping_gps}</td></tr>` : ''}
          ${order.shipping_notes ? `<tr><td style="padding:6px 0; color:#666;">Delivery Notes:</td><td style="padding:6px 0; font-style:italic; color:#555;">${order.shipping_notes}</td></tr>` : ''}
        </table>

        <h3 style="font-size:15px; text-transform:uppercase; letter-spacing:1px; color:#888; margin:0 0 12px;">Items Ordered</h3>
        <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
          <thead>
            <tr style="background:#F0EDE6; text-align:left;">
              <th style="padding:8px 12px; font-size:12px; color:#555;">Product</th>
              <th style="padding:8px 12px; font-size:12px; color:#555; text-align:center;">Qty</th>
              <th style="padding:8px 12px; font-size:12px; color:#555; text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:10px 12px; text-align:right; color:#666; font-size:14px;">Subtotal:</td>
              <td style="padding:10px 12px; text-align:right; font-weight:600; font-size:14px;">GH₵ ${Number(order.subtotal).toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:6px 12px; text-align:right; color:#666; font-size:14px;">Delivery Fee:</td>
              <td style="padding:6px 12px; text-align:right; font-weight:600; font-size:14px;">GH₵ ${Number(order.delivery_fee || 15).toFixed(2)}</td>
            </tr>
            <tr style="border-top:2px solid #1B5E20;">
              <td colspan="2" style="padding:12px; text-align:right; font-weight:800; font-size:16px; color:#1B5E20;">GRAND TOTAL:</td>
              <td style="padding:12px; text-align:right; font-weight:800; font-size:18px; color:#1B5E20;">GH₵ ${Number(order.total).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Quick Action Buttons -->
        <div style="text-align:center; margin-top:28px;">
          ${order.shipping_phone ? `
            <a href="https://wa.me/${(order.shipping_phone || '').replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(order.shipping_name || '')},%20this%20is%20Soniviva%20Market%20regarding%20your%20order%20${encodeURIComponent(order.order_number)}" 
               style="display:inline-block; background:#25D366; color:#ffffff; padding:12px 22px; border-radius:8px; font-weight:600; font-size:14px; text-decoration:none; margin-right:8px; margin-bottom:8px;">
              💬 WhatsApp Customer
            </a>
          ` : ''}
          <a href="https://soniviva-market.vercel.app/admin/" 
             style="display:inline-block; background:#1B5E20; color:#ffffff; padding:12px 22px; border-radius:8px; font-weight:600; font-size:14px; text-decoration:none; margin-bottom:8px;">
            🛒 Open Admin Dashboard
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#F8FBF8; padding:20px 28px; text-align:center; border-top:1px solid #E5E2DB;">
        <p style="margin:0; font-size:12px; color:#999;">
          © 2026 SONIVIVA by Rita Foods and Co. Admin Notification Dispatcher
        </p>
      </div>
    </div>
  </body>
  </html>
  `;

  const transport = getTransporter();
  if (transport) {
    try {
      await transport.sendMail({
        from: `"SONIVIVA Orders" <${SMTP_USER}>`,
        to: ADMIN_EMAIL,
        subject: `🛒 [NEW ORDER] #${order.order_number} — GH₵ ${Number(order.total).toFixed(2)} (${order.shipping_name})`,
        html: emailHtml
      });
      console.log(`📧 Order notification email sent to ${ADMIN_EMAIL}`);
    } catch (emailErr) {
      console.error('Failed to send order email to admin:', emailErr.message);
    }
  } else {
    console.log(`📧 [ORDER EMAIL SIMULATED] Would send to ${ADMIN_EMAIL} for Order #${order.order_number}`);
  }

  return {
    success: true,
    whatsappLink: generateWhatsAppOrderLink(order, items)
  };
}

/**
 * Notify admin when a user adds something to their cart
 * Sends in-app DB notification + throttled email alert
 */
let _lastCartEmailTime = 0;
const CART_EMAIL_THROTTLE_MS = 5 * 60 * 1000; // 5 minutes

async function notifyCartActivity(cartData) {
  const db = getDb();
  const { productId, productName, quantity, userEmail, userName, price } = cartData;
  const customer = userName || userEmail || 'A visitor';
  const title = `Cart Activity: ${productName}`;
  const message = `${customer} added ${quantity}x ${productName} (GH₵ ${Number(price * quantity).toFixed(2)}) to cart.`;

  // 1. In-App Database Notification
  try {
    db.prepare(`
      INSERT INTO notifications (type, title, message, data)
      VALUES (?, ?, ?, ?)
    `).run('cart', title, message, JSON.stringify({
      productId,
      productName,
      quantity,
      price,
      customerEmail: userEmail || '',
      customerName: userName || '',
      timestamp: new Date().toISOString()
    }));
    console.log(`🛒 [CART NOTIFICATION] Logged in database: ${customer} added ${productName}`);
  } catch (err) {
    console.error('Failed to log cart notification in DB:', err.message);
  }

  // 2. Email Alert (throttled to avoid spam — max 1 email per 5 minutes)
  const now = Date.now();
  if (now - _lastCartEmailTime < CART_EMAIL_THROTTLE_MS) {
    console.log(`📧 [CART EMAIL THROTTLED] Skipping — last email sent ${Math.round((now - _lastCartEmailTime) / 1000)}s ago`);
    return;
  }

  const transport = getTransporter();
  if (transport) {
    _lastCartEmailTime = now;
    const cartEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="margin:0; padding:0; background:#FAF9F6; font-family:'Segoe UI', Arial, sans-serif; color:#2D2D2D;">
      <div style="max-width:540px; margin:30px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 6px 25px rgba(0,0,0,0.06); border:1px solid #E5E2DB;">
        <div style="background:linear-gradient(135deg, #1B5E20, #2E7D32); padding:24px 28px; text-align:center;">
          <h1 style="color:#ffffff; margin:0; font-size:22px; letter-spacing:2px; font-weight:800;">SONI<span style="color:#D4A017;">VIVA</span></h1>
          <p style="color:#E8F5E9; margin:6px 0 0; font-size:13px;">🛍️ Cart Activity Alert</p>
        </div>
        <div style="padding:28px;">
          <div style="background:#FFF8E1; border-left:4px solid #F9A825; padding:14px 18px; border-radius:4px; margin-bottom:20px;">
            <strong style="color:#E65100; font-size:15px;">🛒 ${customer} added to cart</strong>
          </div>
          <table style="width:100%; font-size:14px; border-collapse:collapse;">
            <tr><td style="padding:8px 0; color:#666; width:120px;">Product:</td><td style="padding:8px 0; font-weight:600;">${productName}</td></tr>
            <tr><td style="padding:8px 0; color:#666;">Quantity:</td><td style="padding:8px 0; font-weight:600;">x${quantity}</td></tr>
            <tr><td style="padding:8px 0; color:#666;">Price:</td><td style="padding:8px 0; font-weight:600; color:#1B5E20;">GH₵ ${Number(price * quantity).toFixed(2)}</td></tr>
            <tr><td style="padding:8px 0; color:#666;">Customer:</td><td style="padding:8px 0;">${customer}</td></tr>
            ${userEmail ? `<tr><td style="padding:8px 0; color:#666;">Email:</td><td style="padding:8px 0;"><a href="mailto:${userEmail}" style="color:#2E7D32;">${userEmail}</a></td></tr>` : ''}
            <tr><td style="padding:8px 0; color:#666;">Time:</td><td style="padding:8px 0;">${new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</td></tr>
          </table>
          <div style="text-align:center; margin-top:24px;">
            <a href="https://soniviva-market.vercel.app/admin/" style="display:inline-block; background:#1B5E20; color:#ffffff; padding:12px 24px; border-radius:8px; font-weight:600; font-size:14px; text-decoration:none;">🛒 Open Admin Dashboard</a>
          </div>
        </div>
        <div style="background:#F8FBF8; padding:16px 28px; text-align:center; border-top:1px solid #E5E2DB;">
          <p style="margin:0; font-size:11px; color:#999;">© 2026 SONIVIVA by Rita Foods and Co. Cart Activity Alert</p>
        </div>
      </div>
    </body>
    </html>
    `;

    try {
      await transport.sendMail({
        from: `"SONIVIVA Store" <${SMTP_USER}>`,
        to: ADMIN_EMAIL,
        subject: `🛍️ Cart Activity: ${customer} added ${productName} — SONIVIVA`,
        html: cartEmailHtml
      });
      console.log(`📧 Cart activity email sent to ${ADMIN_EMAIL}`);
    } catch (emailErr) {
      console.error('Failed to send cart email:', emailErr.message);
    }
  } else {
    console.log(`📧 [CART EMAIL SIMULATED] Would send to ${ADMIN_EMAIL} for ${productName}`);
  }
}

module.exports = {
  notifyOrderPlaced,
  notifyCartActivity,
  generateWhatsAppOrderLink,
  ADMIN_EMAIL,
  ADMIN_WHATSAPP,
  ADMIN_PHONE
};
