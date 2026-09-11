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
