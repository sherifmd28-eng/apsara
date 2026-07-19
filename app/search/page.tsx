'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useApp } from '@/context/AppContext';
import { SlidersHorizontal, Star, Trash2, Grid, List } from 'lucide-react';

const CATEGORIES = [
  'Mobiles & Electronics',
  'Fashion & Apparel',
  'Home & Living',
  'Books & Stationery',
  'Beauty & Personal Care'
];

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-sm font-bold text-slate-500 animate-pulse">Loading catalog...</p>
        </div>
        <Footer />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, loading } = useApp();

  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const minPriceParam = searchParams.get('minPrice') || '0';
  const maxPriceParam = searchParams.get('maxPrice') || '200000';
  const ratingParam = searchParams.get('rating') || '0';
  const sortParam = searchParams.get('sort') || 'featured';

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [maxPrice, setMaxPrice] = useState(parseInt(maxPriceParam));
  const [selectedRating, setSelectedRating] = useState(parseInt(ratingParam));
  const [sortOrder, setSortOrder] = useState(sortParam);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Sync state with URL parameters when they change
  useEffect(() => {
    setSelectedCategory(categoryParam);
    setMaxPrice(parseInt(maxPriceParam));
    setSelectedRating(parseInt(ratingParam));
    setSortOrder(sortParam);
  }, [categoryParam, maxPriceParam, ratingParam, sortParam]);

  // Update URL function
  const updateUrlFilters = (updatedFilters: {
    category?: string;
    maxPrice?: number;
    rating?: number;
    sort?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (updatedFilters.category !== undefined) {
      if (updatedFilters.category) params.set('category', updatedFilters.category);
      else params.delete('category');
    }
    if (updatedFilters.maxPrice !== undefined) {
      params.set('maxPrice', updatedFilters.maxPrice.toString());
    }
    if (updatedFilters.rating !== undefined) {
      if (updatedFilters.rating > 0) params.set('rating', updatedFilters.rating.toString());
      else params.delete('rating');
    }
    if (updatedFilters.sort !== undefined) {
      params.set('sort', updatedFilters.sort);
    }
    
    router.push(`/search?${params.toString()}`);
  };

  const handleCategoryChange = (cat: string) => {
    const newVal = selectedCategory === cat ? '' : cat;
    setSelectedCategory(newVal);
    updateUrlFilters({ category: newVal });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setMaxPrice(val);
  };

  const handlePriceMouseUp = () => {
    updateUrlFilters({ maxPrice });
  };

  const handleRatingChange = (rate: number) => {
    const newVal = selectedRating === rate ? 0 : rate;
    setSelectedRating(newVal);
    updateUrlFilters({ rating: newVal });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSortOrder(val);
    updateUrlFilters({ sort: val });
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setMaxPrice(200000);
    setSelectedRating(0);
    setSortOrder('featured');
    
    // Clear URL parameters but preserve the search query 'q'
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    router.push(`/search?${params.toString()}`);
  };

  // Perform client-side filtering on loaded context products
  const filteredProducts = products.filter(product => {
    // Search query
    if (query) {
      const q = query.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchCat = product.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }
    // Category
    if (selectedCategory && product.category !== selectedCategory) {
      return false;
    }
    // Price
    if (product.price > maxPrice) {
      return false;
    }
    // Rating
    if (selectedRating > 0 && product.rating < selectedRating) {
      return false;
    }
    return true;
  });

  // Sort
  if (sortOrder === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortOrder === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortOrder === 'rating') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  } else if (sortOrder === 'newest') {
    filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 py-8 md:px-6">
        
        {/* Top Info Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 mb-6 gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900">
              {query ? `Search results for "${query}"` : 'Browse Catalog'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Found {filteredProducts.length} premium products
            </p>
          </div>

          {/* Sorting & Views */}
          <div className="flex items-center space-x-4 self-end md:self-auto">
            {/* Grid/List switch */}
            <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === 'grid' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === 'list' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="font-bold text-slate-500">Sort by:</span>
              <select
                value={sortOrder}
                onChange={handleSortChange}
                className="bg-white border border-slate-200 rounded-lg py-1.5 px-3 font-semibold text-slate-800 shadow-sm cursor-pointer outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="featured">Featured Selections</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
                <option value="newest">Newest Additions</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid: Filters + Catalog */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 bg-white border border-slate-200 rounded-xl p-5 shadow-sm shrink-0 self-start">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-5">
              <div className="flex items-center space-x-1.5 font-black text-slate-950 text-sm">
                <SlidersHorizontal className="h-4.5 w-4.5 text-amber-500" />
                <span>Filter By</span>
              </div>
              <button 
                onClick={clearFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer transition"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear All
              </button>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-3">Categories</h3>
              <div className="space-y-2">
                {CATEGORIES.map(cat => (
                  <label key={cat} className="flex items-center space-x-2.5 text-xs text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategory === cat}
                      onChange={() => handleCategoryChange(cat)}
                      className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 accent-amber-500"
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter Slider */}
            <div className="mb-6 border-t border-slate-100 pt-5">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500">Max Price</h3>
                <span className="text-xs font-black text-slate-900 bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                  ₹{maxPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="300"
                max="200000"
                step="500"
                value={maxPrice}
                onChange={handlePriceChange}
                onMouseUp={handlePriceMouseUp}
                onTouchEnd={handlePriceMouseUp}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                <span>₹300</span>
                <span>₹2,00,000+</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="border-t border-slate-100 pt-5">
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 mb-3">Avg. Review</h3>
              <div className="space-y-2">
                {[4, 3, 2].map(rate => (
                  <label 
                    key={rate} 
                    className="flex items-center space-x-2.5 text-xs text-slate-700 font-semibold cursor-pointer hover:text-amber-600 transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRating === rate}
                      onChange={() => handleRatingChange(rate)}
                      className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 accent-amber-500"
                    />
                    <div className="flex items-center text-amber-500">
                      {[...Array(rate)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-500" />
                      ))}
                      {[...Array(5 - rate)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 text-slate-200" />
                      ))}
                      <span className="text-xs font-bold text-slate-600 ml-1.5">& Up</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Catalog grid display */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-xl h-80 border border-slate-200"></div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
                <Trash2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-800 mb-2">No matching products found</h3>
                <p className="text-xs text-slate-500 mb-6">
                  Try adjusting your filters, modifying your search query, or checking back later.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-2 px-5 rounded-lg text-xs transition cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              // List View Mode
              <div className="space-y-4">
                {filteredProducts.map(product => {
                  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
                  const isWishlisted = false; // simplify list view implementation
                  return (
                    <div key={product.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-5 hover:shadow-md transition">
                      <Link href={`/product/${product.id}`} className="relative h-40 w-40 shrink-0 mx-auto bg-slate-100 rounded-lg overflow-hidden">
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover object-center" />
                        {discount > 0 && (
                          <span className="absolute left-2 top-2 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                            {discount}% OFF
                          </span>
                        )}
                      </Link>
                      <div className="flex-1 flex flex-col">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-0.5">{product.category}</span>
                        <Link href={`/product/${product.id}`} className="font-bold text-base text-slate-800 hover:text-amber-600 mb-1.5 transition">
                          {product.name}
                        </Link>
                        <div className="flex items-center space-x-1.5 mb-2.5">
                          <div className="flex items-center text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-amber-500" />
                            <span className="text-xs font-bold ml-1 text-slate-700">{product.rating}</span>
                          </div>
                          <span className="text-xs text-slate-400">({product.numReviews} reviews)</span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">{product.description}</p>
                        
                        <div className="mt-auto flex items-baseline justify-between gap-4">
                          <div className="flex items-baseline space-x-2">
                            <span className="text-lg font-black text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
                            {discount > 0 && <span className="text-xs text-slate-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>}
                          </div>
                          <Link 
                            href={`/product/${product.id}`} 
                            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-1.5 px-4 rounded-lg text-xs shadow-sm transition"
                          >
                            View Product Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
