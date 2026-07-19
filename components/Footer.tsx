'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, ShieldCheck, Truck, RefreshCw, CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-250 text-slate-600 text-sm mt-auto">
      {/* High-Value Trust Grid */}
      <div className="bg-rose-50/30 py-8 border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 gap-6 sm:grid-cols-3 md:px-6 text-center">
          <div className="flex flex-col items-center p-4">
            <Truck className="h-8 w-8 text-pink-600 mb-3" />
            <h4 className="font-bold text-slate-800 mb-1">Free & Fast Delivery</h4>
            <p className="text-xs text-slate-500">Free delivery on orders above ₹499 across India</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <RefreshCw className="h-8 w-8 text-pink-600 mb-3" />
            <h4 className="font-bold text-slate-800 mb-1">7-Day Easy Returns</h4>
            <p className="text-xs text-slate-500">No questions asked return and replacement policy</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <ShieldCheck className="h-8 w-8 text-pink-600 mb-3" />
            <h4 className="font-bold text-slate-800 mb-1">100% Secure Payments</h4>
            <p className="text-xs text-slate-500">Payments secured with Razorpay: UPI, Cards & Netbanking</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 md:px-6">
        {/* Brand Information */}
        <div className="space-y-4">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 bg-clip-text text-transparent">
              APSARA
            </span>
          </Link>
          <p className="text-xs leading-relaxed text-slate-500">
            Apsara is India's premium curated online shopping destination. Handpicking the finest silk sarees, smart appliances, organic beauty care, and bestsellers, we deliver elegance to your doorstep.
          </p>
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest mb-4">Shop Categories</h3>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link href="/search?category=Mobiles%20%26%20Electronics" className="text-slate-600 hover:text-pink-600 hover:underline transition">
                Mobiles & Electronics
              </Link>
            </li>
            <li>
              <Link href="/search?category=Fashion%20%26%20Apparel" className="text-slate-600 hover:text-pink-600 hover:underline transition">
                Fashion & Apparel
              </Link>
            </li>
            <li>
              <Link href="/search?category=Home%20%26%20Living" className="text-slate-600 hover:text-pink-600 hover:underline transition">
                Home & Living
              </Link>
            </li>
            <li>
              <Link href="/search?category=Beauty%20%26%20Personal%20Care" className="text-slate-600 hover:text-pink-600 hover:underline transition">
                Beauty & Personal Care
              </Link>
            </li>
            <li>
              <Link href="/search?category=Books%20%26%20Stationery" className="text-slate-600 hover:text-pink-600 hover:underline transition">
                Books & Stationery
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Help */}
        <div>
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest mb-4">Customer Care</h3>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link href="/order/history" className="text-slate-600 hover:text-pink-600 hover:underline transition">
                Track Your Order
              </Link>
            </li>
            <li>
              <Link href="/" className="text-slate-600 hover:text-pink-600 hover:underline transition">
                Shipping & Rates
              </Link>
            </li>
            <li>
              <Link href="/" className="text-slate-600 hover:text-pink-600 hover:underline transition">
                Returns & Refunds
              </Link>
            </li>
            <li>
              <Link href="/" className="text-slate-600 hover:text-pink-600 hover:underline transition">
                FAQ Help Center
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-3.5 text-xs">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest mb-4">Get in Touch</h3>
          <div className="flex items-start space-x-2.5">
            <MapPin className="h-4.5 w-4.5 text-pink-600 shrink-0" />
            <span className="text-slate-600">Apsara Towers, BKC, Bandra East, Mumbai, Maharashtra 400051</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <Phone className="h-4.5 w-4.5 text-pink-600 shrink-0" />
            <span className="text-slate-600">1800-APSARA-IND (Toll Free)</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <Mail className="h-4.5 w-4.5 text-pink-600 shrink-0" />
            <span className="text-slate-600">support@apsara.in</span>
          </div>
        </div>
      </div>

      {/* Payment Badges & Bottom bar */}
      <div className="bg-slate-100 py-6 border-t border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Apsara Retail India Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="font-semibold text-slate-700">Accepted Payments:</span>
            <div className="flex space-x-2.5 text-slate-500 font-bold text-[10px]">
              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 shadow-xs">UPI</span>
              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 shadow-xs">RuPay</span>
              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 shadow-xs">CARDS</span>
              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 shadow-xs">NET BANKING</span>
              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 shadow-xs">COD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
