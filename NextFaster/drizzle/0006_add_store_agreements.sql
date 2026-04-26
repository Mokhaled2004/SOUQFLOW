-- Create store_agreements table
-- Records when a seller accepted the terms during store creation

CREATE TABLE IF NOT EXISTS store_agreements (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agreed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(100),
  -- Snapshot of the terms version they agreed to
  terms_version VARCHAR(20) NOT NULL DEFAULT '1.0',
  -- Key terms they explicitly agreed to (stored as text for audit trail)
  platform_fee_at_agreement NUMERIC(10, 2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_store_agreements_store_id ON store_agreements(store_id);
CREATE INDEX IF NOT EXISTS idx_store_agreements_user_id ON store_agreements(user_id);
