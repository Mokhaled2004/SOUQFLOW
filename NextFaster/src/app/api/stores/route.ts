/**
 * Public stores listing API — no auth required
 * GET /api/stores  → all active stores with slug, category, and offer flag
 */
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { stores, storeCategories, products } from '@/db/schema';
import { eq, and, ne, gt, sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Get all active stores with category name
    const rows = await db
      .select({
        id: stores.id,
        storeName: stores.storeName,
        slug: stores.slug,
        storeDescription: stores.storeDescription,
        storeLogo: stores.storeLogo,
        storeBanner: stores.storeBanner,
        primaryLocation: stores.primaryLocation,
        categoryName: storeCategories.name,
        categoryId: stores.storeCategoryId,
      })
      .from(stores)
      .leftJoin(storeCategories, eq(stores.storeCategoryId, storeCategories.id))
      .where(and(eq(stores.isActive, 1), ne(stores.slug, '')));

    // For each store, check if it has any products with offers
    const storeIds = rows.map((s) => s.id);
    let offerStoreIds = new Set<number>();

    if (storeIds.length > 0) {
      const offerRows = await db
        .selectDistinct({ storeId: products.storeId })
        .from(products)
        .where(and(
          eq(products.isActive, 1),
          gt(products.offerPercentage, 0),
        ));
      offerStoreIds = new Set(offerRows.map((r) => r.storeId));
    }

    const result = rows.map((s) => ({
      ...s,
      hasOffers: offerStoreIds.has(s.id),
    }));

    return NextResponse.json(
      { stores: result },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' } },
    );
  } catch (error) {
    console.error('[stores] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
