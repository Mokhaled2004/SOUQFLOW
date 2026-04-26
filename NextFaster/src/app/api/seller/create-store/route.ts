import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { stores, users, storeAgreements, souqflowSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { generateSlug } from '@/lib/slug';

interface JWTPayload {
  userId: number;
  email: string;
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeName, storeDescription, storeCategoryId, whatsappNumber, agreedToTerms } = body;

    if (!storeName || !storeDescription || !storeCategoryId || !whatsappNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!agreedToTerms) {
      return NextResponse.json({ error: 'You must agree to the terms and conditions' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let userId: number;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      userId = (verified.payload as JWTPayload).userId;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Get current platform fee for the agreement snapshot
    const settings = await db.select().from(souqflowSettings).limit(1);
    const platformFee = settings[0]?.platformFeePerOrder ?? '0';

    // Generate slug from store name
    const baseSlug = generateSlug(storeName);

    // Insert store
    const newStore = await db
      .insert(stores)
      .values({
        userId,
        storeName,
        slug: baseSlug,
        storeDescription,
        storeCategoryId,
        whatsappNumber,
        isActive: 1,
      })
      .returning();

    // Make slug unique by appending the store id
    const uniqueSlug = `${baseSlug}-${newStore[0].id}`;
    await db.update(stores).set({ slug: uniqueSlug }).where(eq(stores.id, newStore[0].id));

    // Save agreement record
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? null;
    await db.insert(storeAgreements).values({
      storeId: newStore[0].id,
      userId,
      ipAddress: ip,
      termsVersion: '1.0',
      platformFeeAtAgreement: platformFee.toString(),
    });

    return NextResponse.json(
      {
        message: 'Store created successfully',
        store: {
          id: newStore[0].id,
          storeName: newStore[0].storeName,
          slug: uniqueSlug,
          userId: newStore[0].userId,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Store creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
