/**
 * Public endpoint — returns the current platform fee per order.
 * Used by the seller onboarding form to show the fee in the terms.
 */
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { souqflowSettings } from '@/db/schema';

export async function GET() {
  try {
    const rows = await db.select().from(souqflowSettings).limit(1);
    const fee = rows[0]?.platformFeePerOrder ?? '0';
    return NextResponse.json({ platformFeePerOrder: fee });
  } catch {
    return NextResponse.json({ platformFeePerOrder: '0' });
  }
}
