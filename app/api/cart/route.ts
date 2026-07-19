import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { readDatabase, writeDatabase, CartItem } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Please sign in to update your cart.' },
        { status: 401 }
      );
    }

    const { productId, quantity } = await request.json();

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { success: false, message: 'Missing product ID or quantity' },
        { status: 400 }
      );
    }

    const db = readDatabase();

    // Verify product exists and is in stock
    const product = db.products.find(p => p.id === productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    if (quantity > 0 && product.stock < quantity) {
      return NextResponse.json(
        { success: false, message: `Only ${product.stock} items left in stock.` },
        { status: 400 }
      );
    }

    let userCart = db.carts.find(c => c.userId === user.id);
    if (!userCart) {
      userCart = { userId: user.id, items: [] };
      db.carts.push(userCart);
    }

    const itemIndex = userCart.items.findIndex(item => item.productId === productId);

    if (quantity <= 0) {
      // Remove item
      if (itemIndex !== -1) {
        userCart.items.splice(itemIndex, 1);
      }
    } else {
      // Add or update item
      if (itemIndex !== -1) {
        userCart.items[itemIndex].quantity = quantity;
      } else {
        userCart.items.push({ productId, quantity });
      }
    }

    writeDatabase(db);

    return NextResponse.json({
      success: true,
      message: 'Cart updated successfully',
      cart: userCart.items,
    });
  } catch (err) {
    console.error('Cart POST API error:', err);
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
      return NextResponse.json({ success: true, cart: [] });
    }

    const db = readDatabase();
    const userCart = db.carts.find(c => c.userId === user.id);
    return NextResponse.json({
      success: true,
      cart: userCart ? userCart.items : [],
    });
  } catch (err) {
    console.error('Cart GET API error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
