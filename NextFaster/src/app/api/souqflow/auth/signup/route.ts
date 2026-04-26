import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { souqflowAdmins, souqflowSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await db.select().from(souqflowAdmins).where(eq(souqflowAdmins.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [admin] = await db.insert(souqflowAdmins).values({
      name,
      email,
      password: hashedPassword,
    }).returning();

    // Ensure default settings row exists
    const settings = await db.select().from(souqflowSettings).limit(1);
    if (settings.length === 0) {
      await db.insert(souqflowSettings).values({ platformFeePerOrder: '0' });
    }

    const token = await new SignJWT({ adminId: admin.id, email: admin.email, role: 'souqflow' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    const response = NextResponse.json({
      message: 'Admin created successfully',
      admin: { id: admin.id, name: admin.name, email: admin.email },
    }, { status: 201 });

    response.cookies.set('souqflow_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('SouqFlow signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
