'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/components/ProductCard';
import { Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { user, wishlist, products, toggleWishlist, addToCart } = useApp();

  // Map wishlist IDs to full product details
  const wishlistedItems = wishlist.map(id => {
    return products.find(p => p.id === id);
  }).filter(p => p !== undefined);

  const handleRemove = async (productId: string) => {
    await toggleWishlist(productId);
  };

  const handleMoveToCart = async (productId: string) => {
    const success = await addToCart(productId, 1);
    if (success) {
      // Remove from wishlist after moving to cart
      await toggleWishlist(productId);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 py-8 md:px-6">
        <h1 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-2">
          <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
          <span>My Wishlist</span>
        </h1>

        {wishlistedItems.length === 0 ? (
          // Empty State
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm max-w-lg mx-auto">
            <div className="bg-slate-100 p-4 rounded-full w-max mx-auto mb-4">
              <Heart className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-lg font-black text-slate-800 mb-2">Your Wishlist is empty</h2>
            <p className="text-xs text-slate-500 mb-6 max-w-xs mx-auto">
              Save premium items to your wishlist. Shop now and click the heart icon on products to save them.
            </p>
            <Link
              href="/search"
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-2.5 px-6 rounded-lg text-xs transition inline-block cursor-pointer shadow-sm"
            >
              Discover Products
            </Link>
          </div>
        ) : (
          // Wishlist Grid
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {wishlistedItems.map((prod) => {
              const product = prod!;
              const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
              return (
                <div 
                  key={product.id} 
                  className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition duration-300"
                >
                  {/* Image */}
                  <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-103" 
                    />
                    
                    {/* Delete from wishlist Icon */}
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="absolute right-2 top-2 p-1.5 rounded-full bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm border border-slate-100 transition cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {discount > 0 && (
                      <span className="absolute left-2 top-2 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                        {discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-1 flex-col p-4">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-1">{product.category}</span>
                    <Link 
                      href={`/product/${product.id}`}
                      className="font-bold text-xs md:text-sm text-slate-800 line-clamp-2 hover:text-amber-600 transition mb-1 flex-1"
                    >
                      {product.name}
                    </Link>

                    {/* Price */}
                    <div className="flex items-baseline space-x-1.5 mb-4">
                      <span className="text-sm font-extrabold text-slate-900">{formatINR(product.price)}</span>
                      {discount > 0 && <span className="text-[10px] text-slate-400 line-through">{formatINR(product.originalPrice)}</span>}
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => handleMoveToCart(product.id)}
                      disabled={product.stock <= 0}
                      className="w-full bg-amber-400 hover:bg-amber-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-950 font-extrabold py-2 px-3 rounded-lg text-xs shadow-sm flex items-center justify-center space-x-1.5 transition cursor-pointer active:scale-95"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span>{product.stock <= 0 ? 'Out of Stock' : 'Move to Cart'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
