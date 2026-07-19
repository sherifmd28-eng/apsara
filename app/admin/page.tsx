import React from 'react';
import Link from 'next/link';
import { readDatabase } from '@/lib/db';
import { formatINR } from '@/components/ProductCard';
import { 
  IndianRupee, 
  ShoppingBag, 
  ClipboardList, 
  Users as UsersIcon, 
  TrendingUp, 
  ArrowRight
} from 'lucide-react';

export const revalidate = 0; // Disable static cache for live admin metrics

export default async function AdminDashboardPage() {
  const db = readDatabase();
  const orders = db.orders || [];
  const products = db.products || [];
  const users = db.users || [];

  // Metrics calculations
  const paidOrders = orders.filter(o => o.paymentStatus === 'Paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const activeOrdersCount = orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length;
  const totalProducts = products.length;
  const totalUsers = users.length;

  // Sales by category calculations for SVG bar chart
  const categoriesSales: Record<string, number> = {
    'Mobiles & Electronics': 0,
    'Fashion & Apparel': 0,
    'Home & Living': 0,
    'Books & Stationery': 0,
    'Beauty & Personal Care': 0
  };

  orders.forEach(o => {
    if (o.paymentStatus === 'Paid' || o.paymentMethod === 'COD') {
      o.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        if (prod && prod.category in categoriesSales) {
          categoriesSales[prod.category] += item.price * item.quantity;
        }
      });
    }
  });

  const chartData = Object.entries(categoriesSales).map(([name, val]) => ({
    name: name.split(' & ')[0], // short name
    val,
  }));

  const maxVal = Math.max(...chartData.map(d => d.val), 1000); // prevent division by zero

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Console Overview</h1>
        <p className="text-xs text-slate-500 font-medium">Real-time store metrics and recent customer order transactions.</p>
      </div>

      {/* Metrics Widgets Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Metric 1: Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
            <IndianRupee className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Total Revenue</span>
            <span className="text-xl font-black text-slate-900">{formatINR(totalRevenue)}</span>
          </div>
        </div>

        {/* Metric 2: Active Orders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
            <ClipboardList className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Active Orders</span>
            <span className="text-xl font-black text-slate-900">{activeOrdersCount}</span>
          </div>
        </div>

        {/* Metric 3: Products */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
            <ShoppingBag className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Total Products</span>
            <span className="text-xl font-black text-slate-900">{totalProducts}</span>
          </div>
        </div>

        {/* Metric 4: Users */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-rose-50 text-rose-600 p-3 rounded-xl">
            <UsersIcon className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Customers</span>
            <span className="text-xl font-black text-slate-900">{totalUsers}</span>
          </div>
        </div>

      </div>

      {/* Grid: Charts + Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SVG Sales Category Distribution Chart */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs uppercase tracking-wider border-b pb-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span>Category Sales Distribution</span>
          </div>

          <div className="flex-1 flex flex-col justify-between py-2 space-y-3.5 text-xs font-semibold">
            {chartData.map(item => {
              const percentage = Math.round((item.val / maxVal) * 100);
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-[11px]">
                    <span className="text-slate-700 font-bold">{item.name}</span>
                    <span className="text-slate-900 font-extrabold">{formatINR(item.val)}</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.max(3, percentage)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs uppercase tracking-wider">
              <ClipboardList className="h-4 w-4 text-amber-500" />
              <span>Recent Transactions</span>
            </div>
            <Link 
              href="/admin/orders" 
              className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-0.5 group transition"
            >
              All Orders <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6">No order records found in the database.</p>
          ) : (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-widest text-[9px] font-black">
                    <th className="py-2.5">Order ID</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Total</th>
                    <th className="py-2.5">Payment</th>
                    <th className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="font-semibold text-slate-700">
                  {recentOrders.map(o => (
                    <tr key={o.id} className="border-b border-slate-100/50 hover:bg-slate-50/50">
                      <td className="py-3 font-bold text-slate-900">{o.id}</td>
                      <td className="py-3">
                        {new Date(o.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-3 font-extrabold text-slate-900">{formatINR(o.totalPrice)}</td>
                      <td className="py-3">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          o.paymentStatus === 'Paid' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200/20' 
                            : 'bg-orange-50 text-orange-600 border-orange-200/20'
                        }`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          o.orderStatus === 'Delivered' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200/20' 
                            : 'bg-amber-50 text-amber-600 border-amber-200/20'
                        }`}>
                          {o.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
