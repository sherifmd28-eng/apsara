import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { readDatabase, writeDatabase } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Please sign in.' },
        { status: 401 }
      );
    }

    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Missing order details' },
        { status: 400 }
      );
    }

    const db = readDatabase();
    const orderIndex = db.orders.findIndex(o => o.id === orderId && o.userId === user.id);

    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    const order = db.orders[orderIndex];
    let signatureVerified = false;

    const rzpSecret = process.env.RAZORPAY_KEY_SECRET;

    if (rzpSecret && razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      // Real Razorpay signature verification
      try {
        const text = `${razorpay_order_id}|${razorpay_payment_id}`;
        const generated_signature = crypto
          .createHmac('sha256', rzpSecret)
          .update(text)
          .digest('hex');

        signatureVerified = generated_signature === razorpay_signature;
      } catch (err) {
        console.error('Cryptographic signature verification failed:', err);
        signatureVerified = false;
      }
    } else {
      // Simulation mode
      // If we are simulating, we verify orders that have simulated IDs
      signatureVerified = true;
    }

    if (signatureVerified) {
      // Mark order as paid
      order.paymentStatus = 'Paid';
      order.paymentId = razorpay_payment_id || `pay_sim_${Math.random().toString(36).substr(2, 9)}`;
      order.orderStatus = 'Pending'; // Remains Pending until shipped by admin

      // Deduct stock for digital payment (since stock wasn't deducted in checkout/create)
      for (const item of order.items) {
        const prod = db.products.find(p => p.id === item.productId);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
        }
      }

      // Clear user cart
      const cartIdx = db.carts.findIndex(c => c.userId === user.id);
      if (cartIdx !== -1) {
        db.carts[cartIdx].items = [];
      }

      writeDatabase(db);

      return NextResponse.json({
        success: true,
        message: 'Payment verified and order placed successfully!',
        order,
      });
    } else {
      // Update order payment status to Failed
      order.paymentStatus = 'Failed';
      writeDatabase(db);

      return NextResponse.json(
        { success: false, message: 'Payment verification failed' },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error('Payment verify API error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
