import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { packages, packageItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

interface JWTPayload {
  userId: number;
  email: string;
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long');

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; packageId: string }> },
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

    const { slug, packageId } = await params;
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

    // Update package
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (realPrice !== undefined) updateData.realPrice = parseFloat(realPrice);
    if (offerPrice !== undefined) updateData.offerPrice = parseFloat(offerPrice);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const [updated] = await db
      .update(packages)
      .set(updateData)
      .where(eq(packages.id, parseInt(packageId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    // Update items if provided
    if (items !== undefined) {
      // Delete existing items
      await db.delete(packageItems).where(eq(packageItems.packageId, parseInt(packageId)));

      // Add new items
      if (items.length > 0) {
        await db.insert(packageItems).values(
          items.map((item: any) => ({
            packageId: parseInt(packageId),
            productSlug: item.productSlug,
            quantity: item.quantity,
          })),
        );
      }
    }

    return NextResponse.json({ package: updated });
  } catch (error) {
    console.error('[package PATCH] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; packageId: string }> },
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

    const { slug, packageId } = await params;

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

    // Delete package (cascade will delete items)
    const [deleted] = await db
      .delete(packages)
      .where(eq(packages.id, parseInt(packageId)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[package DELETE] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
