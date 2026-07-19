'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/components/ProductCard';
import { 
  MapPin, 
  CreditCard, 
  Truck, 
  ShoppingBag, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, cart, products, refreshUser } = useApp();

  // Redirect if cart is empty or user is not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/checkout');
    } else if (cart.length === 0) {
      router.push('/cart');
    }
  }, [user, cart, router]);

  // Shipping Address state
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');

  // Form states
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('UPI');
  const [formError, setFormError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Simulation Modal state
  const [showSimModal, setShowSimModal] = useState(false);
  const [simOrderId, setSimOrderId] = useState('');
  const [simOrderAmount, setSimOrderAmount] = useState(0);

  // Fetch coupon details from session storage
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountVal, setCouponDiscountVal] = useState(0);

  useEffect(() => {
    const code = sessionStorage.getItem('apsara_checkout_coupon');
    const discount = sessionStorage.getItem('apsara_checkout_discount');
    if (code) setCouponCode(code);
    if (discount) setCouponDiscountVal(Number(discount));
  }, []);

  const cartItems = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product !== undefined);

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.product ? item.product.price * item.quantity : 0);
  }, 0);

  const deliveryCharge = subtotal > 499 ? 0 : 50;
  const totalAmount = subtotal + deliveryCharge - couponDiscountVal;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Shipping Validations
    if (!fullName || !phone || !street || !city || !state || !pinCode) {
      setFormError('Please fill in all shipping details.');
      return;
    }
    if (phone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (pinCode.length < 6) {
      setFormError('Please enter a valid 6-digit PIN code.');
      return;
    }

    setPlacingOrder(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.productId,
            name: item.product!.name,
            price: item.product!.price,
            image: item.product!.image,
            quantity: item.quantity,
          })),
          shippingAddress: { fullName, phone, street, city, state, pinCode },
          paymentMethod,
          totalPrice: totalAmount,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setFormError(data.message || 'Checkout failed');
        setPlacingOrder(false);
        return;
      }

      const placedOrder = data.order;
      const razorpayOrderId = data.razorpayOrderId;

      if (paymentMethod === 'COD') {
        // COD order creates and completes immediately
        sessionStorage.removeItem('apsara_checkout_coupon');
        sessionStorage.removeItem('apsara_checkout_discount');
        await refreshUser();
        router.push(`/order/${placedOrder.id}?success=true`);
      } else {
        // Online Payment - Check if simulated or real keys
        if (razorpayOrderId.startsWith('rzp_order_sim_')) {
          // Open Simulated Checkout Modal
          setSimOrderId(placedOrder.id);
          setSimOrderAmount(totalAmount);
          setShowSimModal(true);
        } else {
          // Real Razorpay Integration
          loadRazorpayCheckout(data.keyId, razorpayOrderId, placedOrder.id);
        }
      }
    } catch (err) {
      console.error(err);
      setFormError('An error occurred. Please try again.');
      setPlacingOrder(false);
    }
  };

  const loadRazorpayCheckout = (keyId: string, rzpOrderId: string, orderId: string) => {
    // Inject Razorpay checkout.js script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      const options = {
        key: keyId,
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        name: 'Apsara India',
        description: 'Secure Premium Checkout',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100', // Saree logo representation
        order_id: rzpOrderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              sessionStorage.removeItem('apsara_checkout_coupon');
              sessionStorage.removeItem('apsara_checkout_discount');
              await refreshUser();
              router.push(`/order/${orderId}?success=true`);
            } else {
              setFormError(verifyData.message || 'Payment signature verification failed.');
              setPlacingOrder(false);
            }
          } catch (err) {
            console.error('Error verifying payment:', err);
            setFormError('Error verifying transaction.');
            setPlacingOrder(false);
          }
        },
        prefill: {
          name: fullName,
          contact: phone,
          email: user?.email,
        },
        theme: {
          color: '#0f172a', // Slate 900 matching header
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setFormError(`Payment Failed: ${resp.error.description}`);
        setPlacingOrder(false);
      });
      rzp.open();
    };
    script.onerror = () => {
      setFormError('Failed to load payment gateway checkout client.');
      setPlacingOrder(false);
    };
    document.body.appendChild(script);
  };

  const handleSimulatedPaymentSuccess = async () => {
    setShowSimModal(false);
    try {
      const verifyRes = await fetch('/api/checkout/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: simOrderId,
          razorpay_order_id: `rzp_order_sim_${simOrderId}`,
          razorpay_payment_id: `pay_sim_${Math.random().toString(36).substr(2, 9)}`,
          razorpay_signature: 'simulated_signature_hash_1234567890',
        }),
      });
      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        sessionStorage.removeItem('apsara_checkout_coupon');
        sessionStorage.removeItem('apsara_checkout_discount');
        await refreshUser();
        router.push(`/order/${simOrderId}?success=true`);
      } else {
        setFormError(verifyData.message || 'Simulated payment failed.');
        setPlacingOrder(false);
      }
    } catch (err) {
      console.error(err);
      setFormError('Error confirming simulated transaction.');
      setPlacingOrder(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 py-8 md:px-6">
        {/* Back Link */}
        <Link href="/cart" className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-6 transition">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Cart
        </Link>

        <h1 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-amber-500" />
          <span>Secure Checkout</span>
        </h1>

        {formError && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-2.5 text-rose-700 text-xs font-semibold mb-6">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Address + Payment */}
          <div className="lg:col-span-8 space-y-6">
            {/* Address Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-black text-slate-950 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <MapPin className="h-4.5 w-4.5 text-amber-500" /> Shipping Destination Address
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Mobile Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Street Address</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Flat, House no., Building, Company, Apartment, Sector"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai, Pune..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Maharashtra..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">PIN Code</label>
                  <input
                    type="text"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="6 digits"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-black text-slate-950 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-amber-500" /> Payment Selection
              </h3>

              <div className="space-y-3">
                <label className={`flex items-start gap-3 border p-4 rounded-xl cursor-pointer transition ${paymentMethod === 'UPI' ? 'border-amber-400 bg-amber-50/10' : 'border-slate-200'}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="mt-1 h-4 w-4 border-slate-300 text-amber-500 focus:ring-amber-400 accent-amber-500"
                  />
                  <div className="text-left text-xs leading-tight">
                    <p className="font-extrabold text-slate-900 mb-0.5">UPI / Net Banking / Card (Razorpay)</p>
                    <p className="text-slate-400 font-semibold">Pay securely using Google Pay, PhonePe, Paytm, RuPay, or Credit/Debit Cards.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 border p-4 rounded-xl cursor-pointer transition ${paymentMethod === 'COD' ? 'border-amber-400 bg-amber-50/10' : 'border-slate-200'}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-1 h-4 w-4 border-slate-300 text-amber-500 focus:ring-amber-400 accent-amber-500"
                  />
                  <div className="text-left text-xs leading-tight">
                    <p className="font-extrabold text-slate-900 mb-0.5">Cash on Delivery (COD)</p>
                    <p className="text-slate-400 font-semibold">Pay in cash or scan QR code on package receipt during home delivery.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right panel: Summary */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-black text-slate-950 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <ShoppingBag className="h-4.5 w-4.5 text-amber-500" /> Order Summary
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center text-xs font-semibold">
                    <div className="flex gap-2.5 items-center min-w-0 flex-1">
                      <img src={item.product!.image} alt="" className="h-8 w-8 object-cover rounded bg-slate-50 border shrink-0" />
                      <span className="text-slate-800 line-clamp-1 flex-1">{item.product!.name}</span>
                    </div>
                    <span className="text-slate-400 text-[10px] mx-2">x{item.quantity}</span>
                    <span className="text-slate-900 font-bold shrink-0">{formatINR(item.product!.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Fee Breakdown */}
              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs font-semibold text-slate-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-900">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className={deliveryCharge === 0 ? 'text-emerald-600' : 'text-slate-900'}>
                    {deliveryCharge === 0 ? 'FREE' : formatINR(deliveryCharge)}
                  </span>
                </div>
                {couponDiscountVal > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Coupon Discount ({couponCode})</span>
                    <span>-{formatINR(couponDiscountVal)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-baseline border-t border-slate-100 pt-4 text-xs font-bold text-slate-800">
                <span className="text-sm">Total Payable</span>
                <span className="text-lg font-black text-slate-950">{formatINR(totalAmount)}</span>
              </div>

              <button
                type="submit"
                disabled={placingOrder}
                className="w-full bg-amber-400 hover:bg-amber-500 disabled:bg-amber-100 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-950 font-extrabold py-3 px-4 rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {placingOrder ? 'Processing...' : paymentMethod === 'COD' ? 'Confirm COD Order' : 'Pay & Complete Order'}
              </button>
            </div>
          </div>

        </form>
      </main>

      {/* CUSTOM MOCK RAZORPAY CHECKOUT MODAL OVERLAY */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 text-white rounded-2xl overflow-hidden shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-950 p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-base font-extrabold tracking-wider bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                  APSARA PAY
                </span>
                <span className="text-[8px] bg-slate-800 text-amber-400 border border-amber-400/25 px-1 py-0.5 rounded uppercase font-bold tracking-widest">
                  Sandbox
                </span>
              </div>
              <div className="text-right text-xs font-black text-slate-400">
                Amount: <span className="text-white text-sm">{formatINR(simOrderAmount)}</span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="bg-amber-400/10 p-3 rounded-full w-max mx-auto border border-amber-400/20 mb-1">
                  <Sparkles className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="font-extrabold text-sm text-white">Simulated Razorpay Overlay</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Apsara detected sandbox credentials. You can test card payment simulation offline without using real monetary transfers.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={handleSimulatedPaymentSuccess}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold py-2.5 px-4 rounded-xl shadow-sm cursor-pointer transition active:scale-98"
                >
                  Simulate Successful Payment
                </button>
                <button
                  onClick={() => {
                    setShowSimModal(false);
                    setPlacingOrder(false);
                    setFormError('Simulated payment cancelled by user.');
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-extrabold py-2.5 px-4 rounded-xl cursor-pointer transition"
                >
                  Cancel / Simulate Failure
                </button>
              </div>
            </div>

            {/* Footer lock sign */}
            <div className="bg-slate-950 py-3.5 px-6 border-t border-slate-800 flex justify-center items-center space-x-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Razorpay Sandboxed Security Guaranteed</span>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
