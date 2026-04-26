import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { stores } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

interface JWTPayload {
  userId: number;
  email: string;
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long');

export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let userId: number;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      userId = (verified.payload as JWTPayload).userId;
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Find user's store
    const userStore = await db
      .select()
      .from(stores)
      .where(eq(stores.userId, userId))
      .limit(1);

    if (userStore.length === 0) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { store: userStore[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching store:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
