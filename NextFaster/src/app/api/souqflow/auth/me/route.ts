import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { db } from '@/db';
import { souqflowAdmins } from '@/db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long');

export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('souqflow_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let adminId: number;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      const payload = verified.payload as { adminId: number; role: string };
      if (payload.role !== 'souqflow') throw new Error('Invalid role');
      adminId = payload.adminId;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const result = await db.select().from(souqflowAdmins).where(eq(souqflowAdmins.id, adminId)).limit(1);
    if (result.length === 0) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    const admin = result[0];
    return NextResponse.json({
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    console.error('SouqFlow me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
