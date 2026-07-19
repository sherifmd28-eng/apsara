import { NextResponse } from 'next/server';
import { readDatabase, writeDatabase } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Please sign in to add a review.' },
        { status: 401 }
      );
    }

    const { productId, rating, comment } = await request.json();

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { success: false, message: 'Missing review details' },
        { status: 400 }
      );
    }

    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const db = readDatabase();
    const product = db.products.find(p => p.id === productId);

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const newReview = {
      id: `rev-${Math.random().toString(36).substr(2, 9)}`,
      name: user.name,
      rating: ratingNum,
      comment,
      date: new Date().toISOString(),
    };

    product.reviews = product.reviews || [];
    product.reviews.push(newReview);

    // Recalculate average rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = Number((totalRating / product.reviews.length).toFixed(1));
    product.numReviews = product.reviews.length;

    writeDatabase(db);

    return NextResponse.json({
      success: true,
      message: 'Review added successfully',
      review: newReview,
      productRating: product.rating,
      productNumReviews: product.numReviews,
    });
  } catch (err) {
    console.error('Reviews POST API error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
