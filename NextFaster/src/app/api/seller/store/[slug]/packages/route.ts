import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { packages, packageItems, products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

interface JWTPayload {
  userId: number;
  email: string;
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    // Get store by slug
    const { stores } = await import('@/db/schema');
    const store = await db.query.stores.findFirst({
      where: (s) => eq(s.slug, slug),
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Fetch packages with their items
    const pkgs = await db.query.packages.findMany({
      where: (p) => eq(p.storeId, store.id),
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });

    const safePkgs = pkgs.map(pkg => ({
      ...pkg,
      images: pkg.images || [],
      items: (pkg.items || []).map(item => ({
        ...item,
        product: item.product ? {
          ...item.product,
          images: (item.product as any).images || []
        } : null
      }))
    }));

    return NextResponse.json({ packages: safePkgs });
  } catch (error) {
    console.error('[packages GET] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      console.error('[packages POST] No auth_token in cookies');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: number;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      userId = (verified.payload as JWTPayload).userId;
      console.log('[packages POST] Token verified. userId:', userId);
    } catch (err) {
      console.error('[packages POST] Token verification failed:', err);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const { name, description, realPrice, offerPrice, imageUrl, images, items } = body;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Get store by slug
    const { stores } = await import('@/db/schema');
    const store = await db.query.stores.findFirst({
      where: (s) => eq(s.slug, slug),
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    console.log('[packages POST] Store found. store.userId:', store.userId, 'userId:', userId);

    // Verify user owns the store
    if (store.userId !== userId) {
      console.error('[packages POST] Forbidden: user does not own store', { storeUserId: store.userId, userId });
      return NextResponse.json({ error: 'Forbidden: you do not own this store' }, { status: 403 });
    }

    // Create package
    const [pkg] = await db
      .insert(packages)
      .values({
        storeId: store.id,
        name: name.trim(),
        description: description?.trim() || null,
        realPrice: parseFloat(realPrice),
        offerPrice: parseFloat(offerPrice),
        imageUrl: imageUrl || null,
        images: images || [],
      })
      .returning();

    // Add package items
    if (items && items.length > 0) {
      await db.insert(packageItems).values(
        items.map((item: any) => ({
          packageId: pkg.id,
          productSlug: item.productSlug,
          quantity: item.quantity || 1,
        })),
      );
    }

    console.log('[packages POST] Package created successfully:', pkg.id);
    return NextResponse.json({ package: pkg }, { status: 201 });
  } catch (error) {
    console.error('[packages POST] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
