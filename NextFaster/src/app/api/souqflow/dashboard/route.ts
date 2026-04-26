import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { db } from '@/db';
import { stores, orders, souqflowSettings, storeCategories } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long');

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('souqflow_token')?.value;
  if (!token) return null;
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    const payload = verified.payload as { adminId: number; role: string };
    if (payload.role !== 'souqflow') return null;
    return payload.adminId;
  } catch {
    return null;
  }
}

export async function GET(_request: NextRequest) {
  try {
    const adminId = await verifyAdmin();
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get platform fee
    const settingsRows = await db.select().from(souqflowSettings).limit(1);
    const platformFee = parseFloat(settingsRows[0]?.platformFeePerOrder ?? '0');

    // Get all stores with their order stats
    const storeStats = await db
      .select({
        storeId: stores.id,
        storeName: stores.storeName,
        storeSlug: stores.slug,
        isActive: stores.isActive,
        createdAt: stores.createdAt,
        categoryName: storeCategories.name,
        totalOrders: sql<number>`COUNT(${orders.id})`,
        totalSubtotal: sql<string>`COALESCE(SUM(${orders.subtotal}), 0)`,
      })
      .from(stores)
      .leftJoin(orders, eq(orders.storeId, stores.id))
      .leftJoin(storeCategories, eq(stores.storeCategoryId, storeCategories.id))
      .groupBy(stores.id, stores.storeName, stores.slug, stores.isActive, stores.createdAt, storeCategories.name)
      .orderBy(sql`COUNT(${orders.id}) DESC`);

    // Calculate totals
    let totalSubtotal = 0;
    let totalOrders = 0;

    const storesWithFees = storeStats.map((s) => {
      const subtotal = parseFloat(s.totalSubtotal);
      const orderCount = Number(s.totalOrders);
      const feesCollected = orderCount * platformFee;
      totalSubtotal += subtotal;
      totalOrders += orderCount;
      return {
        id: s.storeId,
        name: s.storeName,
        slug: s.storeSlug,
        isActive: s.isActive,
        createdAt: s.createdAt,
        category: s.categoryName ?? 'Uncategorized',
        totalOrders: orderCount,
        totalSubtotal: subtotal.toFixed(2),
        feesCollected: feesCollected.toFixed(2),
        storeNetRevenue: (subtotal - feesCollected).toFixed(2),
      };
    });

    const totalFees = totalOrders * platformFee;

    return NextResponse.json({
      platformFee: platformFee.toFixed(2),
      overview: {
        totalStores: storeStats.length,
        totalOrders,
        totalSubtotal: totalSubtotal.toFixed(2),
        totalFees: totalFees.toFixed(2),
        totalNetRevenue: (totalSubtotal - totalFees).toFixed(2),
      },
      stores: storesWithFees,
    });
  } catch (error) {
    console.error('SouqFlow dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
