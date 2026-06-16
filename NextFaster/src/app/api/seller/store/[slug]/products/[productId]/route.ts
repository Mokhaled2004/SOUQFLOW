import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, stores, categories, subcategories, collections } from '@/db/schema';
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; productId: string }> },
) {
  try {
    const { slug, productId } = await params;
    console.log('[product/PUT] Starting update for product:', productId);
    
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      console.log('[product/PUT] No auth token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      console.log('[product/PUT] Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const store = await getStoreForUser(slug, payload.userId);
    if (!store) {
      console.log('[product/PUT] Store not found:', slug);
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Verify product belongs to this store
    const existing = await db
      .select()
      .from(products)
      .where(and(eq(products.slug, productId), eq(products.storeId, store.id)))
      .limit(1);

    if (existing.length === 0) {
      console.log('[product/PUT] Product not found:', productId);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const body = await request.json();
    console.log('[product/PUT] Request body:', JSON.stringify(body));
    
    const { name, description, price, subcategorySlug, categorySlug, collectionId, imageUrl, images } = body;

    // Validate images array
    let finalImages = images;
    if (images !== undefined) {
      if (!Array.isArray(images)) {
        console.error('[product/PUT] Images is not an array:', typeof images);
        return NextResponse.json(
          { error: 'Images must be an array' },
          { status: 400 },
        );
      }
      // Ensure all items are strings
      finalImages = images.filter((img: any) => typeof img === 'string');
      if (finalImages.length !== images.length) {
        console.warn('[product/PUT] Some images were not strings, filtered:', {
          original: images.length,
          filtered: finalImages.length,
        });
      }
    }

    let finalCollectionId = collectionId !== undefined ? (collectionId ? Number(collectionId) : null) : existing[0].collection_id;
    let finalCategorySlug = categorySlug !== undefined ? (categorySlug || null) : existing[0].category_slug;
    let finalSubcategorySlug = subcategorySlug !== undefined ? (subcategorySlug || null) : existing[0].subcategory_slug;

    // Verify association if provided
    if (subcategorySlug) {
      const sub = await db
        .select()
        .from(subcategories)
        .where(and(eq(subcategories.slug, subcategorySlug), eq(subcategories.storeId, store.id)))
        .limit(1);
      if (sub.length === 0) {
        console.log('[product/PUT] Subcategory not found:', subcategorySlug);
        return NextResponse.json({ error: 'Subcategory not found' }, { status: 400 });
      }
      finalSubcategorySlug = subcategorySlug;
      finalCategorySlug = null;
      finalCollectionId = null;
    } else if (categorySlug) {
      // The frontend sends the COLLECTION slug as categorySlug
      const col = await db
        .select()
        .from(collections)
        .where(and(eq(collections.slug, categorySlug), eq(collections.storeId, store.id)))
        .limit(1);
      if (col.length === 0) {
        console.log('[product/PUT] Collection not found:', categorySlug);
        return NextResponse.json({ error: 'Category (Collection) not found' }, { status: 400 });
      }
      
      finalCollectionId = col[0].id;
      finalSubcategorySlug = null;
      
      // Also find the auto-created category under this collection to keep things linked
      const cat = await db
        .select()
        .from(categories)
        .where(eq(categories.collection_id, col[0].id))
        .limit(1);
      finalCategorySlug = cat.length > 0 ? cat[0].slug : null;
    }

    const updateData = {
      name: name?.trim() ?? existing[0].name,
      description: description?.trim() ?? existing[0].description,
      price: price ? String(price) : existing[0].price,
      subcategory_slug: finalSubcategorySlug,
      category_slug: finalCategorySlug,
      collection_id: finalCollectionId,
      image_url: imageUrl !== undefined ? (imageUrl || null) : existing[0].image_url,
      images: finalImages !== undefined ? (finalImages || []) : existing[0].images,
    };

    console.log('[product/PUT] Update data:', updateData);

    const [updated] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.slug, productId))
      .returning();

    console.log('[product/PUT] Update successful:', updated.slug);
    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error('[product/PUT] error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; productId: string }> },
) {
  try {
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
  } catch (error) {
    console.error('[product/delete] DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
