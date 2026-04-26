/**
 * Public store API — no auth required
 * GET /api/store/[slug]  → store info + catalog
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { stores, collections, categories, subcollections, subcategories, shippingRates } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

async function getStorePage(slug: string) {
    const [store] = await db
      .select()
      .from(stores)
      .where(and(eq(stores.slug, slug), eq(stores.isActive, 1)))
      .limit(1);

    if (!store) return null;

    const [cols, cats, subcols, subs, rates] = await Promise.all([
      db.select().from(collections).where(eq(collections.storeId, store.id)),
      db.select().from(categories).where(eq(categories.storeId, store.id)),
      db.select().from(subcollections).where(eq(subcollections.storeId, store.id)),
      db.select().from(subcategories).where(eq(subcategories.storeId, store.id)),
      db.select().from(shippingRates).where(and(eq(shippingRates.storeId, store.id), eq(shippingRates.isActive, 1))),
    ]);

    const catalog = cols.map((col) => {
      const colCats = cats.filter((c) => c.collection_id === col.id);
      const catSlugs = new Set(colCats.map((c) => c.slug));
      const relSubcols = subcols.filter((sc) => catSlugs.has(sc.category_slug));
      const subcolIds = new Set(relSubcols.map((sc) => sc.id));
      return {
        id: col.id,
        name: col.name,
        slug: col.slug,
        subcategories: subs
          .filter((s) => subcolIds.has(s.subcollection_id))
          .map((s) => ({ slug: s.slug, name: s.name, image_url: s.image_url })),
      };
    });

    return {
      store: {
        id: store.id,
        storeName: store.storeName,
        storeDescription: store.storeDescription,
        storeLogo: store.storeLogo,
        storeBanner: store.storeBanner,
        whatsappNumber: store.whatsappNumber,
        phone: store.phone,
        primaryLocation: store.primaryLocation,
      },
      catalog,
      shippingRates: rates.map((r) => ({
        governorate: r.governorate,
        price: r.price,
      })),
    };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const data = await getStorePage(slug);
    if (!data) return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    console.error('[store] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
