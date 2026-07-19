import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { readDatabase, writeDatabase } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Please sign in to update your wishlist.' },
        { status: 401 }
      );
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Missing product ID' },
        { status: 400 }
      );
    }

    const db = readDatabase();
    
    // Verify product exists
    const productExists = db.products.some(p => p.id === productId);
    if (!productExists) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    let userWishlist = db.wishlists.find(w => w.userId === user.id);
    if (!userWishlist) {
      userWishlist = { userId: user.id, productIds: [] };
      db.wishlists.push(userWishlist);
    }

    const index = userWishlist.productIds.indexOf(productId);
    let isAdded = false;

    if (index !== -1) {
      userWishlist.productIds.splice(index, 1);
    } else {
      userWishlist.productIds.push(productId);
      isAdded = true;
    }

    writeDatabase(db);

    return NextResponse.json({
      success: true,
      message: isAdded ? 'Added to wishlist' : 'Removed from wishlist',
      wishlist: userWishlist.productIds,
      isWishlisted: isAdded,
    });
  } catch (err) {
    console.error('Wishlist POST API error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: true, wishlist: [] });
    }

    const db = readDatabase();
    const userWishlist = db.wishlists.find(w => w.userId === user.id);
    return NextResponse.json({
      success: true,
      wishlist: userWishlist ? userWishlist.productIds : [],
    });
  } catch (err) {
    console.error('Wishlist GET API error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
