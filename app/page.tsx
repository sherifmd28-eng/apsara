'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard, { formatINR } from '@/components/ProductCard';
import { useApp } from '@/context/AppContext';
import { 
  Smartphone, 
  Shirt, 
  Home as HomeIcon, 
  BookOpen, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Percent,
  Truck,
  RotateCcw,
  Star,
  ShieldCheck,
  Award,
  Activity,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';

const QUICK_CATEGORIES = [
  { name: 'Mobiles & Electronics', icon: Smartphone, bg: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100' },
  { name: 'Fashion & Apparel', icon: Shirt, bg: 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100' },
  { name: 'Home & Living', icon: HomeIcon, bg: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' },
  { name: 'Books & Stationery', icon: BookOpen, bg: 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' },
  { name: 'Beauty & Personal Care', icon: Sparkles, bg: 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100' }
];

export default function Home() {
  const { products, loading } = useApp();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Mouse Spotlight Coordinate Tracking State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Simulated Live purchase feed state
  const [purchaseFeed] = useState([
    { name: 'Priya Deshmukh', location: 'Mumbai', item: 'Banarasi Saree', price: 4999, time: 'Just now' },
    { name: 'Rohan Gupta', location: 'Delhi', item: 'OnePlus 12', price: 64999, time: '1 min ago' },
    { name: 'Karan Malhotra', location: 'Bangalore', item: 'WH-1000XM5 Headphones', price: 29999, time: '3 mins ago' },
    { name: 'Ananya Nair', location: 'Pune', item: 'Forest Essentials Beauty Kit', price: 4250, time: '5 mins ago' },
    { name: 'Rajesh Kumar', location: 'Chennai', item: 'iPhone 15 Pro Max', price: 144900, time: '8 mins ago' }
  ]);
  const [feedIdx, setFeedIdx] = useState(0);

  useEffect(() => {
    const ticker = setInterval(() => {
      setFeedIdx(prev => (prev + 1) % purchaseFeed.length);
    }, 4500);
    return () => clearInterval(ticker);
  }, [purchaseFeed.length]);

  // Deals countdown logic
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const difference = endOfDay.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
  const dealProducts = products.slice(0, 4);

  // Parallax / Perspective 3D skew calculator
  const getTiltStyle = (cardIndex: number) => {
    if (!isHovered) {
      return {
        transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0)',
        transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.5s ease',
      };
    }
    
    // skew angles based on coordinates relative to viewport center
    const dx = mousePos.x - 800; // center offset
    const dy = mousePos.y - 300;
    
    const rx = -dy / 60; // scale constraint
    const ry = dx / 120;
    
    const multiplier = cardIndex === 1 ? 1.3 : cardIndex === 2 ? -0.9 : 0.7;

    return {
      transform: `perspective(1000px) rotateY(${ry * multiplier}deg) rotateX(${rx * multiplier}deg) translateZ(12px) translateY(-5px)`,
      transition: 'transform 0.1s ease-out, box-shadow 0.3s ease',
    };
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Insert custom global CSS animations */}
      <style>{`
        @keyframes float-y-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1.5deg); }
        }
        @keyframes float-y-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(12px) rotate(-1.5deg); }
        }
        @keyframes drift {
          0% { transform: translate(0px, 0px); }
          50% { transform: translate(30px, -40px); }
          100% { transform: translate(0px, 0px); }
        }
        .animate-float-1 {
          animation: float-y-slow 6s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float-y-reverse 8s ease-in-out infinite;
        }
        .animate-float-3 {
          animation: float-y-slow 7s ease-in-out infinite;
        }
        .animate-drift-particle {
          animation: drift 25s ease-in-out infinite;
        }
        .gradient-text-gold {
          background: linear-gradient(135deg, #f59e0b 0%, #fb923c 50%, #fef08a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .gradient-text-pink {
          background: linear-gradient(135deg, #db2777 0%, #f43f5e 50%, #be185d 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* Main Container */}
      <main className="flex-grow">
        
        {/* Full-Screen Premium Luxury Hero Section */}
        <section 
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-full min-h-[90vh] lg:h-[calc(100vh-100px)] bg-gradient-to-br from-white via-rose-50/40 to-slate-50 overflow-hidden flex flex-col justify-center border-b border-rose-100"
        >
          {/* Spotlight Cursor follow effect */}
          <div 
            className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-500 opacity-70"
            style={{
              background: `radial-gradient(circle 500px at ${mousePos.x}px ${mousePos.y}px, rgba(219, 39, 119, 0.07), transparent 80%)`
            }}
          />

          {/* Background Highlights */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-pink-100/25 blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-rose-100/35 blur-[120px] pointer-events-none"></div>

          {/* Animated Particles background */}
          <div className="absolute inset-0 pointer-events-none opacity-25">
            <div className="absolute top-1/4 left-1/3 w-3 h-3 rounded-full bg-pink-400 blur-xs animate-drift-particle" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-2/3 left-1/4 w-2.5 h-2.5 rounded-full bg-rose-300 blur-xs animate-drift-particle" style={{ animationDelay: '-5s' }}></div>
            <div className="absolute top-1/3 right-1/4 w-3.5 h-3.5 rounded-full bg-pink-200 blur-xs animate-drift-particle" style={{ animationDelay: '-12s' }}></div>
            <div className="absolute bottom-1/4 right-1/3 w-2 h-2 rounded-full bg-rose-200 blur-xs animate-drift-particle" style={{ animationDelay: '-18s' }}></div>
          </div>

          <div className="mx-auto max-w-7xl w-full px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 relative">
            
            {/* Left Content Column (Headline, Badge, CTA, Trust indicators) */}
            <div className="lg:col-span-7 text-left space-y-8 animate-in fade-in duration-700">
              
              {/* Trust Customer Rating Badge */}
              <div className="inline-flex items-center space-x-2.5 bg-pink-50 border border-pink-100 px-3.5 py-1.5 rounded-full shadow-xs">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-500" />
                  ))}
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
                  4.9/5 Rating (50,000+ Trusted Reviews)
                </span>
              </div>

              {/* Luxury Apple-Like Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.1] max-w-xl">
                  Crafted for Elegance. <br className="hidden md:inline" />
                  Curated for <span className="gradient-text-pink">Premium Quality.</span>
                </h1>
                <p className="text-sm md:text-base text-slate-500 font-medium max-w-md leading-relaxed">
                  Welcome to Apsara, India's premier boutique. Discover a handpicked collection of Banarasi sarees, flagship technology, premium wireless audio, and organic skincare.
                </p>
              </div>

              {/* Limited Time Offer Callout */}
              <div className="flex items-center space-x-3 bg-pink-50/50 border border-pink-100/80 p-3 rounded-2xl max-w-md shadow-xs">
                <div className="bg-pink-100 p-2.5 rounded-xl border border-pink-200 shrink-0">
                  <Percent className="h-5 w-5 text-pink-600" />
                </div>
                <div className="text-xs">
                  <p className="font-extrabold text-slate-800">Inaugural Celebration Sale</p>
                  <p className="text-slate-500 font-semibold">
                    Get extra 10% Off. Use coupon code <strong className="text-pink-600 font-black">APSARA10</strong> at checkout.
                  </p>
                </div>
              </div>

              {/* Shop CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/search"
                  className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-black px-8 py-3.5 rounded-xl text-xs md:text-sm shadow-lg shadow-pink-500/10 hover:shadow-pink-500/25 transition transform hover:scale-102 flex items-center justify-center gap-2 cursor-pointer duration-300 group"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform text-white" />
                </Link>
                <Link
                  href="/search?sort=newest"
                  className="border border-slate-200 hover:bg-pink-50/30 hover:border-pink-200 text-slate-700 font-bold px-6 py-3.5 rounded-xl text-xs md:text-sm bg-white transition flex items-center justify-center gap-1.5"
                >
                  Explore Categories
                </Link>
                <Link
                  href="/sell-phone"
                  className="border-2 border-dashed border-pink-300 hover:border-pink-400 bg-pink-50 hover:bg-pink-100 text-pink-700 font-extrabold px-6 py-3.5 rounded-xl text-xs md:text-sm transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  Sell Old Phone 📱
                </Link>
              </div>

              {/* Redesigned trust badges grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-200/60 max-w-xl text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-pink-500 shrink-0" />
                  <span className="leading-tight">Premium<br /><span className="text-[8px] text-slate-400 lowercase font-medium tracking-normal block">Quality</span></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-pink-500 shrink-0" />
                  <span className="leading-tight">Fast<br /><span className="text-[8px] text-slate-400 lowercase font-medium tracking-normal block">Delivery</span></span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-pink-500 shrink-0" />
                  <span className="leading-tight">Secure<br /><span className="text-[8px] text-slate-400 lowercase font-medium tracking-normal block">Payments</span></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-pink-500 shrink-0 fill-pink-500/10" />
                  <span className="leading-tight">Customer<br /><span className="text-[8px] text-slate-400 lowercase font-medium tracking-normal block">Trust</span></span>
                </div>
              </div>

            </div>

            {/* Right Graphic Column: Modern Hero Image */}
            <div className="lg:col-span-5 relative w-full h-[480px] hidden lg:flex items-center justify-center">
              {/* Main Hero Image Frame */}
              <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white bg-slate-100 transition-all duration-500 hover:scale-101">
                <img 
                  src="/hero_premium.png" 
                  alt="Premium Curated Products" 
                  className="w-full h-full object-cover" 
                />
                {/* Subtle vignette shade */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Customer Trust Card */}
              <div className="absolute -bottom-2 -left-6 bg-white/95 backdrop-blur-md border border-slate-100 p-4 rounded-2xl shadow-xl flex items-center space-x-3.5 max-w-xs animate-float-1">
                <div className="bg-pink-50 p-2.5 rounded-xl border border-pink-100">
                  <ShieldCheck className="h-6 w-6 text-pink-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-slate-800">100% Trust Guarantee</p>
                  <p className="text-[10px] text-slate-500 font-medium">Verified Genuine Products Only</p>
                </div>
              </div>

              {/* Floating Express Shipping Card */}
              <div className="absolute top-12 -right-4 bg-white/95 backdrop-blur-md border border-slate-100 p-3 rounded-2xl shadow-xl flex items-center space-x-2.5 animate-float-2">
                <div className="bg-pink-50 p-2 rounded-xl border border-pink-100">
                  <Truck className="h-5 w-5 text-pink-600" />
                </div>
                <div className="text-left text-[10px]">
                  <p className="font-extrabold text-slate-800">Free Express Shipping</p>
                  <p className="text-slate-500 font-medium">Orders deliver in 2-4 days</p>
                </div>
              </div>
            </div>

          </div>

          {/* Simulated Live Shopping Feed Ticker */}
          <div className="absolute bottom-6 left-6 z-30 hidden md:block">
            <div className="backdrop-blur-md bg-white/90 border border-slate-100 px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-3.5 max-w-xs transition-all duration-300">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
              <div className="text-[10px] text-slate-600 font-semibold leading-normal">
                <span className="text-slate-850 font-extrabold">{purchaseFeed[feedIdx].name}</span> from {purchaseFeed[feedIdx].location} bought <span className="text-pink-600 font-bold">{purchaseFeed[feedIdx].item}</span> ({purchaseFeed[feedIdx].time})
              </div>
            </div>
          </div>

        </section>

        {/* Quick Categories Bubble Section */}
        <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <h2 className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
            Explore Handpicked Selections
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:flex md:items-center md:justify-center md:gap-6">
            {QUICK_CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                href={`/search?category=${encodeURIComponent(cat.name)}`}
                className={`flex items-center space-x-3 border border-solid p-3.5 rounded-xl transition duration-300 ${cat.bg} md:w-52`}
              >
                <cat.icon className="h-5 w-5 shrink-0" />
                <span className="text-xs font-extrabold text-slate-800">{cat.name.split(' & ')[0]}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Deals of the Day with Countdown timer */}
        <section className="bg-slate-100 py-12 border-y border-slate-200">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            {/* Header with Countdown */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-rose-100 text-rose-600 p-2 rounded-lg">
                  <Percent className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Today's Grand Deals</h2>
                  <p className="text-xs text-slate-500">Unbeatable prices on bestselling items</p>
                </div>
              </div>

              {/* Live Countdown Timer */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500 mr-2 uppercase tracking-wide">Deals end in:</span>
                <div className="flex space-x-1 text-sm font-black">
                  <span className="bg-slate-900 text-amber-400 px-2.5 py-1.5 rounded shadow-sm min-w-10 text-center">
                    {String(timeLeft.hours).padStart(2, '0')}h
                  </span>
                  <span className="text-slate-700 self-center font-bold">:</span>
                  <span className="bg-slate-900 text-amber-400 px-2.5 py-1.5 rounded shadow-sm min-w-10 text-center">
                    {String(timeLeft.minutes).padStart(2, '0')}m
                  </span>
                  <span className="text-slate-700 self-center font-bold">:</span>
                  <span className="bg-slate-900 text-amber-400 px-2.5 py-1.5 rounded shadow-sm min-w-10 text-center">
                    {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-xl h-80 border border-slate-200"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {dealProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Dynamic Offer Banner */}
        <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-rose-50 via-pink-50/50 to-slate-50 text-slate-800 p-8 md:p-12 shadow-sm border border-pink-100/60 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute inset-0 bg-cover bg-center opacity-5 bg-[url('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800')]"></div>
            <div className="relative z-10 max-w-xl">
              <span className="text-xs uppercase font-extrabold tracking-widest text-pink-600 mb-2 block">
                Summer Special Offer
              </span>
              <h2 className="text-2xl md:text-3xl font-black mb-3 text-slate-900">
                Grab ₹500 Cashback on UPI Transactions
              </h2>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                Shop premium linens, silk apparel, and high-performance electronics. Link your UPI account and pay securely to unlock discounts. Valid on order sizes above ₹2,999.
              </p>
            </div>
            <Link
              href="/search"
              className="relative z-10 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold px-6 py-3 rounded-xl text-xs md:text-sm shadow-md hover:scale-102 transition shrink-0 animate-in fade-in"
            >
              Shop Catalog Now
            </Link>
          </div>
        </section>

        {/* Featured Selections */}
        <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="bg-amber-100 text-amber-600 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Featured Recommendations</h2>
                <p className="text-xs text-slate-500">Handpicked premium products chosen for you</p>
              </div>
            </div>
            <Link 
              href="/search" 
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 group"
            >
              View All <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl h-80 border border-slate-200"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}
