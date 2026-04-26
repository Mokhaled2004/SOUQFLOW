import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, stores } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';
import { generateSlug } from '@/lib/slug';

async function getStoreForUser(slug: string, userId: number) {
  const userStores = await db.select().from(stores).where(eq(stores.userId, userId));
  return userStores.find((s) => generateSlug(s.storeName) === slug) ?? null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; productId: string }> },
) {
  const { slug, productId } = await params;
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const store = await getStoreForUser(slug, payload.userId);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  // Verify product belongs to this store
  const existing = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, productId), eq(products.storeId, store.id)))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const body = await request.json();
  const { name, description, price, subcategorySlug, imageUrl } = body;

  const [updated] = await db
    .update(products)
    .set({
      name: name?.trim() ?? existing[0].name,
      description: description?.trim() ?? existing[0].description,
      price: price ? String(price) : existing[0].price,
      subcategory_slug: subcategorySlug ?? existing[0].subcategory_slug,
      image_url: imageUrl !== undefined ? (imageUrl || null) : existing[0].image_url,
    })
    .where(eq(products.slug, productId))
    .returning();

  return NextResponse.json({ product: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; productId: string }> },
) {
  const { slug, productId } = await params;
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const store = await getStoreForUser(slug, payload.userId);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  // Verify product belongs to this store
  const existing = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, productId), eq(products.storeId, store.id)))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  await db.delete(products).where(eq(products.slug, productId));

  return NextResponse.json({ success: true });
}
