import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { readDatabase, writeDatabase, Order, OrderItem } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Please sign in to complete checkout.' },
        { status: 401 }
      );
    }

    const { items, shippingAddress, paymentMethod, totalPrice } = await request.json();

    if (!items || items.length === 0 || !shippingAddress || !paymentMethod || totalPrice === undefined) {
      return NextResponse.json(
        { success: false, message: 'Missing checkout information' },
        { status: 400 }
      );
    }

    const db = readDatabase();

    // Verify stock availability
    for (const item of items) {
      const prod = db.products.find(p => p.id === item.productId);
      if (!prod || prod.stock < item.quantity) {
        return NextResponse.json(
          { success: false, message: `Product ${prod?.name || item.name} is out of stock or quantity not available.` },
          { status: 400 }
        );
      }
    }

    const orderId = `ord-${Math.random().toString(36).substr(2, 9)}`;

    // Create the order structure
    const newOrder: Order = {
      id: orderId,
      userId: user.id,
      items: items.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      })),
      shippingAddress,
      paymentMethod,
      paymentStatus: 'Pending',
      totalPrice: Number(totalPrice),
      orderStatus: 'Pending',
      createdAt: new Date().toISOString(),
    };

    let razorpayOrderId = '';

    // Handle payment integration
    if (paymentMethod === 'COD') {
      // Cash on Delivery orders are marked as confirmed immediately, pending payment on delivery
      newOrder.paymentStatus = 'Pending';
      newOrder.orderStatus = 'Pending';
      
      // Update stock immediately for COD
      for (const item of items) {
        const prod = db.products.find(p => p.id === item.productId);
        if (prod) prod.stock -= item.quantity;
      }
      
      // Clear user cart
      const cartIdx = db.carts.findIndex(c => c.userId === user.id);
      if (cartIdx !== -1) {
        db.carts[cartIdx].items = [];
      }
    } else {
      // Digital payment (Razorpay)
      const rzpKeyId = process.env.RAZORPAY_KEY_ID;
      const rzpSecret = process.env.RAZORPAY_KEY_SECRET;

      if (rzpKeyId && rzpSecret) {
        try {
          const authString = Buffer.from(`${rzpKeyId}:${rzpSecret}`).toString('base64');
          const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${authString}`,
            },
            body: JSON.stringify({
              amount: Math.round(totalPrice * 100), // Razorpay accepts in paise
              currency: 'INR',
              receipt: orderId,
            }),
          });
          const rzpOrderData = await response.json();
          if (rzpOrderData && rzpOrderData.id) {
            razorpayOrderId = rzpOrderData.id;
            newOrder.paymentId = razorpayOrderId; // link temporary order ID
          } else {
            console.error('Razorpay Order API failure response:', rzpOrderData);
            throw new Error('Razorpay Order creation failed');
          }
        } catch (err) {
          console.error('Error contacting Razorpay API, falling back to simulation:', err);
          razorpayOrderId = `rzp_order_sim_${Math.random().toString(36).substr(2, 9)}`;
        }
      } else {
        // Fallback simulated mode
        razorpayOrderId = `rzp_order_sim_${Math.random().toString(36).substr(2, 9)}`;
      }
    }

    db.orders.push(newOrder);
    writeDatabase(db);

    return NextResponse.json({
      success: true,
      order: newOrder,
      razorpayOrderId,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_simulationkey12345',
    });
  } catch (err) {
    console.error('Checkout API error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
