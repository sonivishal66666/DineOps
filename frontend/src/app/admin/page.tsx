"use client";
import React, { useState, useEffect } from 'react';
import InventoryStaff from '../components/InventoryStaff';
import PortalAuthGuard from '../components/PortalAuthGuard';
import { Shield, ChevronDown, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminPortal() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [showRoleSelector, setShowRoleSelector] = useState<boolean>(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState<boolean>(false);

  const rolesList = [
    { id: 'CUSTOMER', name: 'Customer Portal', url: '/' },
    { id: 'CASHIER', name: 'POS Terminal (Cashier)', url: '/pos' },
    { id: 'CHEF', name: 'Kitchen Display (KDS)', url: '/kds' },
    { id: 'DELIVERY_STAFF', name: 'Delivery Dashboard', url: '/delivery' },
    { id: 'ADMIN', name: 'Admin Operations', url: '/admin' },
    { id: 'SUPER_ADMIN', name: 'Super Admin HQ', url: '/super-admin' },
  ];

  const fetchData = async () => {
    try {
      const resInv = await fetch(`${API_BASE}/ops/inventory`);
      const resShifts = await fetch(`${API_BASE}/ops/shifts`);
      if (resInv.ok && resShifts.ok) {
        const invData = await resInv.json();
        const shiftsData = await resShifts.json();
        setInventory(invData);
        setShifts(shiftsData);
        setIsBackendConnected(true);
      } else {
        throw new Error();
      }
    } catch (err) {
      setIsBackendConnected(false);
      // Fallback inventory
      setInventory([
        { id: 'inv-1', name: 'Premium Arabica Coffee Beans', sku: 'INV-COF-003', quantity: 24.5, unit: 'kg', minStockLevel: 15.0 },
        { id: 'inv-2', name: 'Organic Sourdough Bread Flour', sku: 'INV-FLR-001', quantity: 64.0, unit: 'kg', minStockLevel: 20.0 },
        { id: 'inv-3', name: 'A5 Miyazaki Wagyu Beef', sku: 'INV-BEEF-002', quantity: 18.0, unit: 'kg', minStockLevel: 5.0 },
        { id: 'inv-4', name: 'Aged Truffle Infused Olive Oil', sku: 'INV-OIL-004', quantity: 1.2, unit: 'liters', minStockLevel: 2.0 },
      ]);
      // Fallback shifts
      setShifts([
        { id: 'sh-1', userId: 'usr-1', status: 'ACTIVE', startTime: new Date(), endTime: new Date(), user: { name: 'Chef Marco D\'Souza', role: 'CHEF' } },
        { id: 'sh-2', userId: 'usr-2', status: 'SCHEDULED', startTime: new Date(), endTime: new Date(), user: { name: 'Rahul Yadav', role: 'DELIVERY_STAFF' } },
        { id: 'sh-3', userId: 'usr-3', status: 'ACTIVE', startTime: new Date(), endTime: new Date(), user: { name: 'Sneha Gupta', role: 'CASHIER' } },
      ]);
    }
  };

  const handleAddInventoryMovement = async (movementDto: any) => {
    // Optimistic local update
    setInventory(prev => prev.map(item => {
      if (item.id === movementDto.itemId) {
        const qty = Number(movementDto.quantity);
        const nextQty = movementDto.type === 'IN' ? item.quantity + qty : Math.max(0, item.quantity - qty);
        return { ...item, quantity: nextQty };
      }
      return item;
    }));

    try {
      await fetch(`${API_BASE}/ops/inventory/movement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movementDto)
      });
    } catch (err) {
      console.error('Failed to submit inventory movement to backend', err);
    }
  };

  const handleClockShift = async (shiftId: string, type: 'IN' | 'OUT') => {
    // Optimistic local update
    setShifts(prev => prev.map(s => {
      if (s.id === shiftId) {
        return {
          ...s,
          status: type === 'IN' ? 'ACTIVE' : 'COMPLETED',
          checkIn: type === 'IN' ? new Date() : s.checkIn,
          checkOut: type === 'OUT' ? new Date() : s.checkOut
        };
      }
      return s;
    }));

    try {
      await fetch(`${API_BASE}/ops/shifts/${shiftId}/clock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
    } catch (err) {
      console.error('Failed to clock shift on backend', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PortalAuthGuard allowedRoles={['ADMIN', 'BRANCH_MANAGER']} portalName="Operations Admin Console">
      <div className="min-h-screen bg-[#0d0a07] text-[#f4ece1] flex flex-col">
        {/* Top Banner */}
        <div className="bg-[#14100c] px-6 py-3 border-b border-amber-500/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <div>
              <h1 className="text-sm font-bold text-amber-200 uppercase tracking-widest font-mono">Operations & Admin Portal</h1>
              <p className="text-[9px] text-slate-500 font-mono">STANDALONE ADMIN • {isBackendConnected ? 'API SYNCED' : 'OFFLINE FALLBACK'}</p>
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
                <span>Admin Operations</span>
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
                        r.id === 'ADMIN'
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

          <div className="text-[10px] text-amber-400 font-mono uppercase bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 flex items-center gap-4">
            <span>● Manager Session Active</span>
            <button
              onClick={() => setShowSignOutConfirm(true)}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase transition-colors px-2 py-0.5 rounded border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/5 cursor-pointer ml-2"
            >
              Sign Out
            </button>
          </div>
        </div>
        <main className="flex-1 p-4 md:p-6">
          <InventoryStaff 
            inventory={inventory} 
            shifts={shifts} 
            onAddMovement={handleAddInventoryMovement} 
            onClockShift={handleClockShift} 
            lang="EN" 
          />
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
