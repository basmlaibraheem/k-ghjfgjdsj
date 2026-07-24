/*
# YUSMÉ Storefront Schema

1. Overview
   Full e-commerce schema for the YUSMÉ fashion & beauty brand: categories,
   products, product images, orders, order items, reviews, wishlist, coupons,
   messages, and a profiles table linked to auth.users. Admin role is tracked
   via raw_app_meta_data.is_admin set on signup.

2. New Tables
   - profiles: extends auth.users with full_name, phone, avatar, is_admin flag, loyalty points.
   - categories: product categories (Men, Women, Beauty, Skincare) with optional parent for sub-categories.
   - products: catalog items with name, price, sale price, description, sizes, colors, stock, images, featured flags.
   - product_images: multiple images per product.
   - orders: customer orders with status, totals, shipping address.
   - order_items: line items per order.
   - reviews: product reviews with rating + comment.
   - wishlist: saved products per user.
   - coupons: discount codes with type, value, expiry, usage limits.
   - messages: contact form submissions.

3. Security (RLS)
   - profiles: owner read/update; admin full access.
   - categories, products, product_images, coupons: public read (anon+authenticated), admin write.
   - orders + order_items: owner read; authenticated insert; admin full.
   - reviews: public read; authenticated insert/update/delete own; admin full.
   - wishlist: owner CRUD.
   - messages: authenticated insert; admin read/delete.
   - All admin policies check raw_app_meta_data->>is_admin = 'true'.
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  is_admin boolean NOT NULL DEFAULT false,
  loyalty_points integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_own_profile" ON profiles;
CREATE POLICY "read_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "admin_all_profiles" ON profiles;
CREATE POLICY "admin_all_profiles" ON profiles FOR ALL TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true');

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_categories" ON categories;
CREATE POLICY "admin_write_categories" ON categories FOR ALL TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true');

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  sale_price numeric(10,2),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  sizes text[] DEFAULT '{}',
  colors text[] DEFAULT '{}',
  stock integer NOT NULL DEFAULT 0,
  image_url text,
  rating numeric(2,1) DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_best_seller boolean DEFAULT false,
  is_new boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_products" ON products;
CREATE POLICY "admin_write_products" ON products FOR ALL TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true');

-- PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  position integer DEFAULT 0
);
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_product_images" ON product_images;
CREATE POLICY "public_read_product_images" ON product_images FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_product_images" ON product_images;
CREATE POLICY "admin_write_product_images" ON product_images FOR ALL TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true');

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'Pending',
  total numeric(10,2) NOT NULL DEFAULT 0,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  shipping numeric(10,2) NOT NULL DEFAULT 0,
  full_name text,
  address text,
  city text,
  phone text,
  payment_method text DEFAULT 'cod',
  coupon_code text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_orders" ON orders;
CREATE POLICY "read_own_orders" ON orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true');
DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true');

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  name text NOT NULL,
  image_url text,
  price numeric(10,2) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  size text,
  color text
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_order_items" ON order_items;
CREATE POLICY "read_own_order_items" ON order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true')));
DROP POLICY IF EXISTS "insert_own_order_items" ON order_items;
CREATE POLICY "insert_own_order_items" ON order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL DEFAULT 5,
  comment text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "insert_own_reviews" ON reviews;
CREATE POLICY "insert_own_reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_reviews" ON reviews;
CREATE POLICY "update_own_reviews" ON reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_reviews" ON reviews;
CREATE POLICY "delete_own_reviews" ON reviews FOR DELETE TO authenticated USING (auth.uid() = user_id OR auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true');

-- WISHLIST
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, product_id)
);
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_wishlist" ON wishlist;
CREATE POLICY "read_own_wishlist" ON wishlist FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_wishlist" ON wishlist;
CREATE POLICY "insert_own_wishlist" ON wishlist FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_wishlist" ON wishlist;
CREATE POLICY "delete_own_wishlist" ON wishlist FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- COUPONS
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text NOT NULL DEFAULT 'percent',
  value numeric(10,2) NOT NULL,
  min_order numeric(10,2) DEFAULT 0,
  expires_at timestamptz,
  usage_limit integer,
  times_used integer NOT NULL DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_coupons" ON coupons;
CREATE POLICY "public_read_coupons" ON coupons FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_write_coupons" ON coupons;
CREATE POLICY "admin_write_coupons" ON coupons FOR ALL TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true');

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "insert_messages" ON messages;
CREATE POLICY "insert_messages" ON messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_read_messages" ON messages;
CREATE POLICY "admin_read_messages" ON messages FOR SELECT TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true');
DROP POLICY IF EXISTS "admin_update_messages" ON messages;
CREATE POLICY "admin_update_messages" ON messages FOR UPDATE TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true')
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true');
DROP POLICY IF EXISTS "admin_delete_messages" ON messages;
CREATE POLICY "admin_delete_messages" ON messages FOR DELETE TO authenticated
  USING (auth.jwt() -> 'app_metadata' ->> 'is_admin' = 'true');

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured;
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);
