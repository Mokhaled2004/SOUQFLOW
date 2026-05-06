CREATE TABLE IF NOT EXISTS "push_subscriptions" (
  "id" serial PRIMARY KEY NOT NULL,
  "store_id" integer REFERENCES "stores"("id") ON DELETE cascade,
  "endpoint" text NOT NULL UNIQUE,
  "p256dh" text NOT NULL,
  "auth" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "push_subscriptions_store_id_idx" ON "push_subscriptions" ("store_id");
