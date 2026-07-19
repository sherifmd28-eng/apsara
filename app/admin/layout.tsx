'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ClipboardList, 
  Users as UsersIcon, 
  Home, 
  LogOut,
  ShieldCheck
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, logout } = useApp();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/admin');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p className="text-sm font-bold animate-pulse text-slate-400">Loading administrator credentials...</p>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null; // Will redirect via useEffect
  }

  // Authenticated but not admin
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white px-4 text-center">
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-full mb-4">
          <ShieldCheck className="h-10 w-10 text-rose-500 stroke-[2.5]" />
        </div>
        <h1 className="text-xl font-black tracking-tight mb-2 text-white">Access Denied: Admin Rights Required</h1>
        <p className="text-xs text-slate-400 max-w-sm mb-6 font-medium">
          You are signed in as a customer ({user.email}). The section you are trying to access requires administrator privileges.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={handleLogout}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-5 rounded-lg transition cursor-pointer"
          >
            Sign Out
          </button>
          <Link 
            href="/" 
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2 px-5 rounded-lg transition"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shrink-0">
        {/* Branding header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <div className="bg-amber-400 text-slate-950 p-1.5 rounded-lg">
            <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-wider bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              APSARA
            </h1>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">ADMIN PORTAL</span>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 p-4 space-y-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <span className="text-[10px] text-slate-500 block px-3 py-1 mb-2 font-black">Management</span>
          
          <Link 
            href="/admin" 
            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition"
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            <span>Dashboard Overview</span>
          </Link>
          
          <Link 
            href="/admin/products" 
            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            <span>Products Catalog</span>
          </Link>
          
          <Link 
            href="/admin/orders" 
            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition"
          >
            <ClipboardList className="h-4.5 w-4.5" />
            <span>Customer Orders</span>
          </Link>

          <Link 
            href="/admin/users" 
            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition"
          >
            <UsersIcon className="h-4.5 w-4.5" />
            <span>User Accounts</span>
          </Link>

          <div className="border-t border-slate-800/80 my-4 pt-4"></div>
          <span className="text-[10px] text-slate-500 block px-3 py-1 mb-2 font-black">Actions</span>
          
          <Link 
            href="/" 
            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition"
          >
            <Home className="h-4.5 w-4.5" />
            <span>Exit Storefront</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-red-950/40 hover:text-red-400 text-left transition cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Logout Account</span>
          </button>
        </nav>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
        {children}
      </main>

    </div>
  );
}
