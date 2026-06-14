"use client";
import React, { useState, useEffect } from 'react';
import KitchenKDS from '../components/KitchenKDS';
import PortalAuthGuard from '../components/PortalAuthGuard';
import { ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function KdsPortal() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState<boolean>(false);

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
        { 
          id: 'ord-101', 
          orderNumber: 'BH-2026-9042', 
          status: 'ORDER_PLACED', 
          type: 'DINE_IN', 
          total: 769, 
          createdAt: new Date(Date.now() - 15 * 60 * 1000), 
          items: [
            { name: 'DineOps Signature Cold Brew', quantity: 2 }, 
            { name: 'A5 Miyazaki Wagyu Sliders', quantity: 1 }
          ],
          cookingNotes: 'Gluten-free preference if possible.'
        },
        { 
          id: 'ord-102', 
          orderNumber: 'BH-2026-9043', 
          status: 'PREPARING', 
          type: 'DELIVERY', 
          total: 1052, 
          deliveryAddress: 'Apt 4B, Signature Residency, Bandra', 
          otp: '4820', 
          createdAt: new Date(Date.now() - 5 * 60 * 1000), 
          items: [
            { name: 'Truffle Mushroom Fettuccine Alfredo', quantity: 2 }
          ] 
        }
      ]);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    // Optimistic UI update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));

    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      console.error('Failed to update status on server, fallback to local state', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PortalAuthGuard allowedRoles={['CHEF', 'KITCHEN_STAFF']} portalName="Kitchen Display System (KDS)">
      <div className="min-h-screen bg-[#0d0a07] text-[#f4ece1] flex flex-col">
        {/* Top Banner */}
        <div className="bg-[#14100c] px-6 py-3 border-b border-amber-500/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍳</span>
            <div>
              <h1 className="text-sm font-bold text-amber-200 uppercase tracking-widest font-mono">Kitchen Display System (KDS)</h1>
              <p className="text-[9px] text-slate-500 font-mono">STANDALONE KDS • {isBackendConnected ? 'API SYNCED (3S POLLING)' : 'OFFLINE FALLBACK'}</p>
            </div>
          </div>
          <div className="text-[10px] text-amber-400 font-mono uppercase bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 flex items-center gap-4">
            <span>● KDS Active</span>
            <button
              onClick={() => setShowSignOutConfirm(true)}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase transition-colors px-2 py-0.5 rounded border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/5 cursor-pointer ml-2"
            >
              Sign Out
            </button>
          </div>
        </div>
        <main className="flex-1 p-4 md:p-6">
          <KitchenKDS orders={orders} onUpdateStatus={handleUpdateStatus} lang="EN" />
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
