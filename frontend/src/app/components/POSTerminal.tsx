"use client";

import React, { useState } from 'react';
import { Search, Printer, DollarSign, CreditCard, QrCode, Plus, Minus, UserCheck, X } from 'lucide-react';
import PremiumAlertModal from './PremiumAlertModal';

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  image: string;
  isVeg: boolean;
}

interface POSTerminalProps {
  items: MenuItem[];
  onPlacePOSOrder: (orderDto: any) => void;
  lang: 'EN' | 'HI';
}

export default function POSTerminal({ items, onPlacePOSOrder, lang }: POSTerminalProps) {
  const [ticket, setTicket] = useState<any[]>([]);
  const [paymentType, setPaymentType] = useState<'CASH' | 'CARD' | 'UPI'>('UPI');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Split bill states
  const [isSplitOpen, setIsSplitOpen] = useState<boolean>(false);
  const [guestsCount, setGuestsCount] = useState<number>(2);

  // Print receipt state
  const [printedReceipt, setPrintedReceipt] = useState<any | null>(null);

  // Custom Alert state
  const [alertConfig, setAlertConfig] = useState<{ title: string, message: string } | null>(null);

  const subtotal = ticket.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gst = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + gst).toFixed(2));

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 12); // Restrict to top 12 grid for clean POS layout

  const handleAddToTicket = (item: MenuItem) => {
    const existing = ticket.find(t => t.id === item.id);
    if (existing) {
      setTicket(ticket.map(t => t.id === item.id ? { ...t, quantity: t.quantity + 1 } : t));
    } else {
      setTicket([...ticket, { ...item, quantity: 1 }]);
    }
  };

  const handleQtyChange = (itemId: string, dir: 'inc' | 'dec') => {
    setTicket(ticket.map(t => {
      if (t.id === itemId) {
        const nextQty = dir === 'inc' ? t.quantity + 1 : t.quantity - 1;
        return nextQty > 0 ? { ...t, quantity: nextQty } : null;
      }
      return t;
    }).filter(Boolean));
  };

  const handlePay = () => {
    if (ticket.length === 0) return;
    
    const rand = Math.floor(1000 + Math.random() * 9000);
    const receiptData = {
      orderNumber: `BH-POS-${rand}`,
      items: [...ticket],
      subtotal,
      gst,
      total,
      paymentMethod: paymentType,
      date: new Date().toLocaleString()
    };

    onPlacePOSOrder({
      items: ticket.map(t => ({ menuItemId: t.id, name: t.name, quantity: t.quantity, price: t.price })),
      type: 'DINE_IN',
      paymentMethod: paymentType,
      branchId: 'br-1',
    });

    setPrintedReceipt(receiptData);
    setTicket([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto py-6 px-4 md:px-8">
      
      {/* Left 2 Columns: Food Grid search */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {/* Top filter bar */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search POS grid..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181410] border border-amber-500/10 rounded-xl pl-9 pr-4 py-2 text-xs text-amber-100 placeholder-slate-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
          <div className="flex gap-2">
            <span className="bg-amber-500/10 text-amber-300 px-3 py-1 rounded-xl text-xs font-mono font-bold border border-amber-500/25">
              REGISTER #01 ACTIVE
            </span>
          </div>
        </div>

        {/* POS Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleAddToTicket(item)}
              className="glass-card p-3 rounded-2xl border border-amber-500/5 hover:border-amber-500/25 text-left flex flex-col justify-between h-36 relative overflow-hidden group"
            >
              <div className="absolute top-2 right-2">
                <span className={`w-2.5 h-2.5 rounded-full block ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </div>
              <img src={item.image} className="w-full h-16 object-cover rounded-xl mb-2 filter brightness-90 group-hover:brightness-100 transition-all" />
              <div>
                <h4 className="text-[11px] font-bold text-amber-100 line-clamp-1 leading-tight">{item.name}</h4>
                <p className="text-xs text-amber-400 font-bold font-mono mt-1">₹{item.price}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Ticket checkout detail list */}
      <div className="glass-panel p-5 rounded-3xl border border-amber-500/20 h-fit flex flex-col justify-between gap-5">
        <div>
          <div className="flex justify-between items-center border-b border-amber-500/10 pb-3 mb-3">
            <span className="font-bold text-amber-200 text-sm font-mono">Current Ticket</span>
            {ticket.length > 0 && (
              <button onClick={() => setTicket([])} className="text-[10px] text-rose-400 hover:underline">
                Clear Ticket
              </button>
            )}
          </div>

          {/* Ticket items scroll */}
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-4 pr-1">
            {ticket.length === 0 ? (
              <div className="text-center text-slate-500 text-xs py-10">Ticket empty. Tap items on left.</div>
            ) : (
              ticket.map(t => (
                <div key={t.id} className="flex justify-between items-center text-xs bg-amber-500/5 border border-amber-500/10 p-2 rounded-xl">
                  <div className="flex-1">
                    <h5 className="font-bold text-amber-200 line-clamp-1">{t.name}</h5>
                    <span className="text-[10px] text-slate-400">₹{t.price} each</span>
                  </div>
                  <div className="flex items-center gap-2.5 border border-amber-500/10 rounded-lg px-2 py-1 bg-[#14100c]">
                    <button onClick={() => handleQtyChange(t.id, 'dec')} className="text-amber-500"><Minus className="w-3 h-3" /></button>
                    <span className="text-[11px] text-slate-300 w-3 text-center">{t.quantity}</span>
                    <button onClick={() => handleQtyChange(t.id, 'inc')} className="text-amber-500"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment Method Quick Selector */}
          <div className="flex border border-amber-500/15 rounded-xl p-1 bg-[#181410] mb-4">
            {[
              { id: 'UPI', label: 'UPI QR', icon: QrCode },
              { id: 'CARD', label: 'Swipe Card', icon: CreditCard },
              { id: 'CASH', label: 'Cash Tender', icon: DollarSign }
            ].map(pm => {
              const Icon = pm.icon;
              return (
                <button
                  key={pm.id}
                  onClick={() => setPaymentType(pm.id as any)}
                  className={`flex-grow py-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${
                    paymentType === pm.id
                      ? 'bg-amber-500 text-black'
                      : 'text-slate-400 hover:text-amber-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{pm.label}</span>
                </button>
              );
            })}
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-amber-500/10 pt-3 flex flex-col gap-1.5 text-xs text-slate-400 font-mono mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>GST TAX (5%)</span>
              <span>₹{gst}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-amber-200 pt-1.5 border-t border-amber-500/5">
              <span>Grand Total</span>
              <span className="text-amber-400">₹{total}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setIsSplitOpen(true)}
            className="w-full bg-[#181410] hover:bg-[#201c18] border border-amber-500/20 text-amber-300 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Split Bill Calculator</span>
          </button>
          
          <button
            onClick={handlePay}
            disabled={ticket.length === 0}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold py-3 rounded-xl text-xs uppercase"
          >
            Process Payment & Print
          </button>
        </div>
      </div>

      {/* SPLIT BILL OVERLAY */}
      {isSplitOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm rounded-2xl border border-amber-500/30 p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-amber-200 text-sm font-mono">Split Bill Splitter</h4>
              <button onClick={() => setIsSplitOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Number of Guests</label>
                <div className="flex items-center gap-3 border border-amber-500/10 rounded-xl px-3 py-2 bg-[#181410]">
                  <button onClick={() => setGuestsCount(Math.max(2, guestsCount - 1))} className="text-amber-500">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-amber-100 w-8 text-center">{guestsCount}</span>
                  <button onClick={() => setGuestsCount(guestsCount + 1)} className="text-amber-500">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="border-t border-amber-500/10 pt-3 flex flex-col gap-1.5 text-xs text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>Grand Total</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-amber-400 pt-2 border-t border-amber-500/5">
                  <span>Share Per Guest</span>
                  <span>₹{(total / guestsCount).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setAlertConfig({
                    title: 'Bill Split Verified',
                    message: `Bill split successfully by ${guestsCount} ways! Share per guest is ₹${(total / guestsCount).toFixed(2)}.`
                  });
                  setIsSplitOpen(false);
                }}
                className="w-full bg-amber-500 text-black font-bold py-2.5 rounded-xl text-xs"
              >
                Accept Split Splitter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTED RECEIPT OVERLAY MODAL */}
      {printedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm rounded-2xl border border-amber-500/40 p-5 shadow-2xl relative">
            <button
              onClick={() => setPrintedReceipt(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            
            {/* Thermic Receipt Design */}
            <div className="bg-[#fcfaf5] text-[#1c1814] p-5 rounded-xl border border-slate-300 font-mono shadow-inner text-xs">
              <div className="text-center pb-3 border-b border-dashed border-slate-400">
                <h3 className="font-extrabold text-sm uppercase font-mono tracking-widest text-[#0d0a07]">DineOps Cafe Ltd</h3>
                <p className="text-[10px] text-slate-500 mt-1">Downtown Branch Flagship</p>
                <p className="text-[9px] text-slate-400">Phone: +919999999001</p>
              </div>

              <div className="py-3 flex flex-col gap-1 border-b border-dashed border-slate-400 text-[10px]">
                <div>Order Ref: {printedReceipt.orderNumber}</div>
                <div>Date: {printedReceipt.date}</div>
                <div>Cashier:sneakagupta (REGISTER #01)</div>
              </div>

              {/* Items List */}
              <div className="py-3 flex flex-col gap-2 border-b border-dashed border-slate-400 text-[10px]">
                {printedReceipt.items.map((it: any, index: number) => (
                  <div key={index} className="flex justify-between">
                    <span>{it.quantity}x {it.name}</span>
                    <span>₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="py-3 flex flex-col gap-1 text-[10px]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{printedReceipt.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST & SGST (5.0%)</span>
                  <span>₹{printedReceipt.gst}</span>
                </div>
                <div className="flex justify-between font-bold text-xs text-black border-t border-dashed border-slate-400 pt-2 mt-1">
                  <span>GRAND TOTAL</span>
                  <span>₹{printedReceipt.total}</span>
                </div>
              </div>

              <div className="text-center pt-3 border-t border-dashed border-slate-400 text-[9px] text-slate-600 mt-2">
                <div>UPI PAYMENT VERIFIED SUCCESS</div>
                <div className="font-bold tracking-widest mt-1">*** THANK YOU ***</div>
              </div>
            </div>

            <button
              onClick={() => {
                window.print();
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-2.5 rounded-xl text-xs mt-4 flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Simulate Printer Print</span>
            </button>
          </div>
        </div>
      )}

      <PremiumAlertModal
        isOpen={!!alertConfig}
        onClose={() => setAlertConfig(null)}
        title={alertConfig?.title || 'Notification'}
        message={alertConfig?.message || ''}
      />
    </div>
  );
}
