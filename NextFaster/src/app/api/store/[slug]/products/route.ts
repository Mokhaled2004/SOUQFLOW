/**
 * Public products API — no auth required
 * GET /api/store/[slug]/products?subcategory=slug
 * Uses indexed slug column — single O(1) lookup, no full table scan.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { stores, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const subcategorySlug = searchParams.get('subcategory');

    // Single indexed lookup — O(1)
    const [store] = await db
      .select({ id: stores.id })
      .from(stores)
      .where(and(eq(stores.slug, slug), eq(stores.isActive, 1)))
      .limit(1);

    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const prods = subcategorySlug
      ? await db.select().from(products).where(
          and(eq(products.storeId, store.id), eq(products.isActive, 1), eq(products.subcategory_slug, subcategorySlug)),
        )
      : await db.select().from(products).where(
          and(eq(products.storeId, store.id), eq(products.isActive, 1)),
        );

    return NextResponse.json({ products: prods });
  } catch (error) {
    console.error('[store/products] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
