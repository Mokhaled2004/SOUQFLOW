import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { stores, shippingRates } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';

async function getStoreForUser(slug: string, userId: number) {
  const result = await db
    .select()
    .from(stores)
    .where(and(eq(stores.slug, slug), eq(stores.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

/** GET — fetch all shipping rates for a store */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const store = await getStoreForUser(slug, payload.userId);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const rates = await db
    .select()
    .from(shippingRates)
    .where(eq(shippingRates.storeId, store.id));

  return NextResponse.json({ rates });
}

/** PUT — replace all shipping rates for a store */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const store = await getStoreForUser(slug, payload.userId);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const body = await request.json();
  // body.rates = [{ governorate: 'cairo', price: 30 }, ...]

  if (!Array.isArray(body.rates)) {
    return NextResponse.json({ error: 'rates must be an array' }, { status: 400 });
  }

  // Delete existing rates and re-insert (simple upsert pattern)
  await db.delete(shippingRates).where(eq(shippingRates.storeId, store.id));

  if (body.rates.length > 0) {
    await db.insert(shippingRates).values(
      body.rates.map((r: { governorate: string; price: number }) => ({
        storeId: store.id,
        governorate: r.governorate,
        price: r.price.toString(),
        isActive: 1,
      })),
    );
  }

  const updated = await db
    .select()
    .from(shippingRates)
    .where(eq(shippingRates.storeId, store.id));

  return NextResponse.json({ rates: updated });
}
