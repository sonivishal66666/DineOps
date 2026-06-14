"use client";
import React, { useState, useEffect } from 'react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import RBACMatrix from '../components/RBACMatrix';
import PortalAuthGuard from '../components/PortalAuthGuard';
import { Users, ShieldCheck, UserCheck, RefreshCw, Cpu, Award, Shield, ChevronDown, ShieldAlert, Star, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function SuperAdminPortal() {
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [showRoleSelector, setShowRoleSelector] = useState<boolean>(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState<boolean>(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);

  // Coupons
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState<boolean>(false);
  const [couponCodeInput, setCouponCodeInput] = useState<string>('');
  const [couponTypeInput, setCouponTypeInput] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [couponValueInput, setCouponValueInput] = useState<number>(10);
  const [couponMinOrderInput, setCouponMinOrderInput] = useState<number>(0);
  const [couponMaxDiscountInput, setCouponMaxDiscountInput] = useState<number>(100);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState<string>('');
  const [couponErrorMsg, setCouponErrorMsg] = useState<string>('');

  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const res = await fetch(`${API_BASE}/ops/coupons`);
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      }
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponSuccessMsg('');
    setCouponErrorMsg('');
    if (!couponCodeInput.trim()) {
      setCouponErrorMsg('Coupon code is required.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/ops/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCodeInput.toUpperCase().trim(),
          discountType: couponTypeInput,
          value: couponValueInput,
          minOrderValue: couponMinOrderInput,
          maxDiscount: couponTypeInput === 'PERCENTAGE' ? couponMaxDiscountInput : null,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setCoupons(prev => [...prev, created]);
        setCouponSuccessMsg(`Coupon ${couponCodeInput.toUpperCase()} created!`);
        setTimeout(() => setCouponSuccessMsg(''), 3000);
        setCouponCodeInput('');
        setCouponValueInput(10);
        setCouponMinOrderInput(0);
        setCouponMaxDiscountInput(100);
      } else {
        setCouponErrorMsg('Failed to create coupon.');
      }
    } catch (err) {
      // Offline fallback
      const mockCreated = {
        id: `cp-${Date.now()}`,
        code: couponCodeInput.toUpperCase().trim(),
        discountType: couponTypeInput,
        value: couponValueInput,
        minOrderValue: couponMinOrderInput,
        maxDiscount: couponTypeInput === 'PERCENTAGE' ? couponMaxDiscountInput : null,
        active: true,
      };
      setCoupons(prev => [...prev, mockCreated]);
      setCouponSuccessMsg(`[Local] Coupon ${couponCodeInput.toUpperCase()} created!`);
      setTimeout(() => setCouponSuccessMsg(''), 3000);
      setCouponCodeInput('');
    }
  };

  const handleToggleCoupon = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/ops/coupons/${id}/toggle`, {
        method: 'PUT'
      });
      if (res.ok) {
        const updated = await res.json();
        setCoupons(prev => prev.map(c => c.id === id ? updated : c));
      }
    } catch (err) {
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/ops/coupons/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCoupons(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      setCoupons(prev => prev.filter(c => c.id !== id));
    }
  };

  const rolesList = [
    { id: 'CUSTOMER', name: 'Customer Portal', url: '/' },
    { id: 'CASHIER', name: 'POS Terminal (Cashier)', url: '/pos' },
    { id: 'CHEF', name: 'Kitchen Display (KDS)', url: '/kds' },
    { id: 'DELIVERY_STAFF', name: 'Delivery Dashboard', url: '/delivery' },
    { id: 'ADMIN', name: 'Admin Operations', url: '/admin' },
    { id: 'SUPER_ADMIN', name: 'Super Admin HQ', url: '/super-admin' },
  ];

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        setIsBackendConnected(true);
      } else {
        throw new Error();
      }
    } catch (err) {
      setIsBackendConnected(false);
      // Fallback mock orders
      setOrders([
        { id: 'ord-101', total: 769 },
        { id: 'ord-102', total: 1052 }
      ]);
    }
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch(`${API_BASE}/auth/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        throw new Error();
      }
    } catch (err) {
      // Fallback mock users (matches mock-db.service.ts)
      setUsers([
        { id: 'user-superadmin', email: 'admin@admin', name: 'Vishal Soni', role: 'SUPER_ADMIN', createdAt: new Date() },
        { id: 'user-admin', email: 'admin@dineops.com', name: 'Rajesh Sharma', role: 'ADMIN', createdAt: new Date() },
        { id: 'user-chef', email: 'chef@dineops.com', name: 'Chef Marco D\'Souza', role: 'CHEF', createdAt: new Date() },
        { id: 'user-staff', email: 'staff@dineops.com', name: 'Amit Verma', role: 'KITCHEN_STAFF', createdAt: new Date() },
        { id: 'user-cashier', email: 'cashier@dineops.com', name: 'Sneha Gupta', role: 'CASHIER', createdAt: new Date() },
        { id: 'user-delivery', email: 'delivery@dineops.com', name: 'Rahul Yadav', role: 'DELIVERY_STAFF', createdAt: new Date() },
        { id: 'user-customer', email: 'customer@dineops.com', name: 'Vishaal Kumar', role: 'CUSTOMER', createdAt: new Date() },
        { id: 'user-soni', email: 'vishal.soni@gmail.com', name: 'Vishal Soni', role: 'CUSTOMER', createdAt: new Date() },
      ]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch(`${API_BASE}/ops/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      } else {
        throw new Error();
      }
    } catch (err) {
      // Fallback mock reviews
      setReviews([
        {
          id: 'rev-demo-1',
          orderNumber: 'BH-2026-9042',
          rating: 5,
          comment: 'Amazing food! The Wagyu Sliders were absolutely delicious.',
          sentiment: 'POSITIVE',
          customerName: 'Vishaal Kumar',
          customerEmail: 'customer@dineops.com',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'rev-demo-2',
          orderNumber: 'BH-2026-9043',
          rating: 3,
          comment: 'Delivery was a bit late but the food quality was okay.',
          sentiment: 'NEUTRAL',
          customerName: 'Rahul Mehta',
          customerEmail: 'rahul@example.com',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
      ]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setSuccessMsg('');
    // Optimistic local state update
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));

    try {
      const res = await fetch(`${API_BASE}/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setSuccessMsg(`Assigned role [${newRole}] to user successfully!`);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        throw new Error();
      }
    } catch (err) {
      console.warn('API connection offline, role updated in local mock memory');
      setSuccessMsg(`[Local Memory Mode] Assigned role [${newRole}] successfully.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchUsers();
    fetchReviews();
    fetchCoupons();
    
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Compute stats
  const roleBadges: { [key: string]: string } = {
    'SUPER_ADMIN': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'ADMIN': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'CHEF': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    'KITCHEN_STAFF': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    'CASHIER': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    'DELIVERY_STAFF': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'CUSTOMER': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };

  return (
    <PortalAuthGuard allowedRoles={['SUPER_ADMIN']} portalName="Super Admin Intelligence Command">
      <div className="min-h-screen bg-[#0d0a07] text-[#f4ece1] flex flex-col">
        {/* Top Banner */}
        <div className="bg-[#14100c] px-6 py-3 border-b border-amber-500/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
            <div>
              <h1 className="text-sm font-bold text-amber-200 uppercase tracking-widest font-mono">Super Admin Intelligence Command</h1>
              <p className="text-[9px] text-slate-500 font-mono">STANDALONE HQ • {isBackendConnected ? 'API SYNCED' : 'OFFLINE FALLBACK'}</p>
            </div>
          </div>

          {/* Active Mode Role Switcher */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-xs text-amber-500/60 font-mono uppercase mr-2 font-semibold">Active Mode:</span>
            <div className="relative">
              <button
                onClick={() => setShowRoleSelector(!showRoleSelector)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/20 text-xs font-semibold glass-card text-amber-200 hover:border-amber-500/40 transition-all bg-[#0d0a07]"
              >
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span>Super Admin HQ</span>
                <ChevronDown className="w-3 h-3 text-amber-500" />
              </button>
              
              {showRoleSelector && (
                <div className="absolute top-full right-0 mt-2 w-64 glass-panel rounded-xl shadow-2xl p-2 flex flex-col gap-1 border border-amber-500/30 bg-[#0d0a07] z-50">
                  <div className="text-[10px] text-amber-500/50 uppercase tracking-widest px-2 py-1 font-semibold font-mono border-b border-amber-500/5 pb-1 mb-1">
                    Switch Role Context
                  </div>
                  {rolesList.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        window.location.href = r.url;
                        setShowRoleSelector(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                        r.id === 'SUPER_ADMIN'
                          ? 'bg-amber-500/30 text-amber-200 border-amber-500/50' 
                          : 'hover:bg-amber-500/10 text-slate-300 border-transparent'
                      }`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={fetchUsers}
              className="p-1.5 hover:bg-amber-500/10 rounded-lg text-amber-400 transition-all border border-amber-500/10"
              title="Refresh User Registry"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <div className="text-[10px] text-amber-400 font-mono uppercase bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
              ● Root Admin Active
            </div>
            <button
              onClick={() => setShowSignOutConfirm(true)}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase transition-colors px-2.5 py-1 rounded border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/5 cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        <main className="flex-1 p-4 md:p-6 flex flex-col gap-8">
          <AnalyticsDashboard orders={orders} lang="EN" />
          
          {/* USER REGISTRY SECTION */}
          <div className="max-w-7xl mx-auto w-full px-4 md:px-8">
            <div className="glass-panel p-6 rounded-3xl border border-amber-500/15 flex flex-col gap-5 bg-[#0a0806]">
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-amber-500/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-200 font-mono uppercase tracking-wider">Enterprise User Registry</h3>
                    <p className="text-[10px] text-slate-500">Configure access role clearances for registered staff and clients</p>
                  </div>
                </div>
                {successMsg && (
                  <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold rounded-xl font-mono">
                    {successMsg}
                  </div>
                )}
              </div>

              {isLoadingUsers ? (
                <div className="py-20 text-center flex flex-col items-center gap-2 text-slate-400">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin"></div>
                  <span className="text-xs font-mono">Querying system accounts...</span>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-amber-500/5">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-amber-950/20 border-b border-amber-500/10 font-mono text-[9px] text-amber-500 uppercase tracking-widest">
                        <th className="p-3.5">User Profile Name</th>
                        <th className="p-3.5">System Email Address</th>
                        <th className="p-3.5 text-center">Active Access Level</th>
                        <th className="p-3.5 text-center">Change Role Authorization</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-500/5 font-sans">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-amber-500/[0.02] transition-colors">
                          <td className="p-3.5 font-bold text-amber-100 flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-amber-500/5 border border-amber-500/15 text-amber-400 text-[10px] flex items-center justify-center font-mono">
                              {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                            <span>{user.name}</span>
                          </td>
                          <td className="p-3.5 text-slate-400 font-mono">{user.email}</td>
                          <td className="p-3.5 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold border uppercase font-mono ${roleBadges[user.role] || 'bg-slate-500/10 text-slate-300'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="bg-[#16120e] border border-amber-500/10 text-amber-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500/40 font-mono hover:bg-amber-500/5 cursor-pointer transition-all min-w-[180px]"
                            >
                              <option value="CUSTOMER" style={{ color: '#1a130f', backgroundColor: '#fefaf6' }}>Customer (Client)</option>
                              <option value="CASHIER" style={{ color: '#1a130f', backgroundColor: '#fefaf6' }}>Cashier (POS)</option>
                              <option value="CHEF" style={{ color: '#1a130f', backgroundColor: '#fefaf6' }}>Specialty Chef (KDS)</option>
                              <option value="KITCHEN_STAFF" style={{ color: '#1a130f', backgroundColor: '#fefaf6' }}>Kitchen Staff (KDS)</option>
                              <option value="DELIVERY_STAFF" style={{ color: '#1a130f', backgroundColor: '#fefaf6' }}>Delivery Courier</option>
                              <option value="ADMIN" style={{ color: '#1a130f', backgroundColor: '#fefaf6' }}>Manager (Inventory)</option>
                              <option value="SUPER_ADMIN" style={{ color: '#1a130f', backgroundColor: '#fefaf6' }}>Root Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="max-w-7xl mx-auto w-full px-4 md:px-8">
            <RBACMatrix lang="EN" />
          </div>

          {/* CUSTOMER REVIEWS SECTION */}
          <div className="max-w-7xl mx-auto w-full px-4 md:px-8">
            <div className="glass-panel p-6 rounded-3xl border border-amber-500/15 flex flex-col gap-5 bg-[#0a0806]">
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-amber-500/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-200 font-mono uppercase tracking-wider">Gourmet Customer Reviews</h3>
                    <p className="text-[10px] text-slate-500">Confidential feedback received from diners — visible only to Super Admin</p>
                  </div>
                </div>
                <button
                  onClick={fetchReviews}
                  className="p-1.5 hover:bg-amber-500/10 rounded-lg text-amber-400 transition-all border border-amber-500/10 flex items-center gap-1.5 px-3 text-xs font-mono"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>

              {loadingReviews ? (
                <div className="py-12 text-center flex flex-col items-center gap-2 text-slate-400">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin"></div>
                  <span className="text-xs font-mono">Loading reviews...</span>
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm font-mono">
                  No customer reviews have been submitted yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="bg-[#0d0a07] border border-amber-500/10 rounded-2xl p-4 flex flex-col gap-2.5 hover:border-amber-500/20 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-amber-200">{rev.customerName}</span>
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                            <span>{rev.customerEmail}</span>
                            {rev.orderNumber && <span className="ml-2 text-amber-500/60">#{rev.orderNumber}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold border uppercase font-mono ${
                            rev.sentiment === 'POSITIVE' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : rev.sentiment === 'NEGATIVE' ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}>
                            {rev.sentiment}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                            }`}
                          />
                        ))}
                        <span className="text-[10px] text-slate-500 font-mono ml-1.5">({rev.rating}/5)</span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed italic">&ldquo;{rev.comment}&rdquo;</p>

                      <div className="text-[9px] text-slate-600 font-mono pt-1 border-t border-amber-500/5">
                        Submitted: {rev.createdAt ? new Date(rev.createdAt).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PROMO COUPONS MANAGEMENT SECTION */}
          <div className="max-w-7xl mx-auto w-full px-4 md:px-8">
            <div className="glass-panel p-6 rounded-3xl border border-amber-500/15 flex flex-col gap-5 bg-[#0a0806]">
              
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-amber-500/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-200 font-mono uppercase tracking-wider">Dynamic Promo Coupons</h3>
                    <p className="text-[10px] text-slate-500">Create, enable, or disable discount coupon codes for checkout</p>
                  </div>
                </div>
                {couponSuccessMsg && (
                  <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold rounded-xl font-mono">
                    {couponSuccessMsg}
                  </div>
                )}
                {couponErrorMsg && (
                  <div className="px-4 py-1.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-semibold rounded-xl font-mono">
                    {couponErrorMsg}
                  </div>
                )}
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Form: Create Coupon */}
                <form onSubmit={handleCreateCoupon} className="flex-1 max-w-md bg-[#0d0a07] border border-amber-500/10 rounded-2xl p-5 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-amber-200 uppercase font-mono tracking-wider border-b border-amber-500/5 pb-2">Create New Coupon</h4>
                  
                  <div>
                    <label className="text-[9px] uppercase font-mono text-slate-500 block mb-1">Coupon Code (e.g. LUXURY25)</label>
                    <input
                      type="text"
                      placeholder="LUXURY25"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      className="w-full bg-[#16120e] border border-amber-500/15 focus:border-amber-500/30 rounded-xl px-3 py-2 text-xs text-amber-100 placeholder-slate-600 focus:outline-none uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] uppercase font-mono text-slate-500 block mb-1">Discount Type</label>
                      <select
                        value={couponTypeInput}
                        onChange={(e: any) => setCouponTypeInput(e.target.value)}
                        className="w-full bg-[#16120e] border border-amber-500/15 text-amber-200 text-xs rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                      >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FIXED">Flat Cash (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-mono text-slate-500 block mb-1">Discount Value</label>
                      <input
                        type="number"
                        value={couponValueInput}
                        onChange={(e) => setCouponValueInput(Number(e.target.value))}
                        className="w-full bg-[#16120e] border border-amber-500/15 text-amber-100 text-xs rounded-xl px-3 py-2 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] uppercase font-mono text-slate-500 block mb-1">Min Order Val (₹)</label>
                      <input
                        type="number"
                        value={couponMinOrderInput}
                        onChange={(e) => setCouponMinOrderInput(Number(e.target.value))}
                        className="w-full bg-[#16120e] border border-amber-500/15 text-amber-100 text-xs rounded-xl px-3 py-2 focus:outline-none"
                      />
                    </div>
                    {couponTypeInput === 'PERCENTAGE' && (
                      <div>
                        <label className="text-[9px] uppercase font-mono text-slate-500 block mb-1">Max Cap (₹)</label>
                        <input
                          type="number"
                          value={couponMaxDiscountInput}
                          onChange={(e) => setCouponMaxDiscountInput(Number(e.target.value))}
                          className="w-full bg-[#16120e] border border-amber-500/15 text-amber-100 text-xs rounded-xl px-3 py-2 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all mt-2"
                  >
                    + Generate Coupon
                  </button>
                </form>

                {/* Right Panel: Coupons List Table */}
                <div className="flex-1 overflow-x-auto rounded-xl border border-amber-500/10">
                  {loadingCoupons ? (
                    <div className="py-20 text-center flex flex-col items-center gap-2 text-slate-400">
                      <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin"></div>
                      <span className="text-xs font-mono">Syncing coupon registry...</span>
                    </div>
                  ) : coupons.length === 0 ? (
                    <div className="py-20 text-center text-slate-500 text-xs font-mono">
                      No coupon keys have been configured yet.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-amber-950/20 border-b border-amber-500/10 font-mono text-[9px] text-amber-500 uppercase tracking-widest">
                          <th className="p-3.5">Coupon Code</th>
                          <th className="p-3.5">Type & Value</th>
                          <th className="p-3.5 font-semibold">Min Order</th>
                          <th className="p-3.5 text-center">Status</th>
                          <th className="p-3.5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-500/5 font-mono">
                        {coupons.map((cp) => (
                          <tr key={cp.id} className="hover:bg-amber-500/[0.02] transition-colors">
                            <td className="p-3.5 font-bold text-amber-200">{cp.code}</td>
                            <td className="p-3.5 text-slate-300">
                              {cp.discountType === 'PERCENTAGE' || cp.discountType === 'PERCENT'
                                ? `${cp.value}% off ${cp.maxDiscount ? `(Cap: ₹${cp.maxDiscount})` : ''}`
                                : `₹${cp.value} off`}
                            </td>
                            <td className="p-3.5 text-slate-400">₹{cp.minOrderValue}</td>
                            <td className="p-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleCoupon(cp.id)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                                  cp.active
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                                }`}
                              >
                                {cp.active ? 'ENABLED' : 'DISABLED'}
                              </button>
                            </td>
                            <td className="p-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteCoupon(cp.id)}
                                className="text-rose-400 hover:text-rose-300 font-bold hover:underline"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

            </div>
          </div>
        </main>

        {/* Sign Out Confirmation Modal */}
        <AnimatePresence>
          {showSignOutConfirm && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSignOutConfirm(false)}
                className="absolute inset-0 bg-black/85 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-sm glass-panel bg-[#0d0a07] border border-rose-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden z-10 flex flex-col items-center text-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>

                <div>
                  <h3 className="text-xs font-bold text-amber-200 tracking-widest font-mono uppercase">Terminate Clearance Session</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Are you sure you want to sign out and lock access to this terminal?
                  </p>
                </div>

                <div className="flex gap-3 w-full mt-2">
                  <button
                    onClick={() => setShowSignOutConfirm(false)}
                    className="flex-1 border border-amber-500/20 text-slate-300 hover:bg-amber-500/5 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem('currentUser');
                      localStorage.removeItem('currentRole');
                      localStorage.removeItem('authToken');
                      window.location.reload();
                    }}
                    className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </PortalAuthGuard>
  );
}
