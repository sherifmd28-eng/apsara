import { NextResponse } from 'next/server';
import { readDatabase } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Please sign in to view orders.' },
        { status: 401 }
      );
    }

    const db = readDatabase();
    let orders = [];

    if (user.role === 'admin') {
      orders = db.orders;
    } else {
      orders = db.orders.filter(o => o.userId === user.id);
    }

    // Sort by newest first
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error('Orders GET API error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
