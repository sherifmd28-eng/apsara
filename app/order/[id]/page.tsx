'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/components/ProductCard';
import { 
  Check, 
  Package, 
  Truck, 
  MapPin, 
  CreditCard, 
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { Order } from '@/lib/db';

export default function OrderTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useApp();
  
  const orderId = params.id as string;
  const isNewOrder = searchParams.get('success') === 'true';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.message || 'Failed to load order.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchOrderDetails();
  }, [orderId, user, router]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-sm font-bold text-slate-500 animate-pulse">Loading order details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex-grow mx-auto max-w-md flex flex-col justify-center items-center p-6 text-center">
          <div className="bg-rose-50 text-rose-600 p-3 rounded-full mb-3">
            <AlertIcon className="h-6 w-6" />
          </div>
          <h2 className="text-base font-black text-slate-800 mb-1">Failed to load order</h2>
          <p className="text-xs text-slate-500 mb-4">{error || 'Order not found.'}</p>
          <Link href="/order/history" className="bg-slate-900 text-white font-bold text-xs py-2 px-4 rounded-lg shadow">
            Go to Your Orders
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Determine timeline steps
  const orderStatus = order.orderStatus;
  const statusSteps = [
    { label: 'Order Placed', desc: 'Your order has been placed and confirmed.', key: 'Pending', date: order.createdAt },
    { label: 'Shipped', desc: order.trackingNumber ? `Package shipped. Carrier tracking: ${order.trackingNumber}` : 'Package has left fulfillment center.', key: 'Shipped', date: '' },
    { label: 'Out for Delivery', desc: 'Package is with delivery agent near you.', key: 'Out for Delivery', date: '' },
    { label: 'Delivered', desc: 'Package was successfully delivered.', key: 'Delivered', date: '' }
  ];

  const getStepIndex = (status: string) => {
    if (status === 'Pending') return 0;
    if (status === 'Shipped') return 1;
    if (status === 'Out for Delivery') return 2;
    if (status === 'Delivered') return 3;
    return 0;
  };

  const activeStepIdx = getStepIndex(orderStatus);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow mx-auto max-w-4xl w-full px-4 py-8 md:px-6">
        {/* Back Link */}
        <Link href="/order/history" className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-6 transition">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Your Orders
        </Link>

        {/* Celebration Banner for New Orders */}
        {isNewOrder && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-white mb-8 shadow-md relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="absolute inset-0 bg-cover bg-center opacity-10 bg-[url('https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600')]"></div>
            <div className="relative z-10 space-y-2">
              <div className="bg-amber-500/20 border border-amber-400/30 p-2.5 rounded-full w-max mx-auto mb-2">
                <Sparkles className="h-6 w-6 text-amber-400" />
              </div>
              <h2 className="text-xl md:text-2xl font-black">Order Placed Successfully! 🎉</h2>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Thank you for shopping with Apsara. We have received your order. You can track its live delivery status below.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Side: Order Status Timeline */}
          <div className="md:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ID: {order.id}</span>
                <h3 className="font-black text-slate-950 text-sm">Delivery Status Timeline</h3>
              </div>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                orderStatus === 'Delivered' 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50' 
                  : 'bg-amber-50 text-amber-600 border-amber-200/50'
              }`}>
                {orderStatus}
              </span>
            </div>

            {/* Vertical Progress Tracker */}
            <div className="relative pl-6 space-y-8 py-2">
              {/* Vertical Connecting Line */}
              <div className="absolute left-9.5 top-5 bottom-5 w-0.5 bg-slate-200"></div>

              {statusSteps.map((step, index) => {
                const isCompleted = index <= activeStepIdx;
                const isActive = index === activeStepIdx;

                return (
                  <div key={index} className="relative flex gap-4">
                    {/* Circle Icon Indicator */}
                    <div className={`absolute -left-9.5 top-0.5 rounded-full h-7 w-7 flex items-center justify-center shadow-sm border transition z-10 ${
                      isCompleted 
                        ? 'bg-emerald-600 border-emerald-500 text-white' 
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-4.5 w-4.5 stroke-[2.5]" />
                      ) : (
                        <span className="text-xs font-black">{index + 1}</span>
                      )}
                    </div>

                    {/* Meta details */}
                    <div className="flex-1 text-xs">
                      <h4 className={`font-black text-sm mb-1 ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.label}
                      </h4>
                      <p className="text-slate-500 leading-normal mb-1.5 font-medium">{step.desc}</p>
                      {step.date && (
                        <span className="text-[10px] text-slate-400 font-bold">
                          {new Date(step.date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Order Summary & Info */}
          <div className="md:col-span-4 space-y-6">
            {/* Address & Payment Info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-xs font-semibold">
              <div>
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" /> Shipping Destination
                </h4>
                <div className="text-slate-600 pl-5 leading-normal">
                  <p className="font-extrabold text-slate-800 mb-0.5">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pinCode}</p>
                  <p className="mt-1">Phone: {order.shippingAddress.phone}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-slate-400" /> Payment Details
                </h4>
                <div className="text-slate-600 pl-5 space-y-1">
                  <p>Method: <span className="font-bold text-slate-800">{order.paymentMethod}</span></p>
                  <p>Status: <span className={`font-bold ${order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-orange-600'}`}>{order.paymentStatus}</span></p>
                  {order.paymentId && <p className="text-[10px] text-slate-400 truncate">Transaction ID: {order.paymentId}</p>}
                </div>
              </div>
            </div>

            {/* Items Summary list */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <ShoppingBag className="h-4 w-4 text-slate-400" /> Purchased Items
              </h4>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs font-semibold">
                    <div className="flex gap-2 items-center min-w-0 flex-1">
                      <img src={item.image} alt="" className="h-8 w-8 object-cover rounded bg-slate-50 border shrink-0" />
                      <span className="text-slate-800 line-clamp-1 flex-1">{item.name}</span>
                    </div>
                    <span className="text-slate-400 text-[10px] mx-1.5 shrink-0">x{item.quantity}</span>
                    <span className="text-slate-900 font-bold shrink-0">{formatINR(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-4 flex justify-between items-baseline text-xs font-bold">
                <span>Grand Total</span>
                <span className="text-base text-slate-950 font-black">{formatINR(order.totalPrice)}</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

function AlertIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
