-- Add offer and stock columns to products table
ALTER TABLE products ADD COLUMN offer_percentage integer NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN is_out_of_stock integer NOT NULL DEFAULT 0;
