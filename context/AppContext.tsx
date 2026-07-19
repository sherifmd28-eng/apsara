'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '@/lib/db';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AppContextType {
  user: UserProfile | null;
  cart: CartItem[];
  wishlist: string[];
  products: Product[];
  loading: boolean;
  cartCount: number;
  wishlistCount: number;
  refreshUser: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<boolean>;
  addToCart: (productId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<boolean>;
  toggleWishlist: (productId: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setCart(data.cart || []);
        setWishlist(data.wishlist || []);
      } else {
        setUser(null);
        setCart([]);
        setWishlist([]);
      }
    } catch (err) {
      console.error('Error refreshing user status:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Error refreshing products catalog:', err);
    }
  };

  useEffect(() => {
    refreshUser();
    refreshProducts();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'An error occurred. Please try again.' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, message: 'An error occurred. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setUser(null);
        setCart([]);
        setWishlist([]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Logout error:', err);
      return false;
    }
  };

  const addToCart = async (productId: string, quantity: number) => {
    if (!user) {
      // Local storage cart for non-logged-in users can be implemented,
      // but requiring sign-in is simpler and matches the schema.
      return false;
    }
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await res.json();
      if (data.success) {
        setCart(data.cart || []);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Add to cart error:', err);
      return false;
    }
  };

  const removeFromCart = async (productId: string) => {
    return addToCart(productId, 0);
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      return false;
    }
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.success) {
        setWishlist(data.wishlist || []);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Toggle wishlist error:', err);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        cart,
        wishlist,
        products,
        loading,
        cartCount,
        wishlistCount,
        refreshUser,
        refreshProducts,
        login,
        register,
        logout,
        addToCart,
        removeFromCart,
        toggleWishlist,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
