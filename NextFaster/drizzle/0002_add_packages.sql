-- Create packages table
CREATE TABLE packages (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  real_price NUMERIC(10, 2) NOT NULL,
  offer_price NUMERIC(10, 2) NOT NULL,
  image_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create package_items table (products in a package)
CREATE TABLE package_items (
  id SERIAL PRIMARY KEY,
  package_id INTEGER NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL REFERENCES products(slug) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add indexes for fast queries
CREATE INDEX packages_store_id_idx ON packages(store_id);
CREATE INDEX packages_store_active_idx ON packages(store_id, is_active);
CREATE INDEX package_items_package_id_idx ON package_items(package_id);
CREATE INDEX package_items_product_slug_idx ON package_items(product_slug);
