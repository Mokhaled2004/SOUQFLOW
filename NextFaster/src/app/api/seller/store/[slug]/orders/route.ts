import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, stores } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long');

// GET /api/seller/store/[slug]/orders — seller fetches all orders for their store
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let userId: number;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      userId = (verified.payload as { userId: number }).userId;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify store ownership
    const [store] = await db
      .select()
      .from(stores)
      .where(and(eq(stores.slug, slug), eq(stores.userId, userId)))
      .limit(1);
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const storeOrders = await db.query.orders.findMany({
      where: (o, { eq }) => eq(o.storeId, store.id),
      with: { items: true },
      orderBy: (o, { desc }) => [desc(o.createdAt)],
    });

    return NextResponse.json({ orders: storeOrders });
  } catch (error) {
    console.error('[GET seller orders]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/seller/store/[slug]/orders — update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { orderId, status } = body;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let userId: number;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      userId = (verified.payload as { userId: number }).userId;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const [store] = await db
      .select()
      .from(stores)
      .where(and(eq(stores.slug, slug), eq(stores.userId, userId)))
      .limit(1);
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const [updated] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(orders.id, orderId), eq(orders.storeId, store.id)))
      .returning();

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error('[PATCH seller orders]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
