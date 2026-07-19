'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Heart, Star, ShoppingCart, Check } from 'lucide-react';
import { Product } from '@/lib/db';

interface ProductCardProps {
  product: Product;
}

export function formatINR(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user, wishlist, toggleWishlist, addToCart } = useApp();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const isWishlisted = wishlist.includes(product.id);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      router.push('/login');
      return;
    }
    await toggleWishlist(product.id);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    if (product.stock <= 0) return;

    setIsAdding(true);
    const success = await addToCart(product.id, 1);
    setIsAdding(false);

    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition duration-300">
      
      {/* Product Image Section */}
      <Link href={`/product/${product.id}`} className="relative block aspect-square w-full overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute left-2.5 top-2.5 bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm uppercase tracking-wide">
            {discount}% OFF
          </span>
        )}

        {/* Out Of Stock Overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Out Of Stock
            </span>
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute right-2.5 top-2.5 rounded-full p-2 bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white hover:scale-110 shadow-sm border border-slate-100 transition cursor-pointer"
        >
          <Heart 
            className={`h-4.5 w-4.5 transition-colors ${
              isWishlisted ? 'fill-rose-500 text-rose-500 stroke-[2.5]' : 'stroke-[2.5]'
            }`} 
          />
        </button>
      </Link>

      {/* Product details */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category */}
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
          {product.category}
        </span>

        {/* Name */}
        <Link 
          href={`/product/${product.id}`}
          className="font-bold text-sm text-slate-800 line-clamp-2 hover:text-pink-600 transition mb-1.5 flex-1"
        >
          {product.name}
        </Link>

        {/* Reviews Rating stars */}
        <div className="flex items-center space-x-1 mb-2.5">
          <div className="flex items-center text-amber-500">
            <Star className="h-3.5 w-3.5 fill-amber-500" />
            <span className="text-xs font-bold ml-1 text-slate-700">{product.rating}</span>
          </div>
          <span className="text-[11px] text-slate-400">({product.numReviews})</span>
        </div>

        {/* Pricing Layout */}
        <div className="flex items-baseline space-x-2 mb-4">
          <span className="text-base font-extrabold text-slate-900">
            {formatINR(product.price)}
          </span>
          {discount > 0 && (
            <span className="text-xs text-slate-400 line-through">
              {formatINR(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Actions Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0 || isAdding}
          className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition cursor-pointer ${
            product.stock <= 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
              : added
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-pink-600 text-white hover:bg-pink-700 hover:shadow-md hover:shadow-pink-500/10 active:scale-98'
          }`}
        >
          {added ? (
            <>
              <Check className="h-4.5 w-4.5 stroke-[2.5]" />
              <span>Added</span>
            </>
          ) : isAdding ? (
            <span>Adding...</span>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              <span>{product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
