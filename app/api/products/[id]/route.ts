import { NextResponse } from 'next/server';
import { readDatabase, writeDatabase } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = readDatabase();
    const product = db.products.find(p => p.id === id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (err) {
    console.error('Product GET ID API error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, price, originalPrice, image, images, category, stock, specs, isFeatured } = body;

    const db = readDatabase();
    const productIndex = db.products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const updatedProduct = {
      ...db.products[productIndex],
      name: name || db.products[productIndex].name,
      description: description || db.products[productIndex].description,
      price: price !== undefined ? Number(price) : db.products[productIndex].price,
      originalPrice: originalPrice !== undefined ? Number(originalPrice) : db.products[productIndex].originalPrice,
      image: image || db.products[productIndex].image,
      images: images || db.products[productIndex].images,
      category: category || db.products[productIndex].category,
      stock: stock !== undefined ? Number(stock) : db.products[productIndex].stock,
      specs: specs || db.products[productIndex].specs,
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : db.products[productIndex].isFeatured,
    };

    db.products[productIndex] = updatedProduct;
    writeDatabase(db);

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (err) {
    console.error('Product PUT ID API error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const db = readDatabase();
    const productIndex = db.products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    db.products.splice(productIndex, 1);
    writeDatabase(db);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (err) {
    console.error('Product DELETE ID API error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
