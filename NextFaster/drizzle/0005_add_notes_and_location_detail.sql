-- Add notes to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes text;

-- Add governorate and location_detail to users (split from location)
ALTER TABLE users ADD COLUMN IF NOT EXISTS governorate varchar(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS location_detail text;

-- Migrate existing location data: treat the whole value as governorate
UPDATE users SET governorate = location WHERE location IS NOT NULL AND governorate IS NULL;
