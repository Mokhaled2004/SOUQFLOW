import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { souqflowAdmins } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const result = await db.select().from(souqflowAdmins).where(eq(souqflowAdmins.email, email)).limit(1);
    if (result.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const admin = result[0];
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await new SignJWT({ adminId: admin.id, email: admin.email, role: 'souqflow' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    const response = NextResponse.json({
      message: 'Login successful',
      admin: { id: admin.id, name: admin.name, email: admin.email },
    }, { status: 200 });

    response.cookies.set('souqflow_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('SouqFlow login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
