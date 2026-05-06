import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

// Load .env.local manually
const env = readFileSync('.env.local', 'utf8');
const dbUrl = env.match(/DATABASE_URL=(.+)/)?.[1]?.trim();

if (!dbUrl) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
}

const sql = neon(dbUrl);

try {
    await sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id serial PRIMARY KEY,
      store_id integer REFERENCES stores(id) ON DELETE CASCADE,
      endpoint text NOT NULL UNIQUE,
      p256dh text NOT NULL,
      auth text NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `;
    await sql`
    CREATE INDEX IF NOT EXISTS push_subscriptions_store_id_idx 
    ON push_subscriptions (store_id)
  `;
    console.log('✅ push_subscriptions table created successfully');
    process.exit(0);
} catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
}
