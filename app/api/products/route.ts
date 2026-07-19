import { NextResponse } from 'next/server';
import { readDatabase, writeDatabase, Product } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';
    const category = searchParams.get('category') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '9999999');
    const rating = parseFloat(searchParams.get('rating') || '0');
    const sort = searchParams.get('sort') || 'featured';

    const db = readDatabase();
    let products = [...db.products];

    // Search query match
    if (query) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (category && category !== 'All') {
      products = products.filter(p => p.category === category);
    }

    // Price filter
    products = products.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // Rating filter
    if (rating > 0) {
      products = products.filter(p => p.rating >= rating);
    }

    // Sort order
    if (sort === 'price-asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'newest') {
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (err) {
    console.error('Products GET API error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, price, originalPrice, image, images, category, stock, specs } = body;

    if (!name || !description || price === undefined || !image || !category || stock === undefined) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = readDatabase();
    
    const newProduct: Product = {
      id: `prod-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price),
      image,
      images: images || [image],
      category,
      stock: Number(stock),
      rating: 0,
      numReviews: 0,
      isFeatured: body.isFeatured || false,
      specs: specs || {},
      reviews: [],
      createdAt: new Date().toISOString(),
    };

    db.products.push(newProduct);
    writeDatabase(db);

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (err) {
    console.error('Products POST API error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
