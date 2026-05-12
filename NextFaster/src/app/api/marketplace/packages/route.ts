import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { packages, stores, storeCategories } from '@/db/schema';
import { eq, and, gte, lte, gt, sql, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');

    let whereClause = eq(packages.isActive, 1);

    if (categoryId && categoryId !== 'all') {
      whereClause = and(whereClause, eq(stores.storeCategoryId, parseInt(categoryId)));
    }

    if (minPrice) {
      whereClause = and(whereClause, gte(packages.offerPrice, minPrice));
    }

    if (maxPrice) {
      whereClause = and(whereClause, lte(packages.offerPrice, maxPrice));
    }

    if (search) {
      whereClause = and(
        whereClause,
        or(
          sql`${packages.name} ILIKE ${'%' + search + '%'}`,
          sql`${packages.description} ILIKE ${'%' + search + '%'}`
        )
      );
    }

    const results = await db
      .select({
        id: packages.id,
        name: packages.name,
        description: packages.description,
        price: packages.offerPrice,
        realPrice: packages.realPrice,
        imageUrl: packages.imageUrl,
        storeName: stores.storeName,
        storeSlug: stores.slug,
        storeLogo: stores.storeLogo,
        categoryName: storeCategories.name,
        isPackage: sql`true`.mapWith(Boolean),
      })
      .from(packages)
      .innerJoin(stores, eq(packages.storeId, stores.id))
      .innerJoin(storeCategories, eq(stores.storeCategoryId, storeCategories.id))
      .where(whereClause)
      .limit(50);

    return NextResponse.json({ packages: results });
  } catch (error) {
    console.error('[marketplace-packages] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
