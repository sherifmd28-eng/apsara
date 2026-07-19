'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/components/ProductCard';
import { ShoppingBag, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { Order } from '@/lib/db';

export default function OrderHistoryPage() {
  const router = useRouter();
  const { user } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.message || 'Failed to fetch order history.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/order/history');
      return;
    }
    fetchOrders();
  }, [user, router]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow mx-auto max-w-4xl w-full px-4 py-8 md:px-6">
        <h1 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-amber-500" />
          <span>Your Orders</span>
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white border border-slate-200 rounded-2xl h-44 shadow-sm"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-2.5 text-rose-700 text-xs font-semibold">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : orders.length === 0 ? (
          // Empty State
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm max-w-lg mx-auto">
            <div className="bg-slate-100 p-4 rounded-full w-max mx-auto mb-4">
              <ShoppingBag className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-lg font-black text-slate-800 mb-2">No orders placed yet</h2>
            <p className="text-xs text-slate-500 mb-6 max-w-xs mx-auto">
              You haven't purchased anything yet. Browse our premium Indian collection to make your first purchase.
            </p>
            <Link
              href="/search"
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-2.5 px-6 rounded-lg text-xs transition inline-block cursor-pointer shadow-sm"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          // Orders list
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-300"
              >
                {/* Order Card Top Bar */}
                <div className="bg-slate-50/80 border-b border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-500">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold mb-0.5">Order Placed</span>
                    <span className="text-slate-800">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold mb-0.5">Total Amount</span>
                    <span className="text-slate-800 font-bold">{formatINR(order.totalPrice)}</span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold mb-0.5">Payment Method</span>
                    <span className="text-slate-800">{order.paymentMethod}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold mb-0.5">Order ID</span>
                    <span className="text-slate-800 font-bold block">{order.id}</span>
                  </div>
                </div>

                {/* Order Items & status */}
                <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-slate-100">
                  <div className="space-y-4 flex-grow w-full">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center">
                        <Link href={`/product/${item.productId}`} className="h-14 w-14 shrink-0 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover object-center" />
                        </Link>
                        <div className="text-xs font-semibold min-w-0 flex-grow">
                          <Link href={`/product/${item.productId}`} className="font-bold text-slate-800 hover:text-amber-600 line-clamp-1 mb-0.5 transition">
                            {item.name}
                          </Link>
                          <p className="text-slate-400">Qty: {item.quantity} · Price: {formatINR(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Status & View Details button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 gap-3">
                    <div className="text-left sm:text-right text-xs">
                      <span className="text-slate-400 block font-bold mb-1 uppercase tracking-wider text-[9px]">Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                        order.orderStatus === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50'
                          : 'bg-amber-50 text-amber-600 border-amber-200/50'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    
                    <Link 
                      href={`/order/${order.id}`}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-4 rounded-lg text-xs shadow-sm flex items-center gap-1 transition shrink-0 active:scale-97 cursor-pointer"
                    >
                      Track Order <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Sub info */}
                <div className="px-5 py-3.5 bg-slate-50/40 text-[10px] text-slate-400 font-bold flex items-center space-x-1 border-t border-slate-100">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Estimated delivery in 3-5 business days. Returns available for 7 days post receipt.</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
