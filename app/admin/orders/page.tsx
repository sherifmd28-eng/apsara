'use client';

import React, { useState, useEffect } from 'react';
import { formatINR } from '@/components/ProductCard';
import { 
  ClipboardList, 
  Edit, 
  X, 
  MapPin, 
  CreditCard, 
  ShoppingBag,
  AlertCircle,
  Check,
  Truck
} from 'lucide-react';
import { Order } from '@/lib/db';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Status modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [orderStatus, setOrderStatus] = useState<'Pending' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled'>('Pending');
  const [paymentStatus, setPaymentStatus] = useState<'Pending' | 'Paid' | 'Failed'>('Pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingStatus, setTrackingStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.message || 'Failed to fetch orders.');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openManageModal = (order: Order) => {
    setSelectedOrder(order);
    setOrderStatus(order.orderStatus);
    setPaymentStatus(order.paymentStatus);
    setTrackingNumber(order.trackingNumber || '');
    setTrackingStatus(order.trackingStatus || '');
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus,
          paymentStatus,
          trackingNumber,
          trackingStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(`Order ${selectedOrder.id} updated successfully.`);
        setIsModalOpen(false);
        await fetchOrders();
      } else {
        setError(data.message || 'Update failed.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during status update.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Orders</h1>
        <p className="text-xs text-slate-500 font-medium">Manage order statuses, adjust payments, and log shipping details.</p>
      </div>

      {/* Alert feeds */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2 text-rose-700 text-xs font-semibold">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2 text-emerald-700 text-xs font-semibold">
          <Check className="h-4.5 w-4.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Table view list */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-widest text-[9px] font-black">
                <th className="p-4">Order ID</th>
                <th className="p-4">Placed Date</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Order Status</th>
                <th className="p-4 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="font-semibold text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 italic">Fetching order records...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 italic">No customer orders found.</td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-900">{o.id}</td>
                    <td className="p-4">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4 font-extrabold text-slate-900">{formatINR(o.totalPrice)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        o.paymentStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200/20'
                          : 'bg-orange-50 text-orange-600 border-orange-200/20'
                      }`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        o.orderStatus === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200/20'
                          : o.orderStatus === 'Cancelled'
                          ? 'bg-rose-50 text-rose-600 border-rose-200/20'
                          : 'bg-amber-50 text-amber-600 border-amber-200/20'
                      }`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => openManageModal(o)}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                      >
                        <Edit className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MANAGE STATUS MODAL OVERLAY */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-black text-sm uppercase tracking-wide">
                Manage Order {selectedOrder.id}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleUpdateStatus} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {/* Address & Payment Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Shipping Details */}
                <div className="bg-slate-50 border p-4 rounded-xl space-y-2">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5 mb-2">
                    <MapPin className="h-4 w-4 text-slate-400" /> Shipping Destination
                  </h4>
                  <div className="text-slate-600 font-semibold leading-normal">
                    <p className="font-bold text-slate-800">{selectedOrder.shippingAddress.fullName}</p>
                    <p>{selectedOrder.shippingAddress.street}</p>
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pinCode}</p>
                    <p className="mt-1">Phone: {selectedOrder.shippingAddress.phone}</p>
                  </div>
                </div>

                {/* Items Summary list */}
                <div className="bg-slate-50 border p-4 rounded-xl space-y-2">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5 mb-2">
                    <ShoppingBag className="h-4 w-4 text-slate-400" /> Purchased Items
                  </h4>
                  <div className="space-y-1.5 max-h-24 overflow-y-auto">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-baseline font-semibold text-slate-600">
                        <span className="truncate flex-1">{item.name}</span>
                        <span className="text-slate-400 text-[10px] mx-1">x{item.quantity}</span>
                        <span className="text-slate-900 font-bold shrink-0">{formatINR(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-slate-900 text-xs">
                    <span>Total Amount:</span>
                    <span>{formatINR(selectedOrder.totalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Status Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                {/* Order status select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 block">Fulfillment Order Status *</label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold text-slate-800 cursor-pointer outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Pending">Pending (Processing)</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Payment status select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 block">Payment Status *</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold text-slate-800 cursor-pointer outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              {/* Shipment Tracking details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                {/* Carrier tracking number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 block">Carrier Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. DEL-10023901"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Current tracking checkpoint status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 block">Current Location / Status</label>
                  <input
                    type="text"
                    value={trackingStatus}
                    onChange={(e) => setTrackingStatus(e.target.value)}
                    placeholder="e.g. Arrived at Delhi Sorting Hub"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="border-t pt-5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-200 hover:bg-slate-350 text-slate-850 font-bold py-2 px-5 rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold py-2 px-6 rounded-lg text-xs shadow-sm cursor-pointer"
                >
                  {updating ? 'Updating...' : 'Save Order Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
