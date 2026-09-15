/* =========================================
   SONIVIVA — User Routes
   ========================================= */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// GET /api/user/profile
router.get('/profile', (req, res) => {
  try {
    const u = getDb().prepare('SELECT id,name,email,phone,role,address,city,region,created_at FROM users WHERE id=?').get(req.user.id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    res.json(u);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// PUT /api/user/profile
router.put('/profile', (req, res) => {
  try {
    const b = req.body;
    const db = getDb();
    db.prepare('UPDATE users SET name=?,phone=?,address=?,city=?,region=? WHERE id=?')
      .run(b.name || '', b.phone || '', b.address || '', b.city || '', b.region || '', req.user.id);
    const updated = db.prepare('SELECT id,name,email,phone,role,address,city,region,created_at FROM users WHERE id=?').get(req.user.id);
    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/user/change-password
router.post('/change-password', (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hash = bcrypt.hashSync(newPassword, 12);
    db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(hash, req.user.id);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// POST /api/user/orders
router.post('/orders', (req, res) => {
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

    const deliveryFee = 15.00;
    const total = subtotal + deliveryFee;
    const s = shipping || {};
    const p = payment || {};

    const r = db.prepare(`
      INSERT INTO orders (
        user_id, order_number, status, subtotal, delivery_fee, total,
        shipping_name, shipping_email, shipping_phone, shipping_address,
        shipping_city, shipping_region, shipping_gps, shipping_notes,
        payment_method, payment_details
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      req.user.id, orderNumber, 'pending', subtotal, deliveryFee, total,
      s.name || req.user.name, s.email || req.user.email, s.phone || '', s.address || '',
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
    const customerName = s.name || req.user.name || 'Customer';
    const customerEmail = s.email || req.user.email || '';
    const customerPhone = s.phone || '';

    // 1. Insert in-app notification
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

    // 2. Send email notification (async, non-blocking)
    try {
      const { sendOrderNotificationEmail } = require('../utils/email');
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

// GET /api/user/orders
router.get('/orders', (req, res) => {
  try {
    const db = getDb();
    const orders = db.prepare('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC').all(req.user.id);
    orders.forEach(o => {
      o.items = db.prepare('SELECT * FROM order_items WHERE order_id=?').all(o.id);
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/user/orders/:id
router.get('/orders/:id', (req, res) => {
  try {
    const db = getDb();
    const o = db.prepare('SELECT * FROM orders WHERE id=? AND user_id=?').get(parseInt(req.params.id), req.user.id);
    if (!o) return res.status(404).json({ error: 'Order not found' });
    o.items = db.prepare('SELECT * FROM order_items WHERE order_id=?').all(o.id);
    res.json(o);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

module.exports = router;
