/* =========================================
   SONIVIVA — Email Notification Service
   Sends admin notifications when orders are placed
   ========================================= */

const nodemailer = require('nodemailer');

// Gmail SMTP configuration
const ADMIN_EMAIL = 'dappahsonnia@gmail.com';
const SMTP_USER = process.env.SMTP_USER || ADMIN_EMAIL;
const SMTP_PASS = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  
  if (!SMTP_PASS) {
    console.warn('⚠️  SMTP_PASS / GMAIL_APP_PASSWORD not set — email notifications disabled.');
    console.warn('   Set GMAIL_APP_PASSWORD environment variable to enable email notifications.');
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
 * Send order notification email to admin
 */
async function sendOrderNotificationEmail(orderData) {
  const transport = getTransporter();
  if (!transport) {
    console.log('📧 Email skipped (no SMTP credentials configured)');
    return false;
  }

  const {
    orderNumber, total, subtotal, deliveryFee,
    customerName, customerEmail, customerPhone,
    shippingAddress, shippingCity, shippingRegion,
    paymentMethod, items, createdAt
  } = orderData;

  const dateStr = createdAt
    ? new Date(createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
    : new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

  // Build items table rows
  const itemRows = (items || []).map(item => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px;">${item.product_name}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; text-align: right;">GH₵ ${Number(item.unit_price).toFixed(2)}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; text-align: right; font-weight: 600;">GH₵ ${Number(item.total).toFixed(2)}</td>
    </tr>
  `).join('');

  const htmlBody = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin: 0; padding: 0; background: #f5f6fa; font-family: 'Segoe UI', Arial, sans-serif;">
    <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1B5E20, #2E7D32); padding: 28px 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 2px;">SONI<span style="color: #D4A017;">VIVA</span></h1>
        <p style="color: #E8F5E9; margin: 8px 0 0; font-size: 13px;">🛒 New Order Received!</p>
      </div>
      
      <!-- Order Summary -->
      <div style="padding: 28px 32px;">
        <div style="background: #E8F5E9; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px; border-left: 4px solid #2E7D32;">
          <p style="margin: 0 0 6px; font-size: 13px; color: #666;">Order Number</p>
          <p style="margin: 0; font-size: 20px; font-weight: 800; color: #1B5E20; font-family: monospace;">${orderNumber}</p>
          <p style="margin: 8px 0 0; font-size: 12px; color: #888;">${dateStr}</p>
        </div>

        <!-- Customer Info -->
        <h3 style="font-size: 14px; color: #1B5E20; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">👤 Customer Information</h3>
        <table style="width: 100%; margin-bottom: 24px; font-size: 14px;">
          <tr><td style="padding: 6px 0; color: #888; width: 120px;">Name</td><td style="padding: 6px 0; font-weight: 600;">${customerName || 'N/A'}</td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Email</td><td style="padding: 6px 0;"><a href="mailto:${customerEmail}" style="color: #1B5E20;">${customerEmail || 'N/A'}</a></td></tr>
          <tr><td style="padding: 6px 0; color: #888;">Phone</td><td style="padding: 6px 0;">${customerPhone || 'Not provided'}</td></tr>
        </table>

        <!-- Shipping -->
        <h3 style="font-size: 14px; color: #1B5E20; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">📍 Delivery Address</h3>
        <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px; padding: 12px 16px; background: #FAFAFA; border-radius: 8px; border: 1px solid #f0f0f0;">
          ${shippingAddress || '—'}<br>
          ${shippingCity || ''}${shippingCity && shippingRegion ? ', ' : ''}${shippingRegion || ''}
        </p>

        <!-- Payment -->
        <h3 style="font-size: 14px; color: #1B5E20; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">💳 Payment Method</h3>
        <p style="font-size: 14px; margin: 0 0 24px; padding: 10px 16px; background: #FFF8E1; border-radius: 8px; border: 1px solid #FFF3E0; font-weight: 600;">
          ${paymentMethod || 'Not specified'}
        </p>

        <!-- Items Table -->
        <h3 style="font-size: 14px; color: #1B5E20; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">📦 Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #F5F5F5;">
              <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #888; font-weight: 600;">Product</th>
              <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #888; font-weight: 600;">Qty</th>
              <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #888; font-weight: 600;">Unit Price</th>
              <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #888; font-weight: 600;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <!-- Totals -->
        <div style="border-top: 2px solid #E8F5E9; padding-top: 16px;">
          <table style="width: 100%; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #888;">Subtotal</td><td style="padding: 6px 0; text-align: right;">GH₵ ${Number(subtotal).toFixed(2)}</td></tr>
            <tr><td style="padding: 6px 0; color: #888;">Delivery Fee</td><td style="padding: 6px 0; text-align: right;">GH₵ ${Number(deliveryFee).toFixed(2)}</td></tr>
            <tr>
              <td style="padding: 10px 0; font-weight: 800; font-size: 16px; color: #1B5E20;">Grand Total</td>
              <td style="padding: 10px 0; text-align: right; font-weight: 800; font-size: 18px; color: #1B5E20;">GH₵ ${Number(total).toFixed(2)}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #FAFAFA; padding: 20px 32px; text-align: center; border-top: 1px solid #f0f0f0;">
        <p style="margin: 0; font-size: 12px; color: #999;">
          This notification was sent from the <strong>SONIVIVA</strong> e-commerce platform.<br>
          Manage orders at your <a href="https://soniviva-market.vercel.app/admin/orders.html" style="color: #1B5E20;">Admin Dashboard</a>
        </p>
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    await transport.sendMail({
      from: `"SONIVIVA Orders" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `🛒 New Order ${orderNumber} — GH₵ ${Number(total).toFixed(2)} from ${customerName || 'Customer'}`,
      html: htmlBody
    });
    console.log(`📧 Order notification email sent for ${orderNumber}`);
    return true;
  } catch (err) {
    console.error('📧 Email send failed:', err.message);
    return false;
  }
}

module.exports = { sendOrderNotificationEmail };
