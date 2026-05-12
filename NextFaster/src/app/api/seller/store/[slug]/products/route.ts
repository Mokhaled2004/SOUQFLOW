import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products, stores, subcategories, categories, collections } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';
import { generateSlug } from '@/lib/slug';

async function getStoreForUser(slug: string, userId: number) {
  const result = await db
    .select()
    .from(stores)
    .where(and(eq(stores.slug, slug), eq(stores.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

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

  const prods = await db
    .select()
    .from(products)
    .where(eq(products.storeId, store.id));

  return NextResponse.json({ products: prods });
}

export async function POST(
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
  const { name, description, price, subcategorySlug, categorySlug, collectionId, imageUrl } = body;

  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  if (!description?.trim()) return NextResponse.json({ error: 'Description is required' }, { status: 400 });
  if (!price) return NextResponse.json({ error: 'Price is required' }, { status: 400 });

  let finalCollectionId = collectionId ? Number(collectionId) : null;
  let finalCategorySlug = categorySlug || null;
  let finalSubcategorySlug = subcategorySlug || null;

  // Verify association if provided
  if (subcategorySlug) {
    const subcategory = await db
      .select()
      .from(subcategories)
      .where(and(eq(subcategories.slug, subcategorySlug), eq(subcategories.storeId, store.id)))
      .limit(1);
    if (subcategory.length === 0) return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
  } else if (categorySlug) {
    const col = await db
      .select()
      .from(collections)
      .where(and(eq(collections.slug, categorySlug), eq(collections.storeId, store.id)))
      .limit(1);
    if (col.length === 0) return NextResponse.json({ error: 'Category (Collection) not found' }, { status: 404 });
    
    finalCollectionId = col[0].id;
    // Find the auto-created category under this collection
    const cat = await db
      .select()
      .from(categories)
      .where(eq(categories.collection_id, col[0].id))
      .limit(1);
    finalCategorySlug = cat.length > 0 ? cat[0].slug : null;
  }

  // Generate unique slug
  const baseSlug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const productSlug = `${baseSlug}-${store.id}-${Date.now()}`;

  const [product] = await db
    .insert(products)
    .values({
      slug: productSlug,
      name: name.trim(),
      description: description.trim(),
      price: String(price),
      subcategory_slug: finalSubcategorySlug,
      category_slug: finalCategorySlug,
      collection_id: finalCollectionId,
      storeId: store.id,
      image_url: imageUrl || null,
      isActive: 1,
    })
    .returning();

  return NextResponse.json({ product }, { status: 201 });
}
