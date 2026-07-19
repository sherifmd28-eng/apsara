'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  ShieldCheck, 
  User, 
  Check, 
  AlertCircle 
} from 'lucide-react';

interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        setError(data.message || 'Failed to retrieve users.');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to user API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (targetUser: SafeUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    
    // Safety check feedback
    if (targetUser.id === 'usr-admin') {
      setError('Security block: Primary Admin role cannot be modified.');
      return;
    }

    setUpdatingId(targetUser.id);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(`Successfully updated ${targetUser.name}'s role to ${newRole}.`);
        await fetchUsers();
      } else {
        setError(data.message || 'Failed to update user role.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during updating.');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Accounts</h1>
        <p className="text-xs text-slate-500 font-medium">Manage user registrations and assign administrative console permissions.</p>
      </div>

      {/* Alerts */}
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

      {/* Users table list */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase tracking-widest text-[9px] font-black">
                <th className="p-4">Customer Name</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">System Role</th>
                <th className="p-4">Registration Date</th>
                <th className="p-4 text-center">Toggle Access</th>
              </tr>
            </thead>
            <tbody className="font-semibold text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 italic">Retrieving customer accounts...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 italic">No registered users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    {/* User Profile Cell */}
                    <td className="p-4 flex items-center gap-3">
                      <div className="bg-slate-100 p-2 rounded-full text-slate-500">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block">{u.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold block">ID: {u.id}</span>
                      </div>
                    </td>
                    
                    {/* Email Cell */}
                    <td className="p-4 font-bold text-slate-800">{u.email}</td>
                    
                    {/* Role Cell */}
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        u.role === 'admin'
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-200/20'
                          : 'bg-slate-50 text-slate-600 border-slate-200/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    
                    {/* Registration Cell */}
                    <td className="p-4">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>

                    {/* Action Toggle Cell */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleRole(u)}
                        disabled={updatingId === u.id || u.id === 'usr-admin'}
                        className={`text-xs font-bold py-1 px-3.5 rounded-lg border transition ${
                          u.id === 'usr-admin'
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                            : u.role === 'admin'
                            ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100/60 active:scale-97 cursor-pointer'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 active:scale-97 cursor-pointer'
                        }`}
                      >
                        {updatingId === u.id 
                          ? 'Updating...' 
                          : u.role === 'admin' 
                          ? 'Revoke Admin' 
                          : 'Grant Admin'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
