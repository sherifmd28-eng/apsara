'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Lock, User, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-sm font-bold text-slate-500 animate-pulse">Loading secure gateway...</p>
        </div>
        <Footer />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, register, loading } = useApp();
  
  const redirect = searchParams.get('redirect') || '/';

  // Toggle tab state
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Sign In inputs
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up inputs
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  // Status message
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push(redirect);
    }
  }, [user, loading, redirect, router]);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!signInEmail || !signInPassword) {
      setFormError('Please fill in all fields.');
      return;
    }

    setSubmitLoading(true);
    const result = await login(signInEmail, signInPassword);
    setSubmitLoading(false);

    if (result.success) {
      setFormSuccess('Login successful! Redirecting...');
      router.push(redirect);
    } else {
      setFormError(result.message);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!signUpName || !signUpEmail || !signUpPassword || !signUpConfirmPassword) {
      setFormError('Please fill in all fields.');
      return;
    }

    if (signUpPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setSubmitLoading(true);
    const result = await register(signUpName, signUpEmail, signUpPassword);
    setSubmitLoading(false);

    if (result.success) {
      setFormSuccess('Account created successfully! Redirecting...');
      router.push(redirect);
    } else {
      setFormError(result.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Top Styling Banner */}
          <div className="bg-slate-900 text-white p-6 text-center space-y-1">
            <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              APSARA
            </span>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-400" /> Unlock Premium Shopping
            </p>
          </div>

          {/* Form Tabs */}
          <div className="flex border-b border-slate-200 text-xs font-bold uppercase">
            <button
              onClick={() => {
                setActiveTab('signin');
                setFormError('');
                setFormSuccess('');
              }}
              className={`flex-1 py-3 text-center border-b-2 cursor-pointer transition ${
                activeTab === 'signin'
                  ? 'border-amber-500 text-slate-900 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setFormError('');
                setFormSuccess('');
              }}
              className={`flex-1 py-3 text-center border-b-2 cursor-pointer transition ${
                activeTab === 'signup'
                  ? 'border-amber-500 text-slate-900 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="p-6 md:p-8">
            {/* Status Feedback alerts */}
            {formError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2 text-rose-700 text-xs font-semibold mb-6">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2 text-emerald-700 text-xs font-semibold mb-6">
                <CheckIcon className="h-4.5 w-4.5 shrink-0 text-emerald-600" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* TAB: Sign In Form */}
            {activeTab === 'signin' ? (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow transition cursor-pointer pt-3 active:scale-98"
                >
                  {submitLoading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>
            ) : (
              // TAB: Sign Up Form
              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Your Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      placeholder="First and last name"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Confirm Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow transition cursor-pointer pt-3 active:scale-98"
                >
                  {submitLoading ? 'Registering...' : 'Create Your Account'}
                </button>
              </form>
            )}

            {/* Test Credentials Sandbox Hint */}
            <div className="mt-8 pt-5 border-t border-slate-100 text-[10px] text-slate-400 font-semibold space-y-1 text-center bg-slate-50/60 p-3 rounded-xl border border-slate-200/50">
              <p className="text-slate-600 font-bold uppercase tracking-wider mb-1">Developer Sandbox Credentials</p>
              <p>Admin: <strong className="text-slate-600 font-extrabold">admin@apsara.in</strong> / <strong className="text-slate-600 font-extrabold">admin123</strong></p>
              <p>Demo User: <strong className="text-slate-600 font-extrabold">rajesh@gmail.com</strong> / <strong className="text-slate-600 font-extrabold">user123</strong></p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
