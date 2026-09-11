/* =========================================
   SONIVIVA — Express Server
   ========================================= */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { initDatabase } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Ensure Database Initialized ───
let initDbPromise = null;
function ensureDb() {
  if (!initDbPromise) {
    initDbPromise = initDatabase().catch(err => {
      console.error('Database initialization error:', err);
      initDbPromise = null; // allow retry on next request
      throw err;
    });
  }
  return initDbPromise;
}

// ─── Middleware ───
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Static files (served immediately without DB dependency) ───
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(__dirname, {
  extensions: ['html'],
  index: 'index.html'
}));

// Database readiness check for /api requests
app.use('/api', async (req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database service unavailable', details: err.message });
  }
});

// ─── API Routes ───
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/user', require('./routes/user'));

// ─── API Products endpoint (public) ───
app.get('/api/products', (req, res) => {
  const { getDb } = require('./db/database');
  const db = getDb();
  const products = db.prepare(`SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id`).all();
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const { getDb } = require('./db/database');
  const db = getDb();
  const product = db.prepare(`SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?`).get(parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.get('/api/categories', (req, res) => {
  const { getDb } = require('./db/database');
  const db = getDb();
  const categories = db.prepare(`SELECT c.*, (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count FROM categories c ORDER BY c.id`).all();
  res.json(categories);
});

// ─── Error handler ───
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start server (Standalone / Local / Render) ───
if (require.main === module && !process.env.VERCEL) {
  ensureDb().then(() => {
    app.listen(PORT, () => {
      console.log('');
      console.log('  ╔═══════════════════════════════════════╗');
      console.log('  ║   🛒 SONIVIVA E-Commerce Server       ║');
      console.log('  ║   Fresh Flavors, Delivered to Your Door║');
      console.log('  ╠═══════════════════════════════════════╣');
      console.log(`  ║   🌐 http://localhost:${PORT}             ║`);
      console.log(`  ║   🔑 Admin: dappahsonnia@gmail.com     ║`);
      console.log('  ╚═══════════════════════════════════════╝');
      console.log('');
    });
  }).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = app;
