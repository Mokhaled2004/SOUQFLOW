# Database Migration Instructions

## To sync the new orders schema to your database:

### Option 1: Using Drizzle Kit (Recommended)

```bash
npm run db:push
```

This will:
1. Read the schema from `src/db/schema.ts`
2. Compare it with your database
3. Generate and apply the migration automatically

### Option 2: Manual SQL Migration

If you prefer to run the SQL directly:

```bash
# Using psql
psql -d souqflow -f drizzle/0003_add_orders.sql
```

Or paste the contents of `drizzle/0003_add_orders.sql` into your Neon dashboard SQL editor.

## What gets created:

- `orders` table — stores order metadata
- `order_items` table — stores individual items in each order
- Indexes on `store_id`, `user_id`, `status`, and `order_id` for fast queries

## Schema files:

- **SQL**: `drizzle/0003_add_orders.sql` — raw SQL migration
- **TypeScript**: `src/db/schema.ts` — Drizzle ORM schema (already updated)

## Verify the migration worked:

```bash
npm run db:studio
```

This opens Drizzle Studio where you can see the new tables.
