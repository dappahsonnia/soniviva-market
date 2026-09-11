-- ═══════════════════════════════════════════════════════════
-- SONIVIVA E-Commerce Platform — Supabase PostgreSQL Schema
-- Fresh Flavors, Delivered to Your Door (Rita Foods and Co.)
-- ═══════════════════════════════════════════════════════════

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT DEFAULT '',
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    address TEXT DEFAULT '',
    city TEXT DEFAULT '',
    region TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    emoji TEXT DEFAULT '',
    gradient TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
    unit TEXT DEFAULT '',
    emoji TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    description TEXT DEFAULT '',
    vendor TEXT DEFAULT 'soniviva',
    stock INTEGER DEFAULT 100,
    featured INTEGER DEFAULT 0,
    rating NUMERIC(3, 1) DEFAULT 0.0,
    is_perishable INTEGER DEFAULT 0,
    price_per_unit NUMERIC(10, 2),
    unit_label TEXT DEFAULT '',
    unit_options JSONB,
    is_hamper INTEGER DEFAULT 0,
    hamper_items JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    delivery_fee NUMERIC(10, 2) DEFAULT 15.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    shipping_name TEXT DEFAULT '',
    shipping_email TEXT DEFAULT '',
    shipping_phone TEXT DEFAULT '',
    shipping_address TEXT DEFAULT '',
    shipping_city TEXT DEFAULT '',
    shipping_region TEXT DEFAULT '',
    shipping_gps TEXT DEFAULT '',
    shipping_notes TEXT DEFAULT '',
    payment_method TEXT DEFAULT '',
    payment_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT DEFAULT '',
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- 7. INDEXES FOR HIGH PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- 8. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access to categories and products
CREATE POLICY "Public categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public products are viewable by everyone" ON public.products FOR SELECT USING (true);

-- 9. SEED PRIMARY ADMIN (dappahsonnia@gmail.com / Sonnita0275)
INSERT INTO public.users (name, email, phone, password_hash, role, city, region)
VALUES (
    'Sonnia Dappah (Admin)',
    'dappahsonnia@gmail.com',
    '0256322653',
    '$2a$12$0G2c9dD7jYgZ7L/Y/3B.6e7C0zR3xQhM8JzT5V2K9P1X8Z0A2B4C6',
    'admin',
    'Accra',
    'Greater Accra'
) ON CONFLICT (email) DO UPDATE 
SET role = 'admin', name = 'Sonnia Dappah (Admin)';

-- 10. SEED CATEGORIES
INSERT INTO public.categories (id, name, emoji, gradient, image_url) VALUES
(1, 'Grains & Cereals', '🌾', 'linear-gradient(135deg, #F5E6CA, #DEB887)', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&auto=format&q=80'),
(2, 'Fresh Produce', '🥬', 'linear-gradient(135deg, #C8E6C9, #81C784)', 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop&auto=format&q=80'),
(3, 'Spices & Seasonings', '🌶️', 'linear-gradient(135deg, #FFCCBC, #FF8A65)', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop&auto=format&q=80'),
(4, 'Dairy & Eggs', '🥛', 'linear-gradient(135deg, #E3F2FD, #90CAF9)', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format&q=80'),
(5, 'Oils & Condiments', '🫒', 'linear-gradient(135deg, #FFF9C4, #FFF176)', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop&auto=format&q=80'),
(6, 'Beverages', '🍵', 'linear-gradient(135deg, #F3E5F5, #CE93D8)', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop&auto=format&q=80'),
(7, 'Provisions', '🏪', 'linear-gradient(135deg, #FFE0B2, #FFB74D)', 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop&auto=format&q=80'),
(8, 'Hampers', '🧺', 'linear-gradient(135deg, #FFCDD2, #EF9A9A)', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed514?w=400&h=300&fit=crop&auto=format&q=80')
ON CONFLICT (id) DO NOTHING;

-- 11. SEED ALL 48 PRODUCTS
INSERT INTO public.products (id, name, price, category_id, unit, emoji, image_url, description, vendor, stock, featured, rating, is_perishable, price_per_unit, unit_label, is_hamper) VALUES
(1, 'Premium Basmati Rice', 89.99, 1, '5kg bag', '🍚', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&auto=format&q=80', 'Extra-long grain basmati rice, aged for superior aroma and fluffy texture.', 'goldenHarvest', 150, 1, 4.8, 0, NULL, '', 0),
(2, 'Local Brown Rice', 35, 1, '2kg bag', '🌾', 'https://images.unsplash.com/photo-1536304993881-460e4c8bc7c3?w=400&h=300&fit=crop&auto=format&q=80', 'Nutritious whole-grain brown rice from the Volta Region.', 'farmDirect', 200, 0, 4.5, 0, NULL, '', 0),
(3, 'Jasmine Rice', 79.99, 1, '5kg bag', '🍚', 'https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?w=400&h=300&fit=crop&auto=format&q=80', 'Fragrant Thai jasmine rice with soft, sticky texture.', 'goldenHarvest', 120, 0, 4.6, 0, NULL, '', 0),
(4, 'Corn Flour (Ablemamu)', 18.5, 1, '1kg pack', '🌽', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&auto=format&q=80', 'Finely milled corn flour for banku, kenkey, and traditional staples.', 'goldenHarvest', 300, 0, 4.3, 0, NULL, '', 0),
(5, 'Wheat Flour', 28, 1, '2kg pack', '🌾', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop&auto=format&q=80', 'All-purpose wheat flour for baking and frying.', 'goldenHarvest', 250, 0, 4.4, 0, NULL, '', 0),
(6, 'Rolled Oats', 22, 1, '500g pack', '🥣', 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=300&fit=crop&auto=format&q=80', 'Whole grain rolled oats for a healthy breakfast.', 'soniviva', 180, 1, 4.7, 0, NULL, '', 0),
(7, 'Fresh Tomatoes', 15, 2, 'per kg', '🍅', 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=300&fit=crop&auto=format&q=80', 'Vine-ripened, juicy tomatoes from local farms.', 'farmDirect', 500, 1, 4.6, 1, 15, 'kg', 0),
(8, 'Garden Eggs', 12, 2, 'per kg', '🍆', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=300&fit=crop&auto=format&q=80', 'Fresh garden eggs (African eggplant) for stew.', 'farmDirect', 400, 0, 4.4, 1, 12, 'kg', 0),
(9, 'Fresh Pepper Mix', 18, 2, 'per kg', '🌶️', 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400&h=300&fit=crop&auto=format&q=80', 'Scotch bonnet, shito peppers, and green chili mix.', 'farmDirect', 350, 0, 4.5, 1, 18, 'kg', 0),
(10, 'Ripe Plantain', 5, 2, 'per finger', '🍌', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop&auto=format&q=80', 'Sweet, ripe plantains for frying or roasting.', 'farmDirect', 600, 1, 4.8, 1, 5, 'finger', 0),
(11, 'Sweet Potatoes', 14, 2, 'per kg', '🍠', 'https://images.unsplash.com/photo-1596097635121-14b63a7e0c75?w=400&h=300&fit=crop&auto=format&q=80', 'Locally grown sweet potatoes with creamy orange flesh.', 'farmDirect', 400, 0, 4.3, 1, 14, 'kg', 0),
(12, 'Fresh Onions', 18, 2, 'per kg', '🧅', 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=400&h=300&fit=crop&auto=format&q=80', 'Premium red onions, firm and full of flavor.', 'farmDirect', 450, 0, 4.5, 1, 18, 'kg', 0),
(13, 'Dried Shrimp', 45, 3, '200g pack', '🦐', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop&auto=format&q=80', 'Sun-dried shrimp for rich umami flavor.', 'spiceMasters', 200, 1, 4.9, 0, NULL, '', 0),
(14, 'Ground Crayfish', 30, 3, '150g pack', '🦀', 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400&h=300&fit=crop&auto=format&q=80', 'Finely ground crayfish for soups.', 'spiceMasters', 250, 0, 4.7, 0, NULL, '', 0),
(15, 'Dawadawa', 15, 3, '100g pack', '🫘', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop&auto=format&q=80', 'Fermented African locust beans for soups and stews.', 'spiceMasters', 300, 0, 4.4, 0, NULL, '', 0),
(16, 'Curry Powder', 12, 3, '100g tin', '🟡', 'https://images.unsplash.com/photo-1607672632458-9eb56696346f?w=400&h=300&fit=crop&auto=format&q=80', 'Aromatic curry powder for rice and chicken.', 'spiceMasters', 400, 0, 4.3, 0, NULL, '', 0),
(17, 'Ground Ginger', 10, 3, '100g pack', '🫚', 'https://images.unsplash.com/photo-1615485500834-bc10c6da38e2?w=400&h=300&fit=crop&auto=format&q=80', 'Dried ground ginger for cooking and teas.', 'spiceMasters', 350, 0, 4.5, 0, NULL, '', 0),
(18, 'SONIVIVA Spice Blend', 22, 3, '150g jar', '✨', 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400&h=300&fit=crop&auto=format&q=80', 'Our signature spice blend — paprika, garlic, onion, thyme, and secret spices.', 'soniviva', 150, 1, 4.9, 0, NULL, '', 0),
(19, 'Fresh Milk', 24, 4, '1 litre', '🥛', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop&auto=format&q=80', 'Fresh pasteurized whole milk from accredited farms.', 'dairyBest', 100, 0, 4.5, 0, NULL, '', 0),
(20, 'Farm Eggs (Crate)', 55, 4, 'Crate of 30', '🥚', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop&auto=format&q=80', 'Farm-fresh eggs from free-range hens.', 'dairyBest', 80, 1, 4.8, 0, NULL, '', 0),
(21, 'Butter', 32, 4, '250g block', '🧈', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=300&fit=crop&auto=format&q=80', 'Premium unsalted butter for baking and cooking.', 'dairyBest', 120, 0, 4.6, 0, NULL, '', 0),
(22, 'Natural Yoghurt', 18, 4, '500ml tub', '🥛', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop&auto=format&q=80', 'Thick, creamy natural yoghurt with live cultures.', 'dairyBest', 90, 0, 4.4, 0, NULL, '', 0),
(23, 'Palm Oil (Zomi)', 35, 5, '1 litre bottle', '🟠', 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=400&h=300&fit=crop&auto=format&q=80', 'Pure, unrefined red palm oil for authentic Ghanaian cooking.', 'goldCoastOils', 200, 1, 4.7, 0, NULL, '', 0),
(24, 'Coconut Oil', 42, 5, '500ml bottle', '🥥', 'https://images.unsplash.com/photo-1526346698789-22fd84314424?w=400&h=300&fit=crop&auto=format&q=80', 'Cold-pressed virgin coconut oil.', 'goldCoastOils', 150, 0, 4.6, 0, NULL, '', 0),
(25, 'Groundnut Oil', 38, 5, '1 litre bottle', '🥜', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop&auto=format&q=80', 'High-quality groundnut oil with high smoke point.', 'goldCoastOils', 180, 0, 4.5, 0, NULL, '', 0),
(26, 'Shea Butter', 30, 5, '500g tub', '🫘', 'https://images.unsplash.com/photo-1547592166-23ef7c870df0?w=400&h=300&fit=crop&auto=format&q=80', 'Organic shea butter for cooking.', 'goldCoastOils', 160, 0, 4.4, 0, NULL, '', 0),
(27, 'Tomato Paste', 16, 5, '400g tin', '🍅', 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400&h=300&fit=crop&auto=format&q=80', 'Concentrated tomato paste for stews and jollof.', 'quickMart', 300, 0, 4.3, 0, NULL, '', 0),
(28, 'Soy Sauce', 14, 5, '300ml bottle', '🫗', 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop&auto=format&q=80', 'Naturally brewed soy sauce.', 'quickMart', 200, 0, 4.2, 0, NULL, '', 0),
(29, 'Sobolo Mix', 20, 6, '200g pack', '🌺', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop&auto=format&q=80', 'Dried hibiscus petals with ginger and spices.', 'tasteGhana', 250, 1, 4.8, 0, NULL, '', 0),
(30, 'Cocoa Powder', 28, 6, '250g tin', '☕', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&auto=format&q=80', 'Premium Ghanaian cocoa powder.', 'tasteGhana', 200, 1, 4.9, 0, NULL, '', 0),
(31, 'Green Tea', 25, 6, '50 tea bags', '🍵', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop&auto=format&q=80', 'Pure green tea bags for a calming brew.', 'tasteGhana', 300, 0, 4.5, 0, NULL, '', 0),
(32, 'Milo', 35, 6, '400g tin', '🟤', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop&auto=format&q=80', 'The original chocolate malt energy drink.', 'quickMart', 250, 0, 4.7, 0, NULL, '', 0),
(33, 'Indomie Instant Noodles', 120, 7, 'Carton of 40', '🍜', 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=300&fit=crop&auto=format&q=80', 'Chicken flavor instant noodles. Quick meals in 3 minutes.', 'quickMart', 100, 1, 4.7, 0, NULL, '', 0),
(34, 'Peak Milk (Evaporated)', 96, 7, '12 tins', '🥫', 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop&auto=format&q=80', 'Rich, creamy evaporated milk for tea, coffee, and cooking.', 'quickMart', 80, 0, 4.6, 0, NULL, '', 0),
(35, 'Titus Sardines', 85, 7, '10 tins', '🐟', 'https://images.unsplash.com/photo-1611171711912-e3f6b536f532?w=400&h=300&fit=crop&auto=format&q=80', 'Premium sardines in vegetable oil.', 'quickMart', 120, 0, 4.5, 0, NULL, '', 0),
(36, 'Exeter Corned Beef', 78, 7, '6 tins', '🥩', 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop&auto=format&q=80', 'Quality corned beef for sandwiches and stews.', 'quickMart', 100, 0, 4.4, 0, NULL, '', 0),
(37, 'Sugar', 25, 7, '2kg bag', '🍬', 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&h=300&fit=crop&auto=format&q=80', 'Refined white granulated sugar.', 'quickMart', 300, 0, 4.3, 0, NULL, '', 0),
(38, 'Iodated Salt', 8, 7, '1kg pack', '🧂', 'https://images.unsplash.com/photo-1518110925495-5fe2c8f2be87?w=400&h=300&fit=crop&auto=format&q=80', 'Iodated table salt for cooking and seasoning.', 'quickMart', 400, 0, 4.2, 0, NULL, '', 0),
(39, 'Cabin Biscuits', 42, 7, '6 packs', '🍪', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop&auto=format&q=80', 'Classic cabin biscuits — crunchy and satisfying.', 'quickMart', 200, 0, 4.5, 0, NULL, '', 0),
(40, 'Gari', 45, 7, '5kg bag', '🟡', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&auto=format&q=80', 'Premium cassava flakes for soaking, eba, and gari fortor.', 'goldenHarvest', 180, 1, 4.6, 0, NULL, '', 0),
(41, 'Bournvita', 38, 7, '400g tin', '☕', 'https://images.unsplash.com/photo-1610611424854-5e07b2b5b5e0?w=400&h=300&fit=crop&auto=format&q=80', 'Chocolatey malt drink with vitamins and minerals.', 'quickMart', 150, 0, 4.6, 0, NULL, '', 0),
(42, 'Canned Baked Beans', 54, 7, '6 tins (400g)', '🫘', 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&h=300&fit=crop&auto=format&q=80', 'Baked beans in rich tomato sauce.', 'quickMart', 100, 0, 4.3, 0, NULL, '', 0),
(43, 'Maggi Cubes', 20, 7, 'Box of 100', '🟫', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop&auto=format&q=80', 'Seasoning cubes for soups, stews, and rice.', 'quickMart', 500, 0, 4.4, 0, NULL, '', 0),
(44, 'Ideal Milk', 84, 7, '12 tins', '🥛', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=300&fit=crop&auto=format&q=80', 'Evaporated filled milk for tea and cooking.', 'quickMart', 100, 0, 4.3, 0, NULL, '', 0),
(45, 'Essential Kitchen Hamper', 299, 8, '1 hamper (10 items)', '🧺', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed514?w=400&h=300&fit=crop&auto=format&q=80', 'Essential kitchen starter containing: 5kg Royal Feast Basmati Rice, 1L Pure Zomi Palm Oil, 1kg Fresh Farm Tomatoes, 1kg Red Onions, Crate of 30 Farm Eggs, 400g Gino Tomato Paste, 100g Curry Powder, 2kg Granulated Sugar, 1kg Iodated Salt, and Box of 100 Maggi Cubes. You can easily add more provisions, spices, or fresh items to your order!', 'soniviva', 50, 1, 4.9, 0, NULL, '', 1),
(46, 'Family Care Package', 499, 8, '1 hamper (15 items)', '👨‍👩‍👧‍👦', 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&h=300&fit=crop&auto=format&q=80', 'Comprehensive home pantry package: 5kg Basmati Rice, 2kg Wheat Flour, 1kg Fresh Tomatoes, 1kg Hot Pepper Mix, 5 fingers Sweet Plantains, 1kg Onions, 200g Sun-Dried Shrimp, Crate of 30 Eggs, 1L Palm Oil, 400g Tomato Paste, 250g Golden Tree Cocoa Powder, Carton of Indomie (40 packs), 12 tins Peak Evaporated Milk, 2kg Sugar, and 1kg Salt. Fully customizable with more food items!', 'soniviva', 30, 1, 4.8, 0, NULL, '', 1),
(47, 'Festive Celebration Hamper', 799, 8, '1 hamper (20 items)', '🎉', 'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?w=400&h=300&fit=crop&auto=format&q=80', 'Luxury holiday & gift package: 5kg Basmati Rice, 5kg Jasmine Rice, 500g Rolled Oats, 1kg Fresh Tomatoes, 7 fingers Ripe Plantain, 200g Dried Shrimp, 150g SONIVIVA Signature Spice Blend, 1L Fresh Milk, Crate of 30 Eggs, 250g Butter, 1L Palm Oil, 500ml Virgin Coconut Oil, 200g Sobolo Mix, 250g Cocoa Powder, Carton of Indomie, 10 tins Titus Sardines, 6 tins Exeter Corned Beef, 6 packs Cabin Biscuits, 400g Bournvita, and 2kg Sugar. Need extra items or drinks? Add them freely!', 'soniviva', 20, 1, 4.9, 0, NULL, '', 1),
(48, 'Student Starter Hamper', 199, 8, '1 hamper (8 items)', '🎓', 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop&auto=format&q=80', 'Budget-friendly semester package: 2kg Volta Brown Rice, Carton of Indomie (40 packs), 10 tins Titus Sardines, 2kg Granulated Sugar, 1kg Iodated Salt, 50 bags Green Tea, 12 tins Peak Milk, and 1L Groundnut Cooking Oil. You can add extra gari, milo, or seasonings to your hamper anytime!', 'soniviva', 40, 0, 0, 0, NULL, '', 0)
ON CONFLICT (id) DO NOTHING;
