import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems } from '@/db/schema';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long');

// POST /api/orders — create a new order (called when user clicks WhatsApp)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, customerName, customerPhone, customerLocation, subtotal, shippingFee, total, notes, items } = body;

    if (!storeId || !customerName || !customerPhone || !customerLocation || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Try to get userId from token (optional — guest checkout allowed)
    let userId: number | null = null;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (token) {
      try {
        const verified = await jwtVerify(token, JWT_SECRET);
        userId = (verified.payload as { userId: number }).userId;
      } catch { /* guest */ }
    }

    // Insert order
    const [order] = await db.insert(orders).values({
      storeId,
      userId,
      customerName,
      customerPhone,
      customerLocation,
      notes: notes ?? null,
      status: 'pending',
      subtotal: subtotal.toString(),
      shippingFee: shippingFee.toString(),
      total: total.toString(),
    }).returning();

    // Insert order items
    await db.insert(orderItems).values(
      items.map((item: {
        itemType: string;
        productSlug?: string;
        packageId?: number;
        name: string;
        unitPrice: number;
        quantity: number;
        lineTotal: number;
      }) => ({
        orderId: order.id,
        itemType: item.itemType,
        productSlug: item.productSlug ?? null,
        packageId: item.packageId ?? null,
        name: item.name,
        unitPrice: item.unitPrice.toString(),
        quantity: item.quantity,
        lineTotal: item.lineTotal.toString(),
      }))
    );

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/orders]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/orders — get current user's orders
export async function GET(request: NextRequest) {
  try {
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

    const userOrders = await db.query.orders.findMany({
      where: (o, { eq }) => eq(o.userId, userId),
      with: { items: true },
      orderBy: (o, { desc }) => [desc(o.createdAt)],
    });

    return NextResponse.json({ orders: userOrders });
  } catch (error) {
    console.error('[GET /api/orders]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
