import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { db } from '@/db';
import { souqflowSettings } from '@/db/schema';

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

export async function GET(_request: NextRequest) {
  try {
    const adminId = await verifyAdmin();
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rows = await db.select().from(souqflowSettings).limit(1);
    const fee = rows[0]?.platformFeePerOrder ?? '0';
    return NextResponse.json({ platformFeePerOrder: fee });
  } catch (error) {
    console.error('SouqFlow settings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminId = await verifyAdmin();
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { platformFeePerOrder } = await request.json();
    if (platformFeePerOrder === undefined || isNaN(Number(platformFeePerOrder))) {
      return NextResponse.json({ error: 'Invalid fee value' }, { status: 400 });
    }

    const rows = await db.select().from(souqflowSettings).limit(1);

    if (rows.length === 0) {
      await db.insert(souqflowSettings).values({
        platformFeePerOrder: String(platformFeePerOrder),
        updatedBy: adminId,
      });
    } else {
      await db.update(souqflowSettings).set({
        platformFeePerOrder: String(platformFeePerOrder),
        updatedAt: new Date(),
        updatedBy: adminId,
      });
    }

    return NextResponse.json({ message: 'Fee updated', platformFeePerOrder: String(platformFeePerOrder) });
  } catch (error) {
    console.error('SouqFlow settings PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
