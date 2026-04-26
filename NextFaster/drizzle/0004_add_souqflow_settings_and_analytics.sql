-- Create souqflow_admins table
CREATE TABLE IF NOT EXISTS souqflow_admins (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create souqflow_settings table
CREATE TABLE IF NOT EXISTS souqflow_settings (
  id SERIAL PRIMARY KEY,
  platform_fee_per_order NUMERIC(10, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by INTEGER REFERENCES souqflow_admins(id) ON DELETE SET NULL
);

-- Create store_analytics table (for day/week/month analytics)
CREATE TABLE IF NOT EXISTS store_analytics (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  date TIMESTAMP NOT NULL,
  period VARCHAR(50) NOT NULL,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_platform_fees NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create product_analytics table (for top-selling products)
CREATE TABLE IF NOT EXISTS product_analytics (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL REFERENCES products(slug) ON DELETE CASCADE,
  date TIMESTAMP NOT NULL,
  period VARCHAR(50) NOT NULL,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  revenue NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS souqflow_admins_email_idx ON souqflow_admins(email);
CREATE INDEX IF NOT EXISTS store_analytics_store_id_idx ON store_analytics(store_id);
CREATE INDEX IF NOT EXISTS store_analytics_date_idx ON store_analytics(date);
CREATE INDEX IF NOT EXISTS store_analytics_period_idx ON store_analytics(period);
CREATE INDEX IF NOT EXISTS store_analytics_unique_idx ON store_analytics(store_id, date, period);
CREATE INDEX IF NOT EXISTS product_analytics_store_id_idx ON product_analytics(store_id);
CREATE INDEX IF NOT EXISTS product_analytics_product_slug_idx ON product_analytics(product_slug);
CREATE INDEX IF NOT EXISTS product_analytics_date_idx ON product_analytics(date);
CREATE INDEX IF NOT EXISTS product_analytics_unique_idx ON product_analytics(store_id, product_slug, date, period);

-- Insert default souqflow_settings if not exists
INSERT INTO souqflow_settings (platform_fee_per_order) 
SELECT 0 WHERE NOT EXISTS (SELECT 1 FROM souqflow_settings);
