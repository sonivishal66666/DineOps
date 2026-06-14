"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, DollarSign, CheckCircle2, ShieldAlert, Award, Compass } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  otp?: string;
  total: number;
}

interface DeliveryDashboardProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: string, deliveryStaffId?: string) => void;
  onVerifyOtp: (orderId: string, otp: string) => Promise<any>;
  lang: 'EN' | 'HI';
}

export default function DeliveryDashboard({ orders, onUpdateStatus, onVerifyOtp, lang }: DeliveryDashboardProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [otpInput, setOtpInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // SVG Map animation ticker
  const [dotProgress, setDotProgress] = useState<number>(10);

  useEffect(() => {
    if (selectedOrder && selectedOrder.status === 'OUT_FOR_DELIVERY') {
      const timer = setInterval(() => {
        setDotProgress(p => (p >= 90 ? 10 : p + 5));
      }, 800);
      return () => clearInterval(timer);
    }
  }, [selectedOrder]);

  const deliveryDuties = orders.filter(order =>
    order.type === 'DELIVERY' && ['READY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status)
  );

  const handleStartDelivery = (order: Order) => {
    onUpdateStatus(order.id, 'OUT_FOR_DELIVERY', 'user-delivery');
    setSelectedOrder({ ...order, status: 'OUT_FOR_DELIVERY' });
  };

  const handleVerifyOtpSubmit = async () => {
    if (!selectedOrder) return;
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await onVerifyOtp(selectedOrder.id, otpInput);
      setSuccessMessage('OTP Verified Successfully! Order Handover Complete.');
      setOtpInput('');
      
      // Update selected order object state
      setSelectedOrder({ ...selectedOrder, status: 'DELIVERED' });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Incorrect delivery OTP. Please verify with customer.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto py-6 px-4 md:px-8">
      {/* Left Column: Duty Queue */}
      <div className="flex flex-col gap-4">
        <div className="glass-panel p-4 rounded-2xl flex justify-between items-center border border-amber-500/15">
          <span className="text-xs uppercase font-mono tracking-wider text-amber-500 font-semibold">Delivery Duties</span>
          <span className="text-xs font-mono font-bold text-slate-400">Total: {deliveryDuties.length}</span>
        </div>

        <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
          {deliveryDuties.length === 0 ? (
            <div className="glass-panel py-12 text-center text-slate-400 text-xs">
              No delivery jobs available at the moment.
            </div>
          ) : (
            deliveryDuties.map(order => (
              <button
                key={order.id}
                onClick={() => {
                  setSelectedOrder(order);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`glass-card p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 ${
                  selectedOrder?.id === order.id
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg'
                    : 'border-amber-500/5 hover:border-amber-500/20'
                }`}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-amber-200 font-mono">{order.orderNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    order.status === 'DELIVERED'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : order.status === 'OUT_FOR_DELIVERY'
                      ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/25'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 leading-relaxed">
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" /> <span className="line-clamp-1">{order.deliveryAddress}</span></div>
                </div>
                <div className="flex justify-between items-center border-t border-amber-500/5 pt-2.5 text-xs">
                  <span className="text-[10px] text-slate-500 font-mono">Fare Earnings</span>
                  <span className="text-amber-400 font-bold font-mono">₹60.00 (Payout)</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Middle & Right: GPS Navigation Visualizer & OTP Handover panel */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {selectedOrder ? (
          <div className="glass-panel p-6 rounded-3xl border border-amber-500/20 flex flex-col gap-5">
            {/* Delivery Stats Header */}
            <div className="flex flex-wrap justify-between items-center border-b border-amber-500/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-amber-200">Active Navigation Profile</h3>
                <span className="text-xs text-slate-400 font-mono">REF: {selectedOrder.orderNumber}</span>
              </div>
              
              {selectedOrder.status === 'READY' && (
                <button
                  onClick={() => handleStartDelivery(selectedOrder)}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Navigation className="w-4 h-4 animate-bounce" />
                  <span>Start Live Delivery Route</span>
                </button>
              )}
            </div>

            {/* GPS Vector Map Simulation */}
            <div className="h-64 bg-[#14100c] border border-amber-500/10 rounded-2xl relative overflow-hidden flex items-center justify-center p-4">
              <svg className="w-full h-full stroke-amber-500/20 stroke-2 fill-none" viewBox="0 0 400 200">
                {/* Simulated Road Paths */}
                <path d="M 50 150 Q 150 50 250 120 T 350 40" strokeDasharray="5,5" stroke="#d4af37" strokeWidth="2" />
                <path d="M 50 150 L 350 40" stroke="rgba(212,175,55,0.05)" strokeWidth="1" />
                
                {/* Start Hub Pin */}
                <g transform="translate(50, 150)">
                  <circle r="6" fill="#10b981" />
                  <text y="-10" textAnchor="middle" fill="#10b981" fontSize="8" fontFamily="monospace" fontWeight="bold">BREWHUB FLAGSHIP</text>
                </g>

                {/* Moving Courier Pin */}
                {selectedOrder.status === 'OUT_FOR_DELIVERY' && (
                  <circle
                    cx={50 + (300 * (dotProgress / 100))}
                    cy={150 - (110 * (dotProgress / 100))}
                    r="5"
                    fill="#a855f7"
                    className="pulse-glow"
                  />
                )}

                {/* Customer End Pin */}
                <g transform="translate(350, 40)">
                  <circle r="6" fill="#f43f5e" />
                  <text y="-10" textAnchor="middle" fill="#f43f5e" fontSize="8" fontFamily="monospace" fontWeight="bold">CUSTOMER APARTMENT</text>
                </g>
              </svg>

              {/* Map floating labels */}
              <div className="absolute bottom-3 left-3 bg-[#0d0a07]/80 border border-amber-500/10 px-3 py-1.5 rounded-xl text-[10px] font-mono text-slate-300">
                Live Status: {selectedOrder.status === 'OUT_FOR_DELIVERY' ? 'Courier In Transit' : 'Awaiting Dispatch'}
              </div>
            </div>

            {/* OTP Handover Verification Area */}
            {selectedOrder.status === 'OUT_FOR_DELIVERY' && (
              <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex flex-col gap-4">
                <div className="flex gap-2.5 items-start">
                  <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-200">Secure Delivery Verification (OTP Required)</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Please ask the customer for the verification OTP digits shown in their app timeline to confirm handover.</p>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                    {errorMessage}
                  </div>
                )}
                {successMessage && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="Enter 4-digit code (e.g. 4820)"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="flex-1 bg-[#181410] border border-amber-500/10 rounded-xl px-4 py-2 text-xs font-mono text-center text-amber-300 tracking-widest placeholder-slate-600 focus:outline-none"
                  />
                  <button
                    onClick={handleVerifyOtpSubmit}
                    className="bg-amber-500 hover:bg-amber-600 text-black px-6 py-2 rounded-xl text-xs font-bold font-mono"
                  >
                    Confirm Verify Handover
                  </button>
                </div>
              </div>
            )}

            {/* Delivery address details card */}
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs flex flex-col gap-2 leading-relaxed">
              <div>
                <span className="text-[9px] uppercase font-mono text-amber-500 font-semibold">Drop-off Address:</span>
                <p className="text-slate-300 font-medium mt-0.5">{selectedOrder.deliveryAddress}</p>
              </div>
              {selectedOrder.deliveryNotes && (
                <div>
                  <span className="text-[9px] uppercase font-mono text-rose-400 font-semibold">Driver Gate Notes:</span>
                  <p className="text-rose-300 italic mt-0.5">{selectedOrder.deliveryNotes}</p>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="glass-panel p-20 text-center text-slate-400 text-xs border border-amber-500/15 rounded-3xl">
            Select an active delivery duty ticket from the left column to view live routing.
          </div>
        )}
      </div>
    </div>
  );
}
