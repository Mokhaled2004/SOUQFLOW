import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username, phone, location, governorate, locationDetail, isStoreOwner } = body;

    // Validation
    if (!email || !password || !username || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        username,
        email,
        passwordHash: hashedPassword,
        phone,
        location: governorate ?? location ?? '',
        governorate: governorate ?? null,
        locationDetail: locationDetail ?? null,
        isStoreOwner: isStoreOwner ? 1 : 0,
      })
      .returning();

    // Create JWT token using jose
    const token = await new SignJWT({ userId: newUser[0].id, email: newUser[0].email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // Create response with cookie
    const response = NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: newUser[0].id,
          email: newUser[0].email,
          username: newUser[0].username,
        },
      },
      { status: 201 }
    );

    // Set auth token in cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
