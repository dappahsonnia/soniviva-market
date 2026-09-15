/* =========================================
   SONIVIVA — Public / User Orders Route
   Handles order placement for both guests & logged-in users
   ========================================= */
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { optionalAuth } = require('../middleware/auth');
const { sendOrderNotificationEmail } = require('../utils/email');

// POST /api/orders
router.post('/', optionalAuth, (req, res) => {
  try {
    const db = getDb();
    const { items, shipping, payment } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'Cart is empty' });

    const orderNumber = 'SNV-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    let subtotal = 0;
    const resolved = items.map(item => {
      const p = db.prepare('SELECT * FROM products WHERE id=?').get(item.product_id || item.id);
      if (!p) return null;
      const qty = parseInt(item.quantity) || 1;
      const t = p.price * qty;
      subtotal += t;
      return { product_id: p.id, product_name: p.name, quantity: qty, unit_price: p.price, total: t };
    }).filter(Boolean);

    if (!resolved.length) {
      return res.status(400).json({ error: 'No valid products in order' });
    }

    const deliveryFee = 15.00;
    const total = subtotal + deliveryFee;
    const s = shipping || {};
    const p = payment || {};
    const userId = req.user ? req.user.id : null;
    const customerName = s.name || (req.user ? req.user.name : '') || 'Customer';
    const customerEmail = s.email || (req.user ? req.user.email : '') || '';
    const customerPhone = s.phone || (req.user ? req.user.phone : '') || '';

    const r = db.prepare(`
      INSERT INTO orders (
        user_id, order_number, status, subtotal, delivery_fee, total,
        shipping_name, shipping_email, shipping_phone, shipping_address,
        shipping_city, shipping_region, shipping_gps, shipping_notes,
        payment_method, payment_details
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      userId, orderNumber, 'pending', subtotal, deliveryFee, total,
      customerName, customerEmail, customerPhone, s.address || '',
      s.city || '', s.region || '', s.gps || '', s.notes || '',
      p.method || '', JSON.stringify(p)
    );

    const orderId = r.lastInsertRowid;
    const stmt = db.prepare('INSERT INTO order_items (order_id,product_id,product_name,quantity,unit_price,total) VALUES (?,?,?,?,?,?)');
    resolved.forEach(i => {
      stmt.run(orderId, i.product_id, i.product_name, i.quantity, i.unit_price, i.total);
    });

    resolved.forEach(i => {
      db.prepare('UPDATE products SET stock=MAX(0,stock-?) WHERE id=?').run(i.quantity, i.product_id);
    });

    // ─── Notify Admin ───
    // 1. In-app notification for admin panel
    const itemsSummary = resolved.map(i => `${i.product_name} ×${i.quantity}`).join(', ');
    try {
      db.prepare(`INSERT INTO notifications (type, title, message, order_id) VALUES (?, ?, ?, ?)`)
        .run(
          'order',
          `New Order ${orderNumber}`,
          `${customerName} placed an order for GH₵ ${total.toFixed(2)} — ${itemsSummary}`,
          orderId
        );
    } catch (notifErr) {
      console.warn('Notification insert failed:', notifErr.message);
    }

    // 2. Email notification to dappahsonnia@gmail.com (async, non-blocking)
    try {
      sendOrderNotificationEmail({
        orderNumber, total, subtotal, deliveryFee,
        customerName, customerEmail, customerPhone,
        shippingAddress: s.address || '',
        shippingCity: s.city || '',
        shippingRegion: s.region || '',
        paymentMethod: p.method || '',
        items: resolved,
        createdAt: new Date().toISOString()
      }).catch(err => console.warn('Email notification error:', err.message));
    } catch (emailErr) {
      console.warn('Email module error:', emailErr.message);
    }

    res.status(201).json({ message: 'Order placed successfully', orderNumber, orderId, total });
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

module.exports = router;
