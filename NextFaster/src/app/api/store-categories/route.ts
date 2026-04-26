import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { storeCategories } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const categories = await db
      .select()
      .from(storeCategories)
      .where(eq(storeCategories.isActive, 1))
      .orderBy(storeCategories.name);

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
