import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { packages, packageItems } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

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

    // Fetch active packages with their items
    const pkgs = await db.query.packages.findMany({
      where: and(
        eq(packages.storeId, store.id),
        eq(packages.isActive, 1),
      ),
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
    console.error('[store packages GET] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
