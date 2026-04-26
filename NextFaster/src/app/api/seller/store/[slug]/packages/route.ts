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

    return NextResponse.json({ packages: pkgs });
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: number;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      userId = (verified.payload as JWTPayload).userId;
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const { name, description, realPrice, offerPrice, imageUrl, items } = body;

    // Get store by slug
    const { stores } = await import('@/db/schema');
    const store = await db.query.stores.findFirst({
      where: (s) => eq(s.slug, slug),
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Verify user owns the store
    if (store.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create package
    const [pkg] = await db
      .insert(packages)
      .values({
        storeId: store.id,
        name,
        description,
        realPrice: parseFloat(realPrice),
        offerPrice: parseFloat(offerPrice),
        imageUrl,
      })
      .returning();

    // Add package items
    if (items && items.length > 0) {
      await db.insert(packageItems).values(
        items.map((item: any) => ({
          packageId: pkg.id,
          productSlug: item.productSlug,
          quantity: item.quantity,
        })),
      );
    }

    return NextResponse.json({ package: pkg });
  } catch (error) {
    console.error('[packages POST] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
