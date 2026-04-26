import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { db } from '@/db';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long');

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('souqflow_token')?.value;
  if (!token) return null;
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    const payload = verified.payload as { adminId: number; role: string };
    if (payload.role !== 'souqflow') return null;
    return payload.adminId;
  } catch {
    return null;
  }
}

// GET /api/souqflow/stores/[storeId]/orders
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> },
) {
  try {
    const adminId = await verifyAdmin();
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { storeId } = await params;
    const id = parseInt(storeId);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid store ID' }, { status: 400 });

    const storeOrders = await db.query.orders.findMany({
      where: (o, { eq }) => eq(o.storeId, id),
      with: { items: true },
      orderBy: (o, { desc }) => [desc(o.createdAt)],
    });

    return NextResponse.json({ orders: storeOrders });
  } catch (error) {
    console.error('SouqFlow store orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
