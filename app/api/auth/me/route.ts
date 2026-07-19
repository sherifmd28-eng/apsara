import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { readDatabase } from '@/lib/db';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const db = readDatabase();
    
    // Find or initialize user cart
    let cart = db.carts.find(c => c.userId === user.id);
    if (!cart) {
      cart = { userId: user.id, items: [] };
    }

    // Find or initialize user wishlist
    let wishlist = db.wishlists.find(w => w.userId === user.id);
    if (!wishlist) {
      wishlist = { userId: user.id, productIds: [] };
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      cart: cart.items,
      wishlist: wishlist.productIds,
    });
  } catch (err) {
    console.error('Me API error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
