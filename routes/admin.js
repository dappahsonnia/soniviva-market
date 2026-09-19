/* =========================================
   SONIVIVA — Admin Routes
   ========================================= */
const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard Stats
router.get('/stats', (req, res) => {
  try {
    const db = getDb();
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get()?.count || 0;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get()?.count || 0;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get()?.count || 0;
    const totalRevenue = db.prepare("SELECT COALESCE(SUM(total),0) as sum FROM orders WHERE status != 'cancelled'").get()?.sum || 0;
    const recentOrders = db.prepare('SELECT o.*, u.name as customer_name, u.email as customer_email FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 10').all();
    const ordersByStatus = db.prepare('SELECT status, COUNT(*) as count FROM orders GROUP BY status').all();
    res.json({ totalProducts, totalUsers, totalOrders, totalRevenue, recentOrders, ordersByStatus });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch stats' }); }
});

// Products CRUD
router.get('/products', (req, res) => {
  try {
    const db = getDb();
    const { search, category } = req.query;
    let sql = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
    const params = [];
    if (search) { sql += ' AND (p.name LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (category) { sql += ' AND c.name = ?'; params.push(category); }
    sql += ' ORDER BY p.id DESC';
    res.json(db.prepare(sql).all(...params));
  } catch (err) { res.status(500).json({ error: 'Failed to fetch products' }); }
});

router.post('/products', (req, res) => {
  try {
    const db = getDb();
    const b = req.body;
    if (!b.name || !b.price) return res.status(400).json({ error: 'Name and price required' });
    const result = db.prepare('INSERT INTO products (name,price,category_id,unit,emoji,image_url,description,vendor,stock,featured,rating,is_perishable,price_per_unit,unit_label,unit_options,is_hamper,hamper_items) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(
      b.name, parseFloat(b.price), b.category_id||null, b.unit||'', b.emoji||'', b.image_url||'', b.description||'', b.vendor||'soniviva', parseInt(b.stock)||100, b.featured?1:0, parseFloat(b.rating)||0, b.is_perishable?1:0, b.price_per_unit||null, b.unit_label||'', b.unit_options||'', b.is_hamper?1:0, b.hamper_items||'');
    res.status(201).json({ message: 'Product created', id: result.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: 'Failed to create product' }); }
});

router.put('/products/:id', (req, res) => {
  try {
    const db = getDb(); const id = parseInt(req.params.id); const b = req.body;
    db.prepare('UPDATE products SET name=?,price=?,category_id=?,unit=?,emoji=?,image_url=?,description=?,vendor=?,stock=?,featured=?,rating=?,is_perishable=?,price_per_unit=?,unit_label=?,unit_options=?,is_hamper=?,hamper_items=? WHERE id=?').run(
      b.name, parseFloat(b.price), b.category_id||null, b.unit||'', b.emoji||'', b.image_url||'', b.description||'', b.vendor||'soniviva', parseInt(b.stock)||100, b.featured?1:0, parseFloat(b.rating)||0, b.is_perishable?1:0, b.price_per_unit||null, b.unit_label||'', b.unit_options||'', b.is_hamper?1:0, b.hamper_items||'', id);
    res.json({ message: 'Product updated' });
  } catch (err) { res.status(500).json({ error: 'Failed to update product' }); }
});

router.delete('/products/:id', (req, res) => {
  try { getDb().prepare('DELETE FROM products WHERE id=?').run(parseInt(req.params.id)); res.json({ message: 'Product deleted' }); }
  catch (err) { res.status(500).json({ error: 'Failed to delete product' }); }
});

// Categories CRUD
router.get('/categories', (req, res) => {
  try { res.json(getDb().prepare('SELECT c.*, (SELECT COUNT(*) FROM products WHERE category_id=c.id) as product_count FROM categories c ORDER BY c.id').all()); }
  catch (err) { res.status(500).json({ error: 'Failed to fetch categories' }); }
});
router.post('/categories', (req, res) => {
  try { const b = req.body; if (!b.name) return res.status(400).json({ error: 'Name required' });
    const r = getDb().prepare('INSERT INTO categories (name,emoji,gradient,image_url) VALUES (?,?,?,?)').run(b.name, b.emoji||'', b.gradient||'', b.image_url||'');
    res.status(201).json({ message: 'Category created', id: r.lastInsertRowid }); } catch (err) { res.status(500).json({ error: 'Failed to create category' }); }
});
router.put('/categories/:id', (req, res) => {
  try { const b = req.body; getDb().prepare('UPDATE categories SET name=?,emoji=?,gradient=?,image_url=? WHERE id=?').run(b.name, b.emoji||'', b.gradient||'', b.image_url||'', parseInt(req.params.id));
    res.json({ message: 'Category updated' }); } catch (err) { res.status(500).json({ error: 'Failed to update' }); }
});
router.delete('/categories/:id', (req, res) => {
  try { const db = getDb(); const id = parseInt(req.params.id);
    const c = db.prepare('SELECT COUNT(*) as c FROM products WHERE category_id=?').get(id)?.c||0;
    if (c > 0) return res.status(400).json({ error: `Cannot delete: ${c} products in category` });
    db.prepare('DELETE FROM categories WHERE id=?').run(id); res.json({ message: 'Category deleted' }); }
  catch (err) { res.status(500).json({ error: 'Failed to delete' }); }
});

// Orders
router.get('/orders', (req, res) => {
  try { const db = getDb(); const { status } = req.query;
    let sql = 'SELECT o.*, u.name as customer_name, u.email as customer_email FROM orders o LEFT JOIN users u ON o.user_id = u.id';
    const params = [];
    if (status && status !== 'all') { sql += ' WHERE o.status=?'; params.push(status); }
    sql += ' ORDER BY o.created_at DESC';
    const orders = db.prepare(sql).all(...params);
    orders.forEach(o => { o.items = db.prepare('SELECT * FROM order_items WHERE order_id=?').all(o.id); });
    res.json(orders); } catch (err) { res.status(500).json({ error: 'Failed to fetch orders' }); }
});
router.put('/orders/:id/status', (req, res) => {
  try { const { status } = req.body;
    if (!['pending','confirmed','processing','shipped','delivered','cancelled'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    getDb().prepare('UPDATE orders SET status=? WHERE id=?').run(status, parseInt(req.params.id));
    res.json({ message: 'Status updated' }); } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

// Users
router.get('/users', (req, res) => {
  try { res.json(getDb().prepare('SELECT id,name,email,phone,role,address,city,region,created_at FROM users ORDER BY id').all()); }
  catch (err) { res.status(500).json({ error: 'Failed' }); }
});
router.put('/users/:id/role', (req, res) => {
  try { const { role } = req.body; const id = parseInt(req.params.id);
    if (!['admin','user'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    if (id === req.user.id) return res.status(400).json({ error: 'Cannot change own role' });
    getDb().prepare('UPDATE users SET role=? WHERE id=?').run(role, id);
    res.json({ message: 'Role updated' }); } catch (err) { res.status(500).json({ error: 'Failed' }); }
});
router.delete('/users/:id', (req, res) => {
  try { const id = parseInt(req.params.id);
    if (id === req.user.id) return res.status(400).json({ error: 'Cannot delete self' });
    getDb().prepare('DELETE FROM users WHERE id=?').run(id);
    res.json({ message: 'User deleted' }); } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

// Settings
router.get('/settings', (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT key, value FROM settings').all();
    const map = {};
    rows.forEach(r => map[r.key] = r.value);
    map.google_client_id = map.google_client_id || process.env.GOOGLE_CLIENT_ID || '';
    res.json(map);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch settings' }); }
});

router.put('/settings', (req, res) => {
  try {
    const db = getDb();
    const { google_client_id } = req.body;
    if (typeof google_client_id === 'string') {
      db.prepare(`
        INSERT INTO settings (key, value) VALUES ('google_client_id', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
      `).run(google_client_id.trim());
    }
    res.json({ message: 'Settings saved successfully' });
  } catch (err) { res.status(500).json({ error: 'Failed to save settings' }); }
});

// Notifications
router.get('/notifications', (req, res) => {
  try {
    const db = getDb();
    const notifications = db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50').all();
    const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE is_read = 0').get()?.count || 0;
    res.json({ notifications, unreadCount });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch notifications' }); }
});

router.put('/notifications/:id/read', (req, res) => {
  try {
    const db = getDb();
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(parseInt(req.params.id));
    res.json({ message: 'Notification marked as read' });
  } catch (err) { res.status(500).json({ error: 'Failed to update notification' }); }
});

router.put('/notifications/read-all', (req, res) => {
  try {
    const db = getDb();
    db.prepare('UPDATE notifications SET is_read = 1 WHERE is_read = 0').run();
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { res.status(500).json({ error: 'Failed to mark all as read' }); }
});

module.exports = router;
