import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

interface JWTPayload {
  userId: number;
  email: string;
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long');

export async function GET(request: NextRequest) {
  try {
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

    // Get user from database
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult[0];

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          phone: user.phone,
          location: user.location,
          governorate: user.governorate,
          locationDetail: user.locationDetail,
          isStoreOwner: user.isStoreOwner === 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: number;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      userId = (verified.payload as JWTPayload).userId;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { username, phone, governorate, locationDetail, password } = body;

    // Build update object — only include provided fields
    const updateData: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (username !== undefined) updateData.username = String(username).trim();
    if (phone !== undefined) updateData.phone = String(phone).trim();
    if (governorate !== undefined) updateData.governorate = governorate ? String(governorate).trim() : null;
    if (locationDetail !== undefined) updateData.locationDetail = locationDetail ? String(locationDetail).trim() : null;
    if (password && String(password).trim().length >= 6) {
      updateData.passwordHash = await bcrypt.hash(String(password).trim(), 10);
    }

    await db.update(users).set(updateData).where(eq(users.id, userId));

    // Return updated user
    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userResult[0];

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        location: user.location,
        governorate: user.governorate,
        locationDetail: user.locationDetail,
        isStoreOwner: user.isStoreOwner === 1,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
