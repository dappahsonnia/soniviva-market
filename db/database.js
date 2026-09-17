/* =========================================
   SONIVIVA — Database Layer (sql.js)
   Pure JavaScript SQLite via WebAssembly
   ========================================= */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const os = require('os');
const isVercel = Boolean(process.env.VERCEL);
const DB_PATH = isVercel
  ? path.join(os.tmpdir(), 'soniviva.db')
  : path.join(__dirname, 'soniviva.db');

let db = null;

// ─── save helper: persist in-memory db to disk ───
function saveDatabase() {
  if (!db) return;
  try {
    const raw = db._db || db;
    const data = raw.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    // In serverless environments, ignore read-only disk warnings; memory db is maintained
    console.warn('Database disk write skipped/failed:', err.message);
  }
}

// ─── Wrapper to give sql.js a better-sqlite3-like API ───
class Database {
  constructor(sqlDb) {
    this._db = sqlDb;
  }

  prepare(sql) {
    const _db = this._db;
    return {
      run(...params) {
        _db.run(sql, params.length === 1 && typeof params[0] === 'object' && !Array.isArray(params[0]) ? Object.values(params[0]) : params);
        const info = { changes: _db.getRowsModified(), lastInsertRowid: 0 };
        try {
          const r = _db.exec("SELECT last_insert_rowid() as id");
          if (r.length > 0 && r[0].values && r[0].values.length > 0) {
            info.lastInsertRowid = r[0].values[0][0];
          }
        } catch (e) {}
        saveDatabase();
        return info;
      },
      get(...params) {
        try {
          const stmt = _db.prepare(sql);
          if (params.length === 1 && typeof params[0] === 'object' && !Array.isArray(params[0])) {
            stmt.bind(Object.values(params[0]));
          } else if (params.length > 0) {
            stmt.bind(params);
          }
          if (stmt.step()) {
            const cols = stmt.getColumnNames();
            const vals = stmt.get();
            stmt.free();
            const row = {};
            cols.forEach((c, i) => row[c] = vals[i]);
            return row;
          }
          stmt.free();
          return undefined;
        } catch (e) {
          return undefined;
        }
      },
      all(...params) {
        try {
          const stmt = _db.prepare(sql);
          if (params.length === 1 && typeof params[0] === 'object' && !Array.isArray(params[0])) {
            stmt.bind(Object.values(params[0]));
          } else if (params.length > 0) {
            stmt.bind(params);
          }
          const rows = [];
          const cols = stmt.getColumnNames();
          while (stmt.step()) {
            const vals = stmt.get();
            const row = {};
            cols.forEach((c, i) => row[c] = vals[i]);
            rows.push(row);
          }
          stmt.free();
          return rows;
        } catch (e) {
          return [];
        }
      }
    };
  }

  exec(sql) {
    this._db.exec(sql);
    saveDatabase();
  }

  close() {
    this._db.close();
  }
}

// ─── Initialize database ───
async function initDatabase() {
  if (db) return db;

  let wasmBinary = null;
  const localWasm = path.join(__dirname, 'sql-wasm.wasm');
  const nmWasm = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');

  if (fs.existsSync(localWasm)) {
    try {
      wasmBinary = fs.readFileSync(localWasm);
    } catch (e) {}
  } else if (fs.existsSync(nmWasm)) {
    try {
      wasmBinary = fs.readFileSync(nmWasm);
    } catch (e) {}
  }

  const sqlOptions = {
    locateFile: file => {
      if (fs.existsSync(localWasm)) return localWasm;
      if (fs.existsSync(nmWasm)) return nmWasm;
      return file;
    }
  };
  if (wasmBinary) {
    sqlOptions.wasmBinary = wasmBinary;
  }

  const SQL = await initSqlJs(sqlOptions);

  const prebuiltPath = path.join(__dirname, 'soniviva.db');

  // Load existing database or create new one
  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new Database(new SQL.Database(fileBuffer));
      createTables();
      console.log('📦 Loaded existing database from', DB_PATH);
    } catch (e) {
      console.warn('Could not read existing database, creating fresh:', e.message);
      db = new Database(new SQL.Database());
      createTables();
      seedData();
    }
  } else if (fs.existsSync(prebuiltPath)) {
    try {
      const fileBuffer = fs.readFileSync(prebuiltPath);
      db = new Database(new SQL.Database(fileBuffer));
      createTables();
      console.log('📦 Loaded prebuilt database from', prebuiltPath);
      // Try to copy to writable DB_PATH for subsequent operations
      try {
        fs.writeFileSync(DB_PATH, fileBuffer);
      } catch (err) {}
    } catch (e) {
      db = new Database(new SQL.Database());
      createTables();
      seedData();
    }
  } else {
    db = new Database(new SQL.Database());
    console.log('🆕 Created new database');
    createTables();
    seedData();
    console.log('✅ Database initialized with schema and seed data');
  }

  // Ensure default accounts exist with updated credentials
  syncDefaultUsers();

  return db;
}

// ─── Ensure default accounts exist with updated credentials ───
function syncDefaultUsers() {
  if (!db) return;
  // 1. Admin account
  const adminEmail = 'dappahsonnia@gmail.com';
  const adminPass = 'Sonnita0275';
  const adminHash = bcrypt.hashSync(adminPass, 12);
  const existingAdmin = db.prepare('SELECT id, role, password_hash FROM users WHERE LOWER(TRIM(email)) = ?').get(adminEmail);

  if (existingAdmin) {
    // Preserve admin role and existing password (do not overwrite if admin changed/reset their password)
    if (!existingAdmin.password_hash) {
      db.prepare('UPDATE users SET role = ?, password_hash = ?, name = ? WHERE id = ?')
        .run('admin', adminHash, 'Sonnia Dappah (Admin)', existingAdmin.id);
    } else {
      db.prepare("UPDATE users SET role = 'admin', name = COALESCE(NULLIF(name, ''), 'Sonnia Dappah (Admin)') WHERE id = ?")
        .run(existingAdmin.id);
    }
    console.log('🔑 Admin account verified for:', adminEmail);
  } else {
    db.prepare('INSERT INTO users (name, email, phone, password_hash, role, city, region) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run('Sonnia Dappah (Admin)', adminEmail, '+233 24 123 4567', adminHash, 'admin', 'Accra', 'Greater Accra');
    console.log('🔑 Created primary admin account for:', adminEmail);
  }

  // 2. Default customer account (Blessing Amoah Takyi)
  const blessingEmail = 'blessingoamoahtakyi@gmail.com';
  const existingBlessing = db.prepare('SELECT id, role FROM users WHERE LOWER(TRIM(email)) = ?').get(blessingEmail);
  if (!existingBlessing) {
    const blessingHash = bcrypt.hashSync('Blessing123', 10);
    db.prepare('INSERT INTO users (name, email, phone, password_hash, role, city, region) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run('Blessing Amoah Takyi', blessingEmail, '+233 24 123 4567', blessingHash, 'user', 'Accra', 'Greater Accra');
    console.log('👤 Seeded customer account for:', blessingEmail);
  }
}

function syncAdminUser() {
  syncDefaultUsers();
}

// ─── Create tables ───
function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT DEFAULT '',
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('admin','user')),
      address TEXT DEFAULT '',
      city TEXT DEFAULT '',
      region TEXT DEFAULT '',
      created_at DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      emoji TEXT DEFAULT '',
      gradient TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      created_at DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category_id INTEGER REFERENCES categories(id),
      unit TEXT DEFAULT '',
      emoji TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      description TEXT DEFAULT '',
      vendor TEXT DEFAULT 'soniviva',
      stock INTEGER DEFAULT 100,
      featured INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      is_perishable INTEGER DEFAULT 0,
      price_per_unit REAL,
      unit_label TEXT DEFAULT '',
      unit_options TEXT DEFAULT '',
      is_hamper INTEGER DEFAULT 0,
      hamper_items TEXT DEFAULT '',
      created_at DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      order_number TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
      subtotal REAL NOT NULL DEFAULT 0,
      delivery_fee REAL DEFAULT 15.00,
      total REAL NOT NULL DEFAULT 0,
      shipping_name TEXT DEFAULT '',
      shipping_email TEXT DEFAULT '',
      shipping_phone TEXT DEFAULT '',
      shipping_address TEXT DEFAULT '',
      shipping_city TEXT DEFAULT '',
      shipping_region TEXT DEFAULT '',
      shipping_gps TEXT DEFAULT '',
      shipping_notes TEXT DEFAULT '',
      payment_method TEXT DEFAULT '',
      payment_details TEXT DEFAULT '',
      created_at DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER,
      product_name TEXT DEFAULT '',
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT (datetime('now'))
    );
  `);
}

// ─── Seed data ───
function seedData() {
  // ── Admin account ──
  const adminHash = bcrypt.hashSync('Sonnita0275', 12);
  db.prepare(`INSERT INTO users (name, email, phone, password_hash, role, city, region) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run('Sonnia Dappah (Admin)', 'dappahsonnia@gmail.com', '+233 24 123 4567', adminHash, 'admin', 'Accra', 'Greater Accra');

  // ── Customer account ──
  const blessingHash = bcrypt.hashSync('Blessing123', 10);
  db.prepare(`INSERT OR IGNORE INTO users (name, email, phone, password_hash, role, city, region) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run('Blessing Amoah Takyi', 'blessingoamoahtakyi@gmail.com', '+233 24 123 4567', blessingHash, 'user', 'Accra', 'Greater Accra');

  // ── Categories ──
  const categories = [
    ['Grains & Cereals', '🌾', 'linear-gradient(135deg, #F5E6CA, #DEB887)', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&auto=format&q=80'],
    ['Fresh Produce', '🥬', 'linear-gradient(135deg, #C8E6C9, #81C784)', 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop&auto=format&q=80'],
    ['Spices & Seasonings', '🌶️', 'linear-gradient(135deg, #FFCCBC, #FF8A65)', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop&auto=format&q=80'],
    ['Dairy & Eggs', '🥛', 'linear-gradient(135deg, #E3F2FD, #90CAF9)', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format&q=80'],
    ['Oils & Condiments', '🫒', 'linear-gradient(135deg, #FFF9C4, #FFF176)', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop&auto=format&q=80'],
    ['Beverages', '🍵', 'linear-gradient(135deg, #F3E5F5, #CE93D8)', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop&auto=format&q=80'],
    ['Provisions', '🏪', 'linear-gradient(135deg, #FFE0B2, #FFB74D)', 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop&auto=format&q=80'],
    ['Hampers', '🧺', 'linear-gradient(135deg, #FFCDD2, #EF9A9A)', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed514?w=400&h=300&fit=crop&auto=format&q=80']
  ];
  const catStmt = db.prepare(`INSERT INTO categories (name, emoji, gradient, image_url) VALUES (?, ?, ?, ?)`);
  categories.forEach(c => catStmt.run(...c));

  // ── Products ──
  const prodStmt = db.prepare(`INSERT INTO products (name, price, category_id, unit, emoji, image_url, description, vendor, stock, featured, rating, is_perishable, price_per_unit, unit_label, unit_options, is_hamper, hamper_items) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  const prods = [
    // Grains & Cereals (cat 1)
    ['Premium Basmati Rice', 89.99, 1, '5kg bag', '🍚', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&auto=format&q=80', 'Extra-long grain basmati rice, aged for superior aroma and fluffy texture.', 'goldenHarvest', 150, 1, 4.8, 0, null, '', '', 0, ''],
    ['Local Brown Rice', 35.00, 1, '2kg bag', '🌾', 'https://images.unsplash.com/photo-1536304993881-460e4c8bc7c3?w=400&h=300&fit=crop&auto=format&q=80', 'Nutritious whole-grain brown rice from the Volta Region.', 'farmDirect', 200, 0, 4.5, 0, null, '', '', 0, ''],
    ['Jasmine Rice', 79.99, 1, '5kg bag', '🍚', 'https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?w=400&h=300&fit=crop&auto=format&q=80', 'Fragrant Thai jasmine rice with soft, sticky texture.', 'goldenHarvest', 120, 0, 4.6, 0, null, '', '', 0, ''],
    ['Corn Flour (Ablemamu)', 18.50, 1, '1kg pack', '🌽', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&auto=format&q=80', 'Finely milled corn flour for banku, kenkey, and traditional staples.', 'goldenHarvest', 300, 0, 4.3, 0, null, '', '', 0, ''],
    ['Wheat Flour', 28.00, 1, '2kg pack', '🌾', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop&auto=format&q=80', 'All-purpose wheat flour for baking and frying.', 'goldenHarvest', 250, 0, 4.4, 0, null, '', '', 0, ''],
    ['Rolled Oats', 22.00, 1, '500g pack', '🥣', 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=300&fit=crop&auto=format&q=80', 'Whole grain rolled oats for a healthy breakfast.', 'soniviva', 180, 1, 4.7, 0, null, '', '', 0, ''],

    // Fresh Produce (cat 2) — perishable
    ['Fresh Tomatoes', 15.00, 2, 'per kg', '🍅', 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=300&fit=crop&auto=format&q=80', 'Vine-ripened, juicy tomatoes from local farms.', 'farmDirect', 500, 1, 4.6, 1, 15.00, 'kg', '[{"value":0.5,"label":"500g"},{"value":1,"label":"1kg"},{"value":2,"label":"2kg"},{"value":3,"label":"3kg"},{"value":5,"label":"5kg"}]', 0, ''],
    ['Garden Eggs', 12.00, 2, 'per kg', '🍆', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=300&fit=crop&auto=format&q=80', 'Fresh garden eggs (African eggplant) for stew.', 'farmDirect', 400, 0, 4.4, 1, 12.00, 'kg', '[{"value":0.5,"label":"500g"},{"value":1,"label":"1kg"},{"value":2,"label":"2kg"},{"value":3,"label":"3kg"}]', 0, ''],
    ['Fresh Pepper Mix', 18.00, 2, 'per kg', '🌶️', 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400&h=300&fit=crop&auto=format&q=80', 'Scotch bonnet, shito peppers, and green chili mix.', 'farmDirect', 350, 0, 4.5, 1, 18.00, 'kg', '[{"value":0.25,"label":"250g"},{"value":0.5,"label":"500g"},{"value":1,"label":"1kg"},{"value":2,"label":"2kg"}]', 0, ''],
    ['Ripe Plantain', 5.00, 2, 'per finger', '🍌', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop&auto=format&q=80', 'Sweet, ripe plantains for frying or roasting.', 'farmDirect', 600, 1, 4.8, 1, 5.00, 'finger', '[{"value":3,"label":"3 fingers"},{"value":5,"label":"5 fingers"},{"value":7,"label":"7 fingers"},{"value":10,"label":"10 fingers"}]', 0, ''],
    ['Sweet Potatoes', 14.00, 2, 'per kg', '🍠', 'https://images.unsplash.com/photo-1596097635121-14b63a7e0c75?w=400&h=300&fit=crop&auto=format&q=80', 'Locally grown sweet potatoes with creamy orange flesh.', 'farmDirect', 400, 0, 4.3, 1, 14.00, 'kg', '[{"value":0.5,"label":"500g"},{"value":1,"label":"1kg"},{"value":2,"label":"2kg"},{"value":5,"label":"5kg"}]', 0, ''],
    ['Fresh Onions', 18.00, 2, 'per kg', '🧅', 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=400&h=300&fit=crop&auto=format&q=80', 'Premium red onions, firm and full of flavor.', 'farmDirect', 450, 0, 4.5, 1, 18.00, 'kg', '[{"value":0.5,"label":"500g"},{"value":1,"label":"1kg"},{"value":2,"label":"2kg"},{"value":5,"label":"5kg"}]', 0, ''],

    // Spices & Seasonings (cat 3)
    ['Dried Shrimp', 45.00, 3, '200g pack', '🦐', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop&auto=format&q=80', 'Sun-dried shrimp for rich umami flavor.', 'spiceMasters', 200, 1, 4.9, 0, null, '', '', 0, ''],
    ['Ground Crayfish', 30.00, 3, '150g pack', '🦀', 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400&h=300&fit=crop&auto=format&q=80', 'Finely ground crayfish for soups.', 'spiceMasters', 250, 0, 4.7, 0, null, '', '', 0, ''],
    ['Dawadawa', 15.00, 3, '100g pack', '🫘', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop&auto=format&q=80', 'Fermented African locust beans for soups and stews.', 'spiceMasters', 300, 0, 4.4, 0, null, '', '', 0, ''],
    ['Curry Powder', 12.00, 3, '100g tin', '🟡', 'https://images.unsplash.com/photo-1607672632458-9eb56696346f?w=400&h=300&fit=crop&auto=format&q=80', 'Aromatic curry powder for rice and chicken.', 'spiceMasters', 400, 0, 4.3, 0, null, '', '', 0, ''],
    ['Ground Ginger', 10.00, 3, '100g pack', '🫚', 'https://images.unsplash.com/photo-1615485500834-bc10c6da38e2?w=400&h=300&fit=crop&auto=format&q=80', 'Dried ground ginger for cooking and teas.', 'spiceMasters', 350, 0, 4.5, 0, null, '', '', 0, ''],
    ['SONIVIVA Spice Blend', 22.00, 3, '150g jar', '✨', 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400&h=300&fit=crop&auto=format&q=80', 'Our signature spice blend — paprika, garlic, onion, thyme, and secret spices.', 'soniviva', 150, 1, 4.9, 0, null, '', '', 0, ''],

    // Dairy & Eggs (cat 4)
    ['Fresh Milk', 24.00, 4, '1 litre', '🥛', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop&auto=format&q=80', 'Fresh pasteurized whole milk from accredited farms.', 'dairyBest', 100, 0, 4.5, 0, null, '', '', 0, ''],
    ['Farm Eggs (Crate)', 55.00, 4, 'Crate of 30', '🥚', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop&auto=format&q=80', 'Farm-fresh eggs from free-range hens.', 'dairyBest', 80, 1, 4.8, 0, null, '', '', 0, ''],
    ['Butter', 32.00, 4, '250g block', '🧈', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=300&fit=crop&auto=format&q=80', 'Premium unsalted butter for baking and cooking.', 'dairyBest', 120, 0, 4.6, 0, null, '', '', 0, ''],
    ['Natural Yoghurt', 18.00, 4, '500ml tub', '🥛', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop&auto=format&q=80', 'Thick, creamy natural yoghurt with live cultures.', 'dairyBest', 90, 0, 4.4, 0, null, '', '', 0, ''],

    // Oils & Condiments (cat 5)
    ['Palm Oil (Zomi)', 35.00, 5, '1 litre bottle', '🟠', 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=400&h=300&fit=crop&auto=format&q=80', 'Pure, unrefined red palm oil for authentic Ghanaian cooking.', 'goldCoastOils', 200, 1, 4.7, 0, null, '', '', 0, ''],
    ['Coconut Oil', 42.00, 5, '500ml bottle', '🥥', 'https://images.unsplash.com/photo-1526346698789-22fd84314424?w=400&h=300&fit=crop&auto=format&q=80', 'Cold-pressed virgin coconut oil.', 'goldCoastOils', 150, 0, 4.6, 0, null, '', '', 0, ''],
    ['Groundnut Oil', 38.00, 5, '1 litre bottle', '🥜', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop&auto=format&q=80', 'High-quality groundnut oil with high smoke point.', 'goldCoastOils', 180, 0, 4.5, 0, null, '', '', 0, ''],
    ['Shea Butter', 30.00, 5, '500g tub', '🫘', 'https://images.unsplash.com/photo-1547592166-23ef7c870df0?w=400&h=300&fit=crop&auto=format&q=80', 'Organic shea butter for cooking.', 'goldCoastOils', 160, 0, 4.4, 0, null, '', '', 0, ''],
    ['Tomato Paste', 16.00, 5, '400g tin', '🍅', 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400&h=300&fit=crop&auto=format&q=80', 'Concentrated tomato paste for stews and jollof.', 'quickMart', 300, 0, 4.3, 0, null, '', '', 0, ''],
    ['Soy Sauce', 14.00, 5, '300ml bottle', '🫗', 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop&auto=format&q=80', 'Naturally brewed soy sauce.', 'quickMart', 200, 0, 4.2, 0, null, '', '', 0, ''],

    // Beverages (cat 6)
    ['Sobolo Mix', 20.00, 6, '200g pack', '🌺', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop&auto=format&q=80', 'Dried hibiscus petals with ginger and spices.', 'tasteGhana', 250, 1, 4.8, 0, null, '', '', 0, ''],
    ['Cocoa Powder', 28.00, 6, '250g tin', '☕', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&auto=format&q=80', 'Premium Ghanaian cocoa powder.', 'tasteGhana', 200, 1, 4.9, 0, null, '', '', 0, ''],
    ['Green Tea', 25.00, 6, '50 tea bags', '🍵', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop&auto=format&q=80', 'Pure green tea bags for a calming brew.', 'tasteGhana', 300, 0, 4.5, 0, null, '', '', 0, ''],
    ['Milo', 35.00, 6, '400g tin', '🟤', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop&auto=format&q=80', 'The original chocolate malt energy drink.', 'quickMart', 250, 0, 4.7, 0, null, '', '', 0, ''],

    // Provisions (cat 7)
    ['Indomie Instant Noodles', 120.00, 7, 'Carton of 40', '🍜', 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=300&fit=crop&auto=format&q=80', 'Chicken flavor instant noodles. Quick meals in 3 minutes.', 'quickMart', 100, 1, 4.7, 0, null, '', '', 0, ''],
    ['Peak Milk (Evaporated)', 96.00, 7, '12 tins', '🥫', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format&q=80', 'Rich, creamy evaporated milk for tea, coffee, and cooking.', 'quickMart', 80, 0, 4.6, 0, null, '', '', 0, ''],
    ['Titus Sardines', 85.00, 7, '10 tins', '🐟', 'https://images.unsplash.com/photo-1611171711912-e3f6b536f532?w=400&h=300&fit=crop&auto=format&q=80', 'Premium sardines in vegetable oil.', 'quickMart', 120, 0, 4.5, 0, null, '', '', 0, ''],
    ['Exeter Corned Beef', 78.00, 7, '6 tins', '🥩', 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop&auto=format&q=80', 'Quality corned beef for sandwiches and stews.', 'quickMart', 100, 0, 4.4, 0, null, '', '', 0, ''],
    ['Sugar', 25.00, 7, '2kg bag', '🍬', 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&h=300&fit=crop&auto=format&q=80', 'Refined white granulated sugar.', 'quickMart', 300, 0, 4.3, 0, null, '', '', 0, ''],
    ['Iodated Salt', 8.00, 7, '1kg pack', '🧂', 'https://images.unsplash.com/photo-1518110925495-5fe2c8f2be87?w=400&h=300&fit=crop&auto=format&q=80', 'Iodated table salt for cooking and seasoning.', 'quickMart', 400, 0, 4.2, 0, null, '', '', 0, ''],
    ['Cabin Biscuits', 42.00, 7, '6 packs', '🍪', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop&auto=format&q=80', 'Classic cabin biscuits — crunchy and satisfying.', 'quickMart', 200, 0, 4.5, 0, null, '', '', 0, ''],
    ['Gari', 45.00, 7, '5kg bag', '🟡', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&auto=format&q=80', 'Premium cassava flakes for soaking, eba, and gari fortor.', 'goldenHarvest', 180, 1, 4.6, 0, null, '', '', 0, ''],
    ['Bournvita', 38.00, 7, '400g tin', '☕', 'https://images.unsplash.com/photo-1610611424854-5e07b2b5b5e0?w=400&h=300&fit=crop&auto=format&q=80', 'Chocolatey malt drink with vitamins and minerals.', 'quickMart', 150, 0, 4.6, 0, null, '', '', 0, ''],
    ['Canned Baked Beans', 54.00, 7, '6 tins (400g)', '🫘', 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&h=300&fit=crop&auto=format&q=80', 'Baked beans in rich tomato sauce.', 'quickMart', 100, 0, 4.3, 0, null, '', '', 0, ''],
    ['Maggi Cubes', 20.00, 7, 'Box of 100', '🟫', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop&auto=format&q=80', 'Seasoning cubes for soups, stews, and rice.', 'quickMart', 500, 0, 4.4, 0, null, '', '', 0, ''],
    ['Ideal Milk', 84.00, 7, '12 tins', '🥛', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop&auto=format&q=80', 'Evaporated filled milk for tea and cooking.', 'quickMart', 100, 0, 4.3, 0, null, '', '', 0, ''],

    // Hampers (cat 8) — Real life Ghanaian items with clear customization note
    ['Essential Kitchen Hamper', 299.00, 8, '1 hamper (10 items)', '🧺', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed514?w=400&h=300&fit=crop&auto=format&q=80', 'Essential kitchen starter containing: 5kg Royal Feast Basmati Rice, 1L Pure Zomi Palm Oil, 1kg Fresh Farm Tomatoes, 1kg Red Onions, Crate of 30 Farm Eggs, 400g Gino Tomato Paste, 100g Curry Powder, 2kg Granulated Sugar, 1kg Iodated Salt, and Box of 100 Maggi Cubes. You can easily add more provisions, spices, or fresh items to your order!', 'soniviva', 50, 1, 4.9, 0, null, '', '', 1, '[1,7,12,20,23,16,27,37,38,43]'],
    ['Family Care Package', 499.00, 8, '1 hamper (15 items)', '👨‍👩‍👧‍👦', 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&h=300&fit=crop&auto=format&q=80', 'Comprehensive home pantry package: 5kg Basmati Rice, 2kg Wheat Flour, 1kg Fresh Tomatoes, 1kg Hot Pepper Mix, 5 fingers Sweet Plantains, 1kg Onions, 200g Sun-Dried Shrimp, Crate of 30 Eggs, 1L Palm Oil, 400g Tomato Paste, 250g Golden Tree Cocoa Powder, Carton of Indomie (40 packs), 12 tins Peak Evaporated Milk, 2kg Sugar, and 1kg Salt. Fully customizable with more food items!', 'soniviva', 30, 1, 4.8, 0, null, '', '', 1, '[1,5,7,9,10,12,13,20,23,27,30,33,34,37,38]'],
    ['Festive Celebration Hamper', 799.00, 8, '1 hamper (20 items)', '🎉', 'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?w=400&h=300&fit=crop&auto=format&q=80', 'Luxury holiday & gift package: 5kg Basmati Rice, 5kg Jasmine Rice, 500g Rolled Oats, 1kg Fresh Tomatoes, 7 fingers Ripe Plantain, 200g Dried Shrimp, 150g SONIVIVA Signature Spice Blend, 1L Fresh Milk, Crate of 30 Eggs, 250g Butter, 1L Palm Oil, 500ml Virgin Coconut Oil, 200g Sobolo Mix, 250g Cocoa Powder, Carton of Indomie, 10 tins Titus Sardines, 6 tins Exeter Corned Beef, 6 packs Cabin Biscuits, 400g Bournvita, and 2kg Sugar. Need extra items or drinks? Add them freely!', 'soniviva', 20, 1, 4.9, 0, null, '', '', 1, '[1,3,6,7,10,13,18,19,20,21,23,24,29,30,33,35,36,39,41,37]'],
    ['Student Starter Hamper', 199.00, 8, '1 hamper (8 items)', '🎓', 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop&auto=format&q=80', 'Budget-friendly semester package: 2kg Volta Brown Rice, Carton of Indomie (40 packs), 10 tins Titus Sardines, 2kg Granulated Sugar, 1kg Iodated Salt, 50 bags Green Tea, 12 tins Peak Milk, and 1L Groundnut Cooking Oil. You can add extra gari, milo, or seasonings to your hamper anytime!', 'soniviva', 40, 0, 4.7, 0, null, '', '', 1, '[2,33,35,37,38,31,34,25]']
  ];

  prods.forEach(p => prodStmt.run(...p));

  console.log(`   → Seeded 1 admin, 8 categories, ${prods.length} products`);
}

// ─── Get database instance ───
function getDb() {
  return db;
}

module.exports = { initDatabase, getDb, saveDatabase };
