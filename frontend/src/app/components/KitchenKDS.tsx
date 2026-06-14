"use client";

import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, Flame, CheckCircle, AlertCircle, ShoppingBag, Coffee, Pizza, Cake } from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
  customizations?: any[];
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  cookingNotes?: string;
  createdAt: any;
  items: OrderItem[];
}

interface KitchenKDSProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: string) => void;
  lang: 'EN' | 'HI';
}

export default function KitchenKDS({ orders, onUpdateStatus, lang }: KitchenKDSProps) {
  const [selectedStation, setSelectedStation] = useState<string>('ALL');
  
  // Elapsed timers state
  const [ticks, setTicks] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTicks(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stations = [
    { id: 'ALL', name: 'All Stations', icon: ChefHat },
    { id: 'Beverage', name: 'Barista / Beverage', icon: Coffee },
    { id: 'Grill', name: 'Grill & Steaks', icon: Flame },
    { id: 'Bakery', name: 'Sourdough & Bakery', icon: Pizza },
    { id: 'Dessert', name: 'Desserts & Sweets', icon: Cake }
  ];

  // Map order items to specific stations
  const getStationForMenuItem = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('brew') || lower.includes('latte') || lower.includes('cappuccino') || lower.includes('espresso') || lower.includes('cooler') || lower.includes('lemonade') || lower.includes('fizz') || lower.includes('mocktail') || lower.includes('cider')) {
      return 'Beverage';
    }
    if (lower.includes('slider') || lower.includes('burger') || lower.includes('grill') || lower.includes('steak') || lower.includes('ribs') || lower.includes('paneer tikka')) {
      return 'Grill';
    }
    if (lower.includes('croissant') || lower.includes('sourdough') || lower.includes('focaccia') || lower.includes('roll') || lower.includes('tart') || lower.includes('muffin') || lower.includes('danoise')) {
      return 'Bakery';
    }
    if (lower.includes('cake') || lower.includes('tiramisu') || lower.includes('cheesecake') || lower.includes('gelato') || lower.includes('waffle') || lower.includes('baklava') || lower.includes('mousse')) {
      return 'Dessert';
    }
    return 'Main Kitchen';
  };

  const getFilteredItemsForOrder = (order: Order, station: string) => {
    if (station === 'ALL') return order.items;
    return order.items.filter(it => getStationForMenuItem(it.name) === station);
  };

  // Filter KDS active orders
  const activeKDSOrders = orders.filter(order => {
    // Only show active kitchen pipeline states
    const isActiveState = ['ORDER_PLACED', 'PAYMENT_CONFIRMED', 'ACCEPTED', 'PREPARING', 'COOKING', 'PACKED', 'READY'].includes(order.status);
    if (!isActiveState) return false;

    // Verify if order contains items for selected station
    const filteredItems = getFilteredItemsForOrder(order, selectedStation);
    return filteredItems.length > 0;
  });

  const getElapsedTime = (createdTime: any) => {
    const created = new Date(createdTime);
    const diff = Math.floor((Date.now() - created.getTime()) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}m ${secs}s`;
  };

  const getStatusButton = (order: Order) => {
    switch (order.status) {
      case 'ORDER_PLACED':
      case 'PAYMENT_CONFIRMED':
        return (
          <button
            onClick={() => onUpdateStatus(order.id, 'ACCEPTED')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
          >
            <span>Accept Order Ticket</span>
          </button>
        );
      case 'ACCEPTED':
        return (
          <button
            onClick={() => onUpdateStatus(order.id, 'PREPARING')}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Start Prep / Cooking</span>
          </button>
        );
      case 'PREPARING':
        return (
          <button
            onClick={() => onUpdateStatus(order.id, 'COOKING')}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
          >
            <span>Mark Plating / Cooking Done</span>
          </button>
        );
      case 'COOKING':
        return (
          <button
            onClick={() => onUpdateStatus(order.id, 'PACKED')}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
          >
            <span>Mark Boxed & Packed</span>
          </button>
        );
      case 'PACKED':
        return (
          <button
            onClick={() => onUpdateStatus(order.id, 'READY')}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#0d0a07] font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Dispatch / Food Ready</span>
          </button>
        );
      case 'READY':
        return (
          <button
            onClick={() => onUpdateStatus(order.id, 'DELIVERED')}
            className="w-full bg-amber-500 hover:bg-amber-600 text-[#0d0a07] font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Mark Served / Delivered</span>
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto py-6 px-4 md:px-8">
      {/* Stations Header selector */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap gap-2 justify-between items-center border border-amber-500/15">
        <div className="flex gap-2 flex-wrap">
          {stations.map(st => {
            const Icon = st.icon;
            return (
              <button
                key={st.id}
                onClick={() => setSelectedStation(st.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  selectedStation === st.id
                    ? 'bg-amber-500/25 border-amber-500/40 text-amber-200'
                    : 'border-transparent text-slate-400 hover:text-amber-300 hover:bg-amber-500/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{st.name}</span>
              </button>
            );
          })}
        </div>
        <div className="text-xs font-mono font-bold text-amber-400">
          ACTIVE KITCHEN QUEUE: {activeKDSOrders.length} TICKETS
        </div>
      </div>

      {/* KDS Grid display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {activeKDSOrders.length === 0 ? (
          <div className="col-span-full glass-panel py-20 text-center text-slate-400 text-sm">
            No active order tickets in this kitchen station.
          </div>
        ) : (
          activeKDSOrders.map((order) => {
            const stationItems = getFilteredItemsForOrder(order, selectedStation);
            return (
              <div
                key={order.id}
                className="glass-panel rounded-2xl overflow-hidden border border-amber-500/10 flex flex-col justify-between h-80 shadow-lg"
              >
                {/* Ticket Header */}
                <div className="p-3 bg-gradient-to-r from-[#1c1814] to-slate-900 border-b border-amber-500/10 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-amber-500 font-bold font-mono">TICKET: {order.orderNumber}</span>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-400 font-bold font-mono">
                      <ShoppingBag className="w-3 h-3 text-amber-500/70" />
                      <span>{order.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/5 px-2 py-1 rounded-lg text-rose-400 font-mono text-[10px] border border-rose-500/20">
                    <Clock className="w-3 h-3 animate-spin" />
                    <span>{getElapsedTime(order.createdAt)}</span>
                  </div>
                </div>

                {/* Ticket Body Items */}
                <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-2">
                  {stationItems.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-start text-xs border-b border-amber-500/5 pb-2">
                      <div>
                        <h5 className="font-bold text-amber-200">{it.name}</h5>
                        {it.customizations && (
                          <p className="text-[9px] text-amber-500/60 font-medium">
                            +{it.customizations.map((cu: any) => cu.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/15 text-[10px]">
                        x{it.quantity}
                      </span>
                    </div>
                  ))}

                  {/* Notes */}
                  {order.cookingNotes && (
                    <div className="mt-2 p-2 rounded-lg bg-rose-500/5 border border-rose-500/20 flex gap-1.5 items-start">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-rose-300 italic">{order.cookingNotes}</p>
                    </div>
                  )}
                </div>

                {/* Ticket Controls footer */}
                <div className="p-3 border-t border-amber-500/10 bg-[#14100c] flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>STATE:</span>
                    <span className="text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
                      {order.status}
                    </span>
                  </div>
                  {getStatusButton(order)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
