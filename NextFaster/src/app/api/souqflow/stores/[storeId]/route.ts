import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { db } from '@/db';
import { stores } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

// PATCH /api/souqflow/stores/[storeId] — toggle isActive
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> },
) {
  try {
    const adminId = await verifyAdmin();
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { storeId } = await params;
    const id = parseInt(storeId);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid store ID' }, { status: 400 });

    const { isActive } = await request.json();
    if (isActive !== 0 && isActive !== 1) {
      return NextResponse.json({ error: 'isActive must be 0 or 1' }, { status: 400 });
    }

    const result = await db
      .update(stores)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(stores.id, id))
      .returning({ id: stores.id, isActive: stores.isActive });

    if (result.length === 0) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    return NextResponse.json({ store: result[0] });
  } catch (error) {
    console.error('SouqFlow store toggle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
