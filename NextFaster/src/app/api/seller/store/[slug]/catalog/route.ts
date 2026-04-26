/**
 * GET  /api/seller/store/[slug]/catalog
 *   Returns all categories + their subcategories for this store
 *
 * POST /api/seller/store/[slug]/catalog
 *   body: { type: 'category' | 'subcategory', name: string, parentId?: number }
 *   - type='category'    → creates collection + category + subcollection (auto)
 *   - type='subcategory' → creates subcategory under the given parentId (subcollection)
 *
 * DELETE /api/seller/store/[slug]/catalog?type=category&id=...
 *        /api/seller/store/[slug]/catalog?type=subcategory&slug=...
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { collections, categories, subcollections, subcategories, stores } from '@/db/schema';
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

// ── GET ──────────────────────────────────────────────────────────────────────
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

  // Fetch all collections (= seller's "categories") for this store
  const storeCollections = await db
    .select()
    .from(collections)
    .where(eq(collections.storeId, store.id));

  // For each collection, fetch its subcollections, then subcategories
  const result = await Promise.all(
    storeCollections.map(async (col) => {
      const cats = await db
        .select()
        .from(categories)
        .where(and(eq(categories.collection_id, col.id), eq(categories.storeId, store.id)));

      const subcols = await db
        .select()
        .from(subcollections)
        .where(and(eq(subcollections.storeId, store.id)));

      // Get subcategories for each subcollection that belongs to this collection's categories
      const catSlugs = cats.map((c) => c.slug);
      const relevantSubcols = subcols.filter((sc) => catSlugs.includes(sc.category_slug));

      const subcatRows = await Promise.all(
        relevantSubcols.map((sc) =>
          db
            .select()
            .from(subcategories)
            .where(and(eq(subcategories.subcollection_id, sc.id), eq(subcategories.storeId, store.id))),
        ),
      );

      return {
        id: col.id,
        name: col.name,
        slug: col.slug,
        subcategories: subcatRows.flat().map((s) => ({
          slug: s.slug,
          name: s.name,
          subcollectionId: s.subcollection_id,
        })),
      };
    }),
  );

  return NextResponse.json({ catalog: result });
}

// ── POST ─────────────────────────────────────────────────────────────────────
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
  const { type, name, parentId } = body;

  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  if (type === 'category') {
    // 1. Create collection
    const colSlug = `${generateSlug(name)}-${store.id}-${Date.now()}`;
    const [col] = await db
      .insert(collections)
      .values({ name: name.trim(), slug: colSlug, storeId: store.id })
      .returning();

    // 2. Auto-create category under it
    const catSlug = `cat-${col.id}-${Date.now()}`;
    const [cat] = await db
      .insert(categories)
      .values({ name: name.trim(), slug: catSlug, collection_id: col.id, storeId: store.id })
      .returning();

    // 3. Auto-create subcollection under category
    await db
      .insert(subcollections)
      .values({ name: name.trim(), category_slug: cat.slug, storeId: store.id });

    return NextResponse.json({ category: { id: col.id, name: col.name, slug: col.slug } }, { status: 201 });
  }

  if (type === 'subcategory') {
    if (!parentId) return NextResponse.json({ error: 'parentId required for subcategory' }, { status: 400 });

    // Find the subcollection that belongs to this collection (parentId = collection id)
    const cats = await db
      .select()
      .from(categories)
      .where(and(eq(categories.collection_id, parentId), eq(categories.storeId, store.id)));

    if (cats.length === 0) return NextResponse.json({ error: 'Parent category not found' }, { status: 404 });

    const subcol = await db
      .select()
      .from(subcollections)
      .where(and(eq(subcollections.category_slug, cats[0].slug), eq(subcollections.storeId, store.id)))
      .limit(1);

    if (subcol.length === 0) return NextResponse.json({ error: 'Subcollection not found' }, { status: 404 });

    const subSlug = `sub-${generateSlug(name)}-${store.id}-${Date.now()}`;
    const [sub] = await db
      .insert(subcategories)
      .values({ name: name.trim(), slug: subSlug, subcollection_id: subcol[0].id, storeId: store.id })
      .returning();

    return NextResponse.json({ subcategory: { slug: sub.slug, name: sub.name } }, { status: 201 });
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}

// ── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(
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

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const id = searchParams.get('id');
  const subSlug = searchParams.get('slug');

  if (type === 'category' && id) {
    // Cascade deletes categories → subcollections → subcategories via FK
    await db.delete(collections).where(and(eq(collections.id, parseInt(id)), eq(collections.storeId, store.id)));
    return NextResponse.json({ success: true });
  }

  if (type === 'subcategory' && subSlug) {
    await db.delete(subcategories).where(and(eq(subcategories.slug, subSlug), eq(subcategories.storeId, store.id)));
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
}
