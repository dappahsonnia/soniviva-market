# 🛒 SONIVIVA — Fresh Flavors, Delivered to Your Door
> **A brand of Rita Foods and Co.**  
> Premium e-commerce web platform for authentic Ghanaian foodstuffs, provisions, fresh farm produce, and customizable gift hampers.

---

## 🌟 Key Features

- **🌾 Complete Storefront**: 48 authentic Ghanaian products across 8 categories (Grains & Cereals, Fresh Produce, Spices & Seasonings, Dairy & Eggs, Oils & Condiments, Beverages, Provisions, and Hampers).
- **🧺 Curated Food Hampers & Custom Builder**:
  - Pre-curated hampers with real Ghanaian staples (Essential Kitchen Hamper, Family Care Package, Festive Celebration Hamper, Student Starter Hamper).
  - Interactive Custom Hamper Builder allowing customers to hand-pick individual foodstuffs with real-time price calculation in Cedis (`GH₵`) and custom gift notes.
- **🔐 Complete Authentication System**:
  - Secure JWT authentication with httpOnly cookie & header verification.
  - Password strength validation and bcrypt hashing.
  - **Google Sign-In & Sign-Up**: One-click authentication with Google Identity Services.
  - Role-based Access Control (**Admin** vs. **User**).
- **📊 Admin Dashboard (`/admin/`)**:
  - Live revenue, order, user, and product analytics.
  - Full CRUD for products with stock management & image upload.
  - Category manager & status filters.
  - Order status workflows (*Pending*, *Confirmed*, *Processing*, *Shipped*, *Delivered*, *Cancelled*).
  - User role management & customer directory.
- **🛒 Shopping Cart & Multi-step Checkout**:
  - Persistent cart in `localStorage`.
  - Mobile Money (MTN MoMo, Telecel Cash, AT Money), Card, and Cash on Delivery payment options.
  - Full order receipt and invoice generation.
- **📞 Direct Customer Support**:
  - **Email**: `dappahsonnia@gmail.com`
  - **Phone (Call)**: `0256322653`
  - **WhatsApp**: `0597118637` (Direct WhatsApp click-to-chat integration)

---

## 🔑 Default Admin Account

| Field | Value |
|---|---|
| **Email** | `dappahsonnia@gmail.com` |
| **Password** | `Sonnita0275` |
| **Role** | `admin` (Full administrative privileges) |
| **Dashboard URL** | `/admin/` |

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)

### 2. Install & Start
```bash
# Clone or navigate to the project directory
cd "rita foods and co"

# Install dependencies
npm install

# Start the application
npm start
```

Visit the app in your browser: **[http://localhost:3000](http://localhost:3000)**

---

## 🗄️ Supabase Cloud Database Integration

This application is built with zero-friction local storage (via WebAssembly SQLite) and is 100% prepared for **Supabase PostgreSQL**.

### Setting up Supabase:
1. Create a free account at [supabase.com](https://supabase.com) and start a new project.
2. Go to the **SQL Editor** tab in your Supabase dashboard.
3. Open [`supabase_schema.sql`](./supabase_schema.sql) from this repository, copy its contents, and run it in the SQL Editor.
4. Copy your project connection details from **Project Settings > API**:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `DATABASE_URL` (under Database settings)
5. Add them to your `.env` or deployment environment variables.

---

## ☁️ Deployment Guides

### Option A: Deploy on Render (Recommended for full Node.js express apps)
1. Sign up or log into [render.com](https://render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository (`soniviva` / `rita-foods-and-co`).
4. Configure settings (or let `render.yaml` auto-configure):
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: *(Click 'Generate' or enter a 32+ character random string)*
   - `PORT`: `10000`
6. Click **Deploy Web Service**! Render will provide your public HTTPS link (e.g., `https://soniviva.onrender.com`).

---

### Option B: Deploy on Vercel
1. Sign up or log into [vercel.com](https://vercel.com).
2. Click **Add New** > **Project** and import your GitHub repository.
3. Vercel automatically detects the [`vercel.json`](./vercel.json) configuration.
4. Set Environment Variables:
   - `JWT_SECRET`: *(A random 32+ character secret key)*
   - `NODE_ENV`: `production`
5. Click **Deploy**. Vercel will build and assign your live domain (e.g., `https://soniviva.vercel.app`).

---

## 📁 Project Structure

```text
├── admin/                     # Admin Dashboard UI
│   ├── css/admin.css          # Admin styling
│   ├── js/admin.js            # Admin CRUD & analytics logic
│   ├── categories.html        # Category management
│   ├── index.html             # Admin overview
│   ├── orders.html            # Order management & filters
│   ├── products.html          # Product management & add/edit modal
│   └── users.html             # User list & role toggle
├── css/
│   └── styles.css             # Main storefront design system (~2,800 lines)
├── db/
│   ├── database.js            # Database wrapper, schema & auto-seeding
│   └── soniviva.db            # Local SQLite database
├── js/
│   ├── app.js                 # Global navigation & store init
│   ├── auth.js                # Client-side auth manager & nav updater
│   ├── cart.js                # Shopping cart logic (localStorage)
│   ├── checkout.js            # Multi-step checkout & payment flows
│   └── products.js            # 48 products catalog, perishable options & hamper details
├── middleware/
│   └── auth.js                # JWT verification & admin route protection
├── routes/
│   ├── admin.js               # Admin CRUD REST APIs
│   ├── auth.js                # Login, Register, Google Auth, Password Reset
│   └── user.js                # Profile & order submission endpoints
├── index.html                 # Homepage with hero, features & categories
├── shop.html                  # Product catalog with filters & search
├── hampers.html               # Food hampers showcase & custom hamper builder
├── product.html               # Product detail page with perishable weight selectors
├── cart.html                  # Shopping cart overview
├── checkout.html              # Multi-step checkout
├── login.html                 # Sign In (with Google option)
├── register.html              # Sign Up (with Google option)
├── profile.html               # User profile & order history
├── server.js                  # Express backend entry point
├── render.yaml                # Render cloud deployment config
├── vercel.json                # Vercel serverless deployment config
└── supabase_schema.sql        # Supabase cloud PostgreSQL schema & seeds
```

---

## 📄 License & Ownership
Copyright © 2026 **SONIVIVA by Rita Foods and Co.** All rights reserved.
