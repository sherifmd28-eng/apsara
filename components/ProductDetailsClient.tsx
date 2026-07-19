'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Product, ProductReview } from '@/lib/db';
import { formatINR } from './ProductCard';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Check, 
  MessageSquare,
  Truck,
  RotateCcw,
  ShieldCheck,
  Send
} from 'lucide-react';

interface ProductDetailsClientProps {
  product: Product;
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const { user, wishlist, toggleWishlist, addToCart } = useApp();
  const router = useRouter();

  const [activeImage, setActiveImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  const isWishlisted = wishlist.includes(product.id);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  // Review Distribution calculation
  const reviews = product.reviews || [];
  const starsCount = [0, 0, 0, 0, 0]; // 1, 2, 3, 4, 5 stars
  reviews.forEach(r => {
    const idx = Math.min(4, Math.max(0, r.rating - 1));
    starsCount[idx]++;
  });
  const starsPercentages = starsCount.map(c => 
    reviews.length > 0 ? Math.round((c / reviews.length) * 100) : 0
  );

  const handleAddToCart = async (isBuyNow = false) => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (product.stock <= 0) return;

    setIsAdding(true);
    const success = await addToCart(product.id, quantity);
    setIsAdding(false);

    if (success) {
      if (isBuyNow) {
        router.push('/cart');
      } else {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    await toggleWishlist(product.id);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    if (!comment.trim()) {
      setReviewMessage('Please write a comment.');
      return;
    }

    setReviewLoading(true);
    setReviewMessage('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating,
          comment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setComment('');
        setRating(5);
        setReviewMessage('Review added successfully!');
        // Refresh server data
        router.refresh();
      } else {
        setReviewMessage(data.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error(err);
      setReviewMessage('An error occurred. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Images Gallery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center">
            <img
              src={activeImage}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`h-16 w-16 rounded-xl border-2 overflow-hidden bg-slate-50 transition shrink-0 cursor-pointer ${
                    activeImage === img ? 'border-amber-500 scale-102 shadow-sm' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={img} alt={`${product.name} thumbnail ${i}`} className="h-full w-full object-cover object-center" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center: Main product details */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <span className="inline-block bg-slate-100 text-slate-700 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border border-slate-200 mb-2">
              {product.category}
            </span>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-snug">{product.name}</h1>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
            <div className="flex items-center text-amber-500 font-bold">
              <Star className="h-4 w-4 fill-amber-500" />
              <span className="ml-1 text-sm">{product.rating}</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-bold text-slate-500 hover:text-amber-600 transition cursor-pointer">
              {reviews.length} Customer Reviews
            </span>
          </div>

          {/* Pricing */}
          <div className="space-y-1">
            <div className="flex items-baseline space-x-3">
              <span className="text-2xl font-black text-slate-950">{formatINR(product.price)}</span>
              {discount > 0 && (
                <>
                  <span className="text-sm text-slate-400 line-through font-medium">{formatINR(product.originalPrice)}</span>
                  <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">Inclusive of all taxes</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">Description</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">{product.description}</p>
          </div>

          {/* Specifications Grid */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="space-y-3 border-t border-slate-100 pt-5">
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">Specifications</h3>
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-semibold">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="border-b border-slate-50 pb-2">
                    <span className="text-slate-400 block mb-0.5">{key}</span>
                    <span className="text-slate-800">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Buying Panel */}
        <div className="lg:col-span-3">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5 shadow-sm">
            {/* Stock indicator */}
            <div>
              {product.stock > 0 ? (
                <div>
                  <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50">
                    In Stock
                  </span>
                  {product.stock <= 5 && (
                    <p className="text-xs text-rose-600 font-bold mt-2.5">
                      Only {product.stock} items left - order soon!
                    </p>
                  )}
                </div>
              ) : (
                <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200/50">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Qty Selector */}
            {product.stock > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Quantity:</span>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded-lg py-1 px-3.5 text-xs font-bold text-slate-800 shadow-sm cursor-pointer outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {[...Array(Math.min(10, product.stock))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Price calculation */}
            {product.stock > 0 && (
              <div className="flex justify-between items-baseline border-t border-slate-200/60 pt-4 text-xs font-bold">
                <span className="text-slate-500">Subtotal:</span>
                <span className="text-base text-slate-900">{formatINR(product.price * quantity)}</span>
              </div>
            )}

            {/* Add to Cart / Buy now buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleAddToCart(false)}
                disabled={product.stock <= 0 || isAdding}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 shadow-sm transition cursor-pointer ${
                  product.stock <= 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : added
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-amber-400 text-slate-950 hover:bg-amber-500 active:scale-98'
                }`}
              >
                {added ? (
                  <>
                    <Check className="h-4.5 w-4.5 stroke-[2.5]" />
                    <span>Added to Cart</span>
                  </>
                ) : isAdding ? (
                  <span>Adding...</span>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              {product.stock > 0 && (
                <button
                  onClick={() => handleAddToCart(true)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition cursor-pointer active:scale-98"
                >
                  Buy Now
                </button>
              )}

              <button
                onClick={handleWishlistToggle}
                className={`w-full py-2 px-4 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                  isWishlisted
                    ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100/60'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isWishlisted ? 'Remove Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>

            {/* Free Shipping Promise info */}
            <div className="border-t border-slate-200/60 pt-4 space-y-3.5 text-[11px] font-semibold text-slate-500">
              <div className="flex items-center space-x-2.5">
                <Truck className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Free delivery on orders above ₹499</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <RotateCcw className="h-4 w-4 text-slate-400 shrink-0" />
                <span>7-Day Replacement & Easy Returns</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0" />
                <span>COD / UPI Payment Options Available</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Review Section */}
      <section className="mt-12 border-t border-slate-100 pt-10">
        <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
          <MessageSquare className="h-5.5 w-5.5 text-amber-500" />
          <span>Customer Ratings & Reviews</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Review distribution analytics */}
          <div className="md:col-span-4 space-y-5">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
              <p className="text-3xl font-black text-slate-900 mb-1">{product.rating} <span className="text-base text-slate-400 font-bold">/ 5</span></p>
              <div className="flex justify-center text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4.5 w-4.5 ${
                      i < Math.floor(product.rating) ? 'fill-amber-500' : 'text-slate-200'
                    }`} 
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 font-semibold">{reviews.length} global customer ratings</p>
            </div>

            {/* Distribution bars */}
            <div className="space-y-2 px-1 text-xs font-bold text-slate-600">
              {[5, 4, 3, 2, 1].map(stars => {
                const idx = stars - 1;
                const percentage = starsPercentages[idx];
                return (
                  <div key={stars} className="flex items-center space-x-3.5">
                    <span className="w-10 text-right shrink-0">{stars} star</span>
                    <div className="flex-grow h-2 bg-slate-150 rounded-full overflow-hidden border border-slate-200/30">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <span className="w-8 shrink-0 text-slate-400 text-left">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Write a review form & list of reviews */}
          <div className="md:col-span-8 space-y-8">
            {/* Write a Review Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-black text-slate-900 text-sm mb-4">Review this product</h3>
              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Select stars rating */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-500">Your Rating:</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="text-amber-400 hover:scale-110 transition cursor-pointer"
                        >
                          <Star className={`h-5 w-5 ${star <= rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 block">Written review:</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What did you like or dislike? How does it look or perform?"
                      rows={3}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={reviewLoading}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-5 rounded-lg text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" /> Submit Review
                    </button>
                    {reviewMessage && (
                      <span className={`text-xs font-bold ${
                        reviewMessage.includes('successfully') ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {reviewMessage}
                      </span>
                    )}
                  </div>
                </form>
              ) : (
                <div className="py-2 text-center text-xs">
                  <p className="text-slate-500 font-semibold mb-3">Please sign in to share your experience with other customers.</p>
                  <Link href="/login" className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-4 rounded-lg">
                    Sign In to Review
                  </Link>
                </div>
              )}
            </div>

            {/* List of Reviews */}
            <div className="space-y-4">
              <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-2">Customer Feedback</h3>
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No reviews yet. Be the first to review this product!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="border-b border-slate-100 pb-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800">{rev.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {new Date(rev.date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-500" />
                        ))}
                        {[...Array(5 - rev.rating)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 text-slate-100" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
