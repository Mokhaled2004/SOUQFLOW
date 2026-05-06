import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { pushSubscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long',
);

// POST /api/push/subscribe — save a push subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, keys, storeId } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
    }

    // Verify auth token if provided (optional — admin subscriptions don't need storeId)
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    let userId: number | null = null;

    if (token) {
      try {
        const verified = await jwtVerify(token, JWT_SECRET);
        userId = (verified.payload as { userId: number }).userId;
      } catch { /* ignore */ }
    }

    // Upsert subscription (replace if endpoint already exists)
    await db
      .insert(pushSubscriptions)
      .values({
        storeId: storeId ?? null,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: {
          p256dh: keys.p256dh,
          auth: keys.auth,
          storeId: storeId ?? null,
        },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/push/subscribe]', error);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}

// DELETE /api/push/subscribe — remove a push subscription
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
    }

    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/push/subscribe]', error);
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
  }
}
