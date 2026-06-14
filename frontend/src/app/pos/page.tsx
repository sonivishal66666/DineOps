"use client";
import React, { useState, useEffect } from 'react';
import POSTerminal from '../components/POSTerminal';
import PortalAuthGuard from '../components/PortalAuthGuard';
import PremiumAlertModal from '../components/PremiumAlertModal';
import { ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function PosPortal() {
  const [items, setItems] = useState<any[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [alertConfig, setAlertConfig] = useState<{ title: string, message: string, type?: 'success' | 'info' } | null>(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState<boolean>(false);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/menu/items`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
        setIsBackendConnected(true);
      } else {
        throw new Error();
      }
    } catch (err) {
      setIsBackendConnected(false);
      // Fallback mock items
      setItems([
        { id: 'item-1', categoryId: 'cat-breakfast', name: 'Masala Dosa Combo with Podi', price: 180, isVeg: true, calories: 340, image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop' },
        { id: 'item-2', categoryId: 'cat-breakfast', name: 'Fluffy Blueberry Pancakes', price: 220, isVeg: true, calories: 580, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&auto=format&fit=crop' },
        { id: 'item-4', categoryId: 'cat-italian', name: 'Truffle Mushroom Fettuccine Alfredo', price: 450, isVeg: true, calories: 890, image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500&auto=format&fit=crop' },
        { id: 'item-5', categoryId: 'cat-italian', name: 'Wood-fired Margherita Pizza', price: 320, isVeg: true, calories: 620, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop' },
        { id: 'item-7', categoryId: 'cat-grill', name: 'A5 Miyazaki Wagyu Sliders', price: 380, isVeg: false, calories: 720, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop' }
      ]);
    }
  };

  const handlePlaceOrder = async (orderDto: any) => {
    const total = orderDto.items.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0);
    setAlertConfig({
      title: 'POS Order Registered',
      message: `Order Placed Successfully at Cashier POS Terminal! Total Due: ₹${total}`,
      type: 'success'
    });
    try {
      await fetch(`${API_BASE}/orders/place`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderDto)
      });
    } catch (err) {}
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <PortalAuthGuard allowedRoles={['CASHIER']} portalName="POS Cashier Terminal">
      <div className="min-h-screen bg-[#0d0a07] text-[#f4ece1] flex flex-col">
        <div className="bg-[#14100c] px-6 py-3 border-b border-amber-500/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🖥️</span>
            <div>
              <h1 className="text-sm font-bold text-amber-200 uppercase tracking-widest font-mono">Cashier POS Terminal</h1>
              <p className="text-[9px] text-slate-500 font-mono">STANDALONE POS • {isBackendConnected ? 'API SYNCED' : 'OFFLINE FALLBACK'}</p>
            </div>
          </div>
          <div className="text-[10px] text-amber-400 font-mono uppercase bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 flex items-center gap-4">
            <span>● Terminal Active</span>
            <button
              onClick={() => setShowSignOutConfirm(true)}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase transition-colors px-2 py-0.5 rounded border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/5 cursor-pointer ml-2"
            >
              Sign Out
            </button>
          </div>
        </div>
        <main className="flex-1 p-6">
          <POSTerminal items={items} onPlacePOSOrder={handlePlaceOrder} lang="EN" />
        </main>
        
        <PremiumAlertModal
          isOpen={!!alertConfig}
          onClose={() => setAlertConfig(null)}
          title={alertConfig?.title || 'Notification'}
          message={alertConfig?.message || ''}
          type={alertConfig?.type}
        />

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
