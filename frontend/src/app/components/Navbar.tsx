"use client";

import React, { useState } from 'react';
import { Bell, User, ChevronDown, RefreshCw, Languages, Shield, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  currentRole: string;
  onChangeRole: (role: string) => void;
  notifications: any[];
  onClearNotifications: () => void;
  userPoints: number;
  userTier: string;
  cashback: number;
  lang: 'EN' | 'HI';
  onChangeLang: (lang: 'EN' | 'HI') => void;
  userName?: string;
  userEmail?: string;
  currentUserRole?: string;
  onOpenMyOrders: () => void;
  onOpenMyProfile: () => void;
  onOpenMyReservations: () => void;
}

export default function Navbar({
  currentRole,
  onChangeRole,
  notifications,
  onClearNotifications,
  userPoints,
  userTier,
  cashback,
  lang,
  onChangeLang,
  userName = 'Gourmet Guest',
  userEmail = 'customer@dineops.com',
  currentUserRole = 'CUSTOMER',
  onOpenMyOrders,
  onOpenMyProfile,
  onOpenMyReservations,
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'VK';
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length === 0) return 'VK';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const rolesList = [
    { id: 'CUSTOMER', name: 'Customer Portal', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    { id: 'CASHIER', name: 'POS Terminal (Cashier)', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    { id: 'CHEF', name: 'Kitchen Display (KDS)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    { id: 'DELIVERY_STAFF', name: 'Delivery Dashboard', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    { id: 'ADMIN', name: 'Admin Operations', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
    { id: 'SUPER_ADMIN', name: 'Super Admin HQ', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  ];

  const getTierColor = (tier: string) => {
    switch (tier.toUpperCase()) {
      case 'PLATINUM': return 'from-purple-400 to-indigo-400';
      case 'GOLD': return 'from-yellow-400 to-amber-500';
      case 'SILVER': return 'from-slate-300 to-slate-400';
      default: return 'from-amber-600 to-amber-700'; // Bronze
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0d0a07]/80 backdrop-blur-md border-b border-amber-500/20 px-6 py-3 flex items-center justify-between shadow-lg shadow-black/40">
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      <div className="flex items-center gap-3">
        <img 
          src="/dineops-logo.jpg" 
          alt="DineOps Logo" 
          className="w-9 h-9 rounded-lg object-cover border border-amber-500/30 shadow-md shadow-amber-500/10 animate-float"
        />
        <div>
          <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500 bg-clip-text text-transparent font-sans">
            DineOps
          </h1>
          <p className="text-[10px] tracking-widest uppercase text-amber-500/80 font-semibold font-mono">
            Enterprise SaaS Platform
          </p>
        </div>
      </div>

      {/* Center Logo Separator */}
      <div className="hidden lg:block w-4" />

      {/* Right controls */}
      <div className="flex items-center gap-4">


        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="p-2 rounded-xl border border-amber-500/15 bg-white/5 hover:bg-amber-500/5 relative text-slate-300 hover:text-amber-400 hover:border-amber-500/30 transition-all duration-300"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-[10px] text-white flex items-center justify-center font-bold pulse-glow shadow-md shadow-rose-500/20">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl shadow-2xl p-4 border border-amber-500/30 z-[100] bg-[#0a0806]">
              <div className="flex items-center justify-between border-b border-amber-500/10 pb-2 mb-2">
                <span className="text-xs font-semibold text-amber-400 font-mono">Live Alert Center</span>
                {notifications.length > 0 && (
                  <button
                    onClick={onClearNotifications}
                    className="text-[10px] text-rose-400 hover:underline font-bold"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs py-6">No new alerts.</p>
                ) : (
                  notifications.map((n, i) => (
                    <div
                      key={i}
                      className="text-xs p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10 flex flex-col gap-1 hover:border-amber-500/20 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-200">{n.title}</span>
                        <span className="text-[9px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{n.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account / Loyalty Card */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 pr-3 rounded-full border border-amber-500/20 bg-white/5 hover:bg-amber-500/5 hover:border-amber-500/40 transition-all duration-300"
          >
            <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${getTierColor(userTier)} flex items-center justify-center font-black text-sm text-[#0d0a07] shadow-md shadow-black/30`}>
              {getInitials(userName)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-[11px] font-bold text-amber-200 leading-tight">{userName}</div>
              <div className="text-[9px] text-amber-500/70 font-semibold font-mono leading-none">
                {userTier} Member
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-amber-500" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-3 w-72 glass-panel rounded-2xl shadow-2xl p-4 border border-amber-500/30 z-[100] bg-[#0a0806]">
              <div className="text-center pb-3 border-b border-amber-500/10">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${getTierColor(userTier)} flex items-center justify-center font-black text-lg text-[#0d0a07] mx-auto mb-2 shadow-lg`}>
                  {getInitials(userName)}
                </div>
                <h4 className="text-sm font-bold text-amber-200">{userName}</h4>
                <p className="text-xs text-slate-400 font-mono">{userEmail}</p>
              </div>

              {/* Loyalty Reward Progress Card */}
              <div className="my-3 p-3 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/20">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-mono text-amber-500">Tier Status</span>
                  <span className={`text-xs font-bold bg-gradient-to-r ${getTierColor(userTier)} bg-clip-text text-transparent`}>
                    {userTier}
                  </span>
                </div>
                <div className="w-full bg-amber-500/10 h-1.5 rounded-full my-2 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(userPoints / 1000) * 100}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                  <span>{userPoints} Points</span>
                  <span>1000 to Platinum</span>
                </div>
              </div>

              {/* Balances */}
              <div className="flex gap-2 mb-3">
                <div className="flex-1 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-center">
                  <div className="text-[9px] text-slate-400 uppercase">Loyalty Wallet</div>
                  <div className="text-xs font-bold text-amber-300">{userPoints} pts</div>
                </div>
                <div className="flex-1 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-center">
                  <div className="text-[9px] text-slate-400 uppercase">Cashback Bal</div>
                  <div className="text-xs font-bold text-amber-300">₹{cashback}</div>
                </div>
              </div>

               {/* Portal Dashboard Buttons for Staff / Admins */}
              {currentUserRole === 'SUPER_ADMIN' && (
                <a
                  href="/super-admin"
                  className="w-full mb-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 text-[11px] font-bold transition-all font-mono"
                >
                  👑 OPEN SUPER ADMIN HQ
                </a>
              )}
              {currentUserRole === 'ADMIN' && (
                <a
                  href="/admin"
                  className="w-full mb-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-[11px] font-bold transition-all font-mono"
                >
                  📋 OPEN OPERATIONS PORTAL
                </a>
              )}
              {currentUserRole === 'CHEF' && (
                <a
                  href="/kds"
                  className="w-full mb-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-[11px] font-bold transition-all font-mono"
                >
                  🍳 OPEN KITCHEN DISPLAY
                </a>
              )}
              {currentUserRole === 'CASHIER' && (
                <a
                  href="/pos"
                  className="w-full mb-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 text-[11px] font-bold transition-all font-mono"
                >
                  🖥️ OPEN POS TERMINAL
                </a>
              )}
              {currentUserRole === 'DELIVERY_STAFF' && (
                <a
                  href="/delivery"
                  className="w-full mb-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-[11px] font-bold transition-all font-mono"
                >
                  🚴 OPEN RIDER PORTAL
                </a>
              )}

              {/* My Profile Button */}
              <button
                onClick={() => {
                  onOpenMyProfile();
                  setShowProfile(false);
                }}
                className="w-full mb-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-[11px] font-bold transition-all font-mono"
              >
                👤 VIEW MY PROFILE CARD
              </button>
 
              {/* My Orders Button */}
              <button
                onClick={() => {
                  onOpenMyOrders();
                  setShowProfile(false);
                }}
                className="w-full mb-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-[11px] font-bold transition-all font-mono"
              >
                📦 SEE MY ORDERS (LIVE)
              </button>

              {/* Table Reservations Button */}
              <button
                onClick={() => {
                  onOpenMyReservations();
                  setShowProfile(false);
                }}
                className="w-full mb-3 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-[11px] font-bold transition-all font-mono"
              >
                📅 SEE TABLE RESERVATIONS
              </button>

              <div className="text-[10px] text-amber-500/40 font-mono text-center pt-1 border-t border-amber-500/5">
                Session Active • 2026-06-03
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
