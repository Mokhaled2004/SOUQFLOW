import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

interface JWTPayload {
  userId: number;
  email: string;
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long');

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; productId: string }> },
) {
  try {
    console.log('[product update] Starting PATCH request');
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      console.log('[product update] No auth token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: number;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      userId = (verified.payload as JWTPayload).userId;
      console.log('[product update] Auth verified for user:', userId);
    } catch (err) {
      console.log('[product update] JWT verification failed:', err);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { slug, productId } = await params;
    console.log('[product update] Updating product:', productId, 'in store:', slug);
    
    const body = await request.json();
    console.log('[product update] Request body:', body);
    
    const { offerPercentage, isOutOfStock } = body;

    // Validate offer percentage
    if (offerPercentage !== undefined) {
      const offer = parseInt(offerPercentage);
      if (isNaN(offer) || offer < 0 || offer > 100) {
        console.log('[product update] Invalid offer percentage:', offer);
        return NextResponse.json(
          { error: 'Offer percentage must be between 0 and 100' },
          { status: 400 },
        );
      }
    }

    console.log('[product update] Updating with values:', { offerPercentage, isOutOfStock });

    // Update product - always set both fields
    const updateData: any = {};
    if (offerPercentage !== undefined) {
      updateData.offerPercentage = parseInt(offerPercentage);
    }
    if (isOutOfStock !== undefined) {
      updateData.isOutOfStock = isOutOfStock ? 1 : 0;
    }

    console.log('[product update] Update data:', updateData);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Update product
    const result = await db
      .update(products)
      .set(updateData)
      .where(eq(products.slug, productId))
      .returning();

    console.log('[product update] Update result:', result);

    if (!result || result.length === 0) {
      console.log('[product update] Product not found:', productId);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    console.log('[product update] Success, returning:', result[0]);
    return NextResponse.json({ product: result[0] });
  } catch (error) {
    console.error('[product update] error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}
