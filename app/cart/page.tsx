'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/components/ProductCard';
import { Trash2, ShoppingCart, ArrowRight, Tag, Percent } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { user, cart, products, addToCart, removeFromCart } = useApp();
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [couponError, setCouponError] = useState('');

  // Map cart items to complete product information
  const cartItems = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      ...item,
      product,
    };
  }).filter(item => item.product !== undefined); // filter out deleted products

  // Calculate pricing totals
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.product ? item.product.price * item.quantity : 0);
  }, 0);

  const deliveryCharge = subtotal > 499 || subtotal === 0 ? 0 : 50;
  const rawDiscount = couponDiscount > 0 ? Math.round(subtotal * couponDiscount) : 0;
  const grandTotal = subtotal + deliveryCharge - rawDiscount;

  const handleQuantityChange = async (productId: string, qty: number) => {
    await addToCart(productId, qty);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    
    const code = couponCode.trim().toUpperCase();
    if (code === 'APSARA10' || code === 'WELCOME10') {
      setCouponDiscount(0.1); // 10% off
      setCouponApplied(code);
      setCouponCode('');
    } else if (code) {
      setCouponError('Invalid coupon code. Try "APSARA10"');
    }
  };

  const removeCoupon = () => {
    setCouponDiscount(0);
    setCouponApplied('');
  };

  const handleCheckout = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    // Save coupon details in session storage for access on the checkout page
    if (couponApplied) {
      sessionStorage.setItem('apsara_checkout_coupon', couponApplied);
      sessionStorage.setItem('apsara_checkout_discount', rawDiscount.toString());
    } else {
      sessionStorage.removeItem('apsara_checkout_coupon');
      sessionStorage.removeItem('apsara_checkout_discount');
    }
    router.push('/checkout');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 py-8 md:px-6">
        <h1 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-amber-500" />
          <span>Shopping Cart</span>
        </h1>

        {cartItems.length === 0 ? (
          // Empty State
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm max-w-lg mx-auto">
            <div className="bg-slate-100 p-4 rounded-full w-max mx-auto mb-4">
              <ShoppingCart className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-lg font-black text-slate-800 mb-2">Your Cart is empty</h2>
            <p className="text-xs text-slate-500 mb-6 max-w-xs mx-auto">
              Before you proceed to checkout, you must add some premium items to your shopping cart.
            </p>
            <Link
              href="/search"
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-2.5 px-6 rounded-lg text-xs transition inline-block cursor-pointer shadow-sm"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          // Cart list + Pricing panel
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item) => {
                const prod = item.product!;
                return (
                  <div 
                    key={item.productId} 
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex gap-4 items-center"
                  >
                    {/* Image */}
                    <Link href={`/product/${prod.id}`} className="h-20 w-20 shrink-0 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                      <img src={prod.image} alt={prod.name} className="h-full w-full object-cover object-center" />
                    </Link>

                    {/* Meta */}
                    <div className="flex-grow min-w-0">
                      <Link href={`/product/${prod.id}`} className="font-bold text-xs md:text-sm text-slate-800 hover:text-amber-600 line-clamp-1 transition mb-1">
                        {prod.name}
                      </Link>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-2">{prod.category}</span>
                      
                      <div className="flex items-center space-x-4">
                        {/* Qty Dropdown */}
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] text-slate-400 font-bold">Qty:</span>
                          <select
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.productId, Number(e.target.value))}
                            className="bg-slate-50 border border-slate-200 rounded py-0.5 px-1.5 text-xs font-bold text-slate-800 cursor-pointer outline-none focus:ring-1 focus:ring-amber-500"
                          >
                            {[...Array(Math.min(10, prod.stock))].map((_, i) => (
                              <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                          </select>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-0.5 cursor-pointer transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Price calculation */}
                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-sm block text-slate-900">{formatINR(prod.price * item.quantity)}</span>
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-slate-400 font-semibold">{formatINR(prod.price)} / unit</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Details Sidebar */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="font-black text-slate-950 text-sm border-b border-slate-100 pb-3">Price Details</h3>
                
                <div className="space-y-2.5 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span>Price ({cartItems.length} items)</span>
                    <span className="text-slate-900">{formatINR(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className={deliveryCharge === 0 ? 'text-emerald-600' : 'text-slate-900'}>
                      {deliveryCharge === 0 ? 'FREE' : formatINR(deliveryCharge)}
                    </span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span className="flex items-center gap-1">
                        <Percent className="h-3 w-3" /> Coupon Discount ({couponApplied})
                      </span>
                      <span>-{formatINR(rawDiscount)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-baseline border-t border-slate-100 pt-4 text-xs font-bold text-slate-800">
                  <span className="text-sm">Total Amount</span>
                  <span className="text-lg font-black text-slate-950">{formatINR(grandTotal)}</span>
                </div>

                {/* Free Delivery Threshold */}
                {subtotal <= 499 && (
                  <p className="text-[10px] text-orange-600 font-bold bg-orange-50 border border-orange-200/50 p-2 rounded-lg text-center">
                    Add ₹{499 - subtotal} more to qualify for FREE Delivery!
                  </p>
                )}

                {/* Proceed Checkout */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-98"
                >
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Coupon Code Applying Form */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center space-x-1.5 font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">
                  <Tag className="h-4 w-4 text-amber-500" />
                  <span>Apply Coupon Code</span>
                </div>

                {couponApplied ? (
                  <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-3 flex justify-between items-center text-xs font-bold">
                    <span className="text-emerald-700">Applied: {couponApplied}</span>
                    <button onClick={removeCoupon} className="text-[10px] text-rose-600 hover:underline">
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. APSARA10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-4 rounded-lg text-xs shadow cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponError && <p className="text-[10px] text-rose-600 font-bold mt-2">{couponError}</p>}
                
                <p className="text-[10px] text-slate-400 font-semibold mt-2.5">
                  * Use code <strong className="text-amber-600">APSARA10</strong> to get 10% off.
                </p>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
