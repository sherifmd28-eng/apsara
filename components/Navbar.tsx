'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  MapPin, 
  Menu, 
  X, 
  ChevronDown, 
  LogOut,
  Settings,
  ShoppingBag
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Mobiles & Electronics',
  'Fashion & Apparel',
  'Home & Living',
  'Books & Stationery',
  'Beauty & Personal Care'
];

const MAIN_CATEGORIES = [
  { name: 'Mobiles', href: '/search?category=Mobiles%20%26%20Electronics&q=mobile' },
  { name: 'Laptops', href: '/search?category=Mobiles%20%26%20Electronics&q=laptop' },
  { name: 'Electronics', href: '/search?category=Mobiles%20%26%20Electronics' },
  { name: 'Fashion', href: '/search?category=Fashion%20%26%20Apparel' },
  { name: 'Home Appliances', href: '/search?category=Home%20%26%20Living' },
  { name: 'Accessories', href: '/search?q=accessories' },
  { name: 'Sell Your Phone', href: '/sell-phone' }
];

export default function Navbar() {
  const { user, cartCount, wishlistCount, logout } = useApp();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let url = `/search?q=${encodeURIComponent(searchQuery)}`;
    if (searchCategory !== 'All') {
      url += `&category=${encodeURIComponent(searchCategory)}`;
    }
    router.push(url);
  };

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      router.push('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md text-slate-800 border-b border-slate-100 shadow-sm">
      {/* Top bar (Amazon-like layout with unique Indian premium aesthetic: pink-600 / slate-800) */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 bg-clip-text text-transparent hover:brightness-110 transition">
            APSARA
          </span>
          <span className="hidden text-[10px] uppercase font-bold text-pink-600 tracking-widest md:inline-block border border-pink-200 px-1 rounded bg-pink-50">
            India
          </span>
        </Link>

        {/* Deliver to Location */}
        <div className="hidden lg:flex items-center space-x-1 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition border border-transparent hover:border-slate-100">
          <MapPin className="h-5 w-5 text-pink-600" />
          <div className="text-left text-xs leading-tight">
            <p className="text-slate-500 font-medium">Deliver to</p>
            <p className="text-slate-850 font-bold">Mumbai 400001</p>
          </div>
        </div>

        {/* Search Bar Container */}
        <form 
          onSubmit={handleSearchSubmit} 
          className="hidden md:flex flex-1 max-w-xl mx-4 bg-slate-50 rounded-lg overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-pink-500 focus-within:border-pink-500 transition-all"
        >
          {/* Category Dropdown */}
          <div className="relative border-r border-slate-200 bg-slate-100/50 text-slate-800 flex items-center">
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold bg-transparent cursor-pointer outline-none focus:ring-0 text-slate-700"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat.split(' & ')[0]}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search premium Mobiles, Sarees, Home Decor, Beauty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
          />

          {/* Search Action Button */}
          <button 
            type="submit" 
            className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-5 flex items-center justify-center transition cursor-pointer"
          >
            <Search className="h-4 w-4 stroke-[2.5]" />
          </button>
        </form>

        {/* Right Nav Options */}
        <div className="flex items-center space-x-4">
          {/* User Account / Actions Dropdown */}
          <div className="relative">
            <div 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-1 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition border border-transparent hover:border-slate-100"
            >
              <User className="h-5 w-5 text-slate-500" />
              <div className="hidden sm:block text-left text-xs leading-none">
                <p className="text-slate-500 mb-0.5">Hello, {user ? user.name.split(' ')[0] : 'Sign In'}</p>
                <p className="text-slate-800 font-bold flex items-center">
                  Account & Lists <ChevronDown className="h-3 w-3 ml-0.5 text-slate-500" />
                </p>
              </div>
            </div>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-56 rounded-md bg-white text-slate-900 shadow-xl ring-1 ring-black/5 z-20">
                  <div className="p-3 border-b border-slate-100">
                    {user ? (
                      <div>
                        <p className="text-xs text-slate-500">Signed in as</p>
                        <p className="font-bold text-sm text-slate-800 truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                    ) : (
                      <div className="text-center py-1">
                        <p className="text-xs text-slate-600 mb-2">Access your account details</p>
                        <Link 
                          href="/login" 
                          onClick={() => setIsProfileOpen(false)}
                          className="block w-full text-center bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white text-xs font-bold py-1.5 px-3 rounded shadow transition"
                        >
                          Sign In / Register
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="py-1 text-sm">
                    {user && (
                      <>
                        <Link 
                          href="/order/history" 
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50"
                        >
                          <ShoppingBag className="mr-3 h-4 w-4 text-slate-400" /> Your Orders
                        </Link>
                        <Link 
                          href="/wishlist" 
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50"
                        >
                          <Heart className="mr-3 h-4 w-4 text-slate-400" /> Wishlist
                        </Link>
                        {user.role === 'admin' && (
                          <Link 
                            href="/admin" 
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50 font-semibold"
                          >
                            <Settings className="mr-3 h-4 w-4 text-slate-400" /> Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-left flex items-center px-4 py-2 text-red-600 hover:bg-red-50 border-t border-slate-100"
                        >
                          <LogOut className="mr-3 h-4 w-4" /> Sign Out
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Wishlist */}
          <Link 
            href="/wishlist" 
            className="relative flex items-center p-1.5 hover:bg-slate-50 rounded transition"
          >
            <Heart className="h-6 w-6 text-rose-500 fill-rose-500/10 hover:fill-rose-500 transition" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link 
            href="/cart" 
            className="relative flex items-center space-x-1.5 p-1.5 hover:bg-slate-50 rounded transition"
          >
            <div className="relative">
              <ShoppingCart className="h-6 w-6 text-pink-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-pink-600 text-[10px] font-extrabold text-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline-block text-xs font-bold self-end text-slate-700">Cart</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="block md:hidden text-slate-700 hover:text-pink-600 transition"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Sub Navbar (Categories) */}
      <Suspense fallback={
        <div className="bg-white text-xs font-semibold overflow-x-auto border-y border-slate-200/85 shadow-xs py-3 h-[45px]">
          <div className="mx-auto max-w-7xl px-4 flex items-center space-x-7 md:px-6 animate-pulse bg-slate-100/50 h-5 w-1/3 rounded-md"></div>
        </div>
      }>
        <CategoryNavBar />
      </Suspense>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-150 p-4 space-y-4 shadow-inner">
          {/* Mobile Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
            />
            <button type="submit" className="bg-sky-600 text-white px-4 flex items-center justify-center">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Navigation Links */}
          <Suspense fallback={<div className="animate-pulse bg-slate-100/50 h-40 rounded-xl"></div>}>
            <MobileNavDrawer setIsMobileMenuOpen={setIsMobileMenuOpen} />
          </Suspense>
        </div>
      )}
    </header>
  );
}

function CategoryNavBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const getActiveCategory = () => {
    if (pathname === '/sell-phone') {
      return 'Sell Your Phone';
    }
    if (pathname === '/search') {
      const cat = searchParams.get('category');
      const q = searchParams.get('q')?.toLowerCase() || '';
      
      if (cat?.includes('Mobiles') && q.includes('mobile')) return 'Mobiles';
      if (cat?.includes('Mobiles') && q.includes('laptop')) return 'Laptops';
      if (cat?.includes('Mobiles')) return 'Electronics';
      if (cat?.includes('Fashion')) return 'Fashion';
      if (cat?.includes('Home')) return 'Home Appliances';
      if (q.includes('accessories')) return 'Accessories';
    }
    return '';
  };

  const activeCategory = getActiveCategory();

  return (
    <div className="bg-white text-xs font-semibold overflow-x-auto border-y border-slate-200/85 shadow-xs">
      <div className="mx-auto max-w-7xl px-4 flex items-center space-x-7 whitespace-nowrap md:px-6">
        <Link href="/search" className="flex items-center text-slate-700 hover:text-pink-600 py-3 transition">
          <Menu className="h-4 w-4 mr-1.5 stroke-[2.5] text-slate-505" /> All Products
        </Link>
        <span className="text-slate-200">|</span>
        
        {MAIN_CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.name;
          return (
            <Link 
              key={cat.name} 
              href={cat.href}
              className={`relative py-3 px-0.5 text-xs font-bold transition-all duration-300 group flex items-center ${
                isActive 
                  ? 'text-pink-600' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`absolute bottom-0 left-0 w-full h-[2.5px] bg-pink-600 rounded-full transition-all duration-300 transform origin-left ${
                isActive 
                  ? 'scale-x-100 opacity-100' 
                  : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
              }`} />
            </Link>
          );
        })}
        
        <span className="flex-grow"></span>
        <span className="text-pink-600 font-bold hidden lg:inline-block text-[11px]">Free delivery above ₹499!</span>
      </div>
    </div>
  );
}

function MobileNavDrawer({ setIsMobileMenuOpen }: { setIsMobileMenuOpen: (open: boolean) => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getActiveCategory = () => {
    if (pathname === '/sell-phone') {
      return 'Sell Your Phone';
    }
    if (pathname === '/search') {
      const cat = searchParams.get('category');
      const q = searchParams.get('q')?.toLowerCase() || '';
      
      if (cat?.includes('Mobiles') && q.includes('mobile')) return 'Mobiles';
      if (cat?.includes('Mobiles') && q.includes('laptop')) return 'Laptops';
      if (cat?.includes('Mobiles')) return 'Electronics';
      if (cat?.includes('Fashion')) return 'Fashion';
      if (cat?.includes('Home')) return 'Home Appliances';
      if (q.includes('accessories')) return 'Accessories';
    }
    return '';
  };

  const activeCategory = getActiveCategory();

  return (
    <nav className="flex flex-col space-y-3 text-sm font-semibold text-left">
      <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 hover:text-slate-955">
        Home
      </Link>
      
      <span className="text-[10px] text-slate-400 uppercase tracking-widest pt-2">Shop Categories</span>
      {MAIN_CATEGORIES.map(cat => {
        const isActive = activeCategory === cat.name;
        return (
          <Link 
            key={cat.name} 
            href={cat.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`pl-2 py-1.5 rounded transition text-xs font-bold flex items-center justify-between ${
              isActive 
                ? 'text-pink-600 bg-pink-50/50 font-black' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{cat.name}</span>
            {isActive && <span className="h-1.5 w-1.5 rounded-full bg-pink-600 mr-2" />}
          </Link>
        );
      })}
    </nav>
  );
}
