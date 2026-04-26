import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, stores, souqflowSettings } from '@/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long');

// GET /api/seller/store/[slug]/analytics?period=day|week|month
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const period = request.nextUrl.searchParams.get('period') || 'week';

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let userId: number;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      userId = (verified.payload as { userId: number }).userId;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const [store] = await db
      .select()
      .from(stores)
      .where(and(eq(stores.slug, slug), eq(stores.userId, userId)))
      .limit(1);
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    // Get platform fee
    const settingsRows = await db.select().from(souqflowSettings).limit(1);
    const platformFee = parseFloat(settingsRows[0]?.platformFeePerOrder ?? '0');

    // Date range based on period
    const now = new Date();
    let since: Date;
    let groupFormat: string;
    if (period === 'day') {
      since = new Date(now.getTime() - 24 * 60 * 60 * 1000 * 30); // last 30 days
      groupFormat = 'YYYY-MM-DD';
    } else if (period === 'week') {
      since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 * 12); // last 12 weeks
      groupFormat = 'IYYY"-W"IW';
    } else {
      since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000 * 12); // last 12 months
      groupFormat = 'YYYY-MM';
    }

    // Analytics grouped by period — use sql.raw for the format string
    const periodExpr = sql<string>`TO_CHAR(${orders.createdAt}, ${sql.raw(`'${groupFormat}'`)})`;

    const analytics = await db
      .select({
        period: periodExpr,
        totalOrders: sql<number>`COUNT(${orders.id})`,
        totalSubtotal: sql<string>`COALESCE(SUM(${orders.subtotal}), 0)`,
      })
      .from(orders)
      .where(and(eq(orders.storeId, store.id), gte(orders.createdAt, since)))
      .groupBy(periodExpr)
      .orderBy(periodExpr);

    const analyticsWithFees = analytics.map((a) => ({
      period: a.period,
      totalOrders: Number(a.totalOrders),
      totalSubtotal: parseFloat(a.totalSubtotal).toFixed(2),
      totalPlatformFees: (Number(a.totalOrders) * platformFee).toFixed(2),
    }));

    // Overall totals — query all orders for this store regardless of date
    const allOrdersResult = await db
      .select({
        totalOrders: sql<number>`COUNT(${orders.id})`,
        totalSubtotal: sql<string>`COALESCE(SUM(${orders.subtotal}), 0)`,
      })
      .from(orders)
      .where(eq(orders.storeId, store.id));

    const allOrders = Number(allOrdersResult[0]?.totalOrders ?? 0);
    const allSubtotal = parseFloat(allOrdersResult[0]?.totalSubtotal ?? '0');
    const allFees = allOrders * platformFee;

    const totalOrders = analyticsWithFees.reduce((s, a) => s + a.totalOrders, 0);
    const totalSubtotal = analyticsWithFees.reduce((s, a) => s + parseFloat(a.totalSubtotal), 0);
    const totalFees = totalOrders * platformFee;

    // Top selling products — from order_items joined with orders for this store
    const topProducts = await db
      .select({
        productSlug: orderItems.productSlug,
        name: orderItems.name,
        totalQty: sql<number>`SUM(${orderItems.quantity})`,
        totalRevenue: sql<string>`SUM(${orderItems.lineTotal})`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(
        eq(orders.storeId, store.id),
        eq(orderItems.itemType, 'product'),
      ))
      .groupBy(orderItems.productSlug, orderItems.name)
      .orderBy(sql`SUM(${orderItems.quantity}) DESC`)
      .limit(10);

    return NextResponse.json({
      platformFee: platformFee.toFixed(2),
      summary: {
        totalOrders: allOrders,
        totalSubtotal: allSubtotal.toFixed(2),
        totalFees: allFees.toFixed(2),
      },
      analytics: analyticsWithFees,
      topProducts: topProducts.map((p) => ({
        productSlug: p.productSlug,
        name: p.name,
        totalQty: Number(p.totalQty),
        totalRevenue: parseFloat(p.totalRevenue).toFixed(2),
      })),
    });
  } catch (error) {
    console.error('[GET analytics]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
