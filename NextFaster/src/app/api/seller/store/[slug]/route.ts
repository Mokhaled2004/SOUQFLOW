import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { stores } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long');

async function getUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return (verified.payload as { userId: number }).userId;
  } catch {
    return null;
  }
}

// GET /api/seller/store/[slug] — fetch store info for admin panel
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await params;

    const [store] = await db
      .select()
      .from(stores)
      .where(and(eq(stores.slug, slug), eq(stores.userId, userId)))
      .limit(1);

    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    return NextResponse.json({ store });
  } catch (error) {
    console.error('[GET /api/seller/store/[slug]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/seller/store/[slug] — update store info
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await params;

    const [store] = await db
      .select()
      .from(stores)
      .where(and(eq(stores.slug, slug), eq(stores.userId, userId)))
      .limit(1);

    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const body = await request.json();
    const {
      storeName, storeDescription, whatsappNumber,
      email, phone, primaryLocation, businessType, taxId,
      storeLogo, storeBanner,
    } = body;

    await db.update(stores).set({
      ...(storeName !== undefined && { storeName }),
      ...(storeDescription !== undefined && { storeDescription }),
      ...(whatsappNumber !== undefined && { whatsappNumber }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(primaryLocation !== undefined && { primaryLocation }),
      ...(businessType !== undefined && { businessType }),
      ...(taxId !== undefined && { taxId }),
      ...(storeLogo !== undefined && { storeLogo }),
      ...(storeBanner !== undefined && { storeBanner }),
      updatedAt: new Date(),
    }).where(eq(stores.id, store.id));

    const [updated] = await db.select().from(stores).where(eq(stores.id, store.id)).limit(1);
    return NextResponse.json({ store: updated });
  } catch (error) {
    console.error('[PATCH /api/seller/store/[slug]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/seller/store/[slug] — permanently delete store
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await params;

    const [store] = await db
      .select()
      .from(stores)
      .where(and(eq(stores.slug, slug), eq(stores.userId, userId)))
      .limit(1);

    if (!store) {
      return NextResponse.json({ error: 'Store not found or access denied' }, { status: 404 });
    }

    // Cascades to products, orders, packages, shipping rates, agreements
    await db.delete(stores).where(eq(stores.id, store.id));

    return NextResponse.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('[DELETE /api/seller/store/[slug]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
