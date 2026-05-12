import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, stores, storeCategories } from '@/db/schema';
import { eq, and, gte, lte, gt, sql, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const hasOffer = searchParams.get('hasOffer') === 'true';
    const search = searchParams.get('search');

    let whereClause = eq(products.isActive, 1);

    if (categoryId && categoryId !== 'all') {
      whereClause = and(whereClause, eq(stores.storeCategoryId, parseInt(categoryId)));
    }

    if (minPrice) {
      whereClause = and(whereClause, gte(products.price, minPrice));
    }

    if (maxPrice) {
      whereClause = and(whereClause, lte(products.price, maxPrice));
    }

    if (hasOffer) {
      whereClause = and(whereClause, gt(products.offerPercentage, 0));
    }

    if (search) {
      whereClause = and(
        whereClause,
        or(
          sql`${products.name} ILIKE ${'%' + search + '%'}`,
          sql`${products.description} ILIKE ${'%' + search + '%'}`
        )
      );
    }

    const results = await db
      .select({
        slug: products.slug,
        name: products.name,
        description: products.description,
        price: products.price,
        imageUrl: products.image_url,
        offerPercentage: products.offerPercentage,
        isOutOfStock: products.isOutOfStock,
        storeName: stores.storeName,
        storeSlug: stores.slug,
        storeLogo: stores.storeLogo,
        categoryName: storeCategories.name,
      })
      .from(products)
      .innerJoin(stores, eq(products.storeId, stores.id))
      .innerJoin(storeCategories, eq(stores.storeCategoryId, storeCategories.id))
      .where(whereClause)
      .limit(50); // Pagination could be added later

    return NextResponse.json({ products: results });
  } catch (error) {
    console.error('[marketplace-products] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
