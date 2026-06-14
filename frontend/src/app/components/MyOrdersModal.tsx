"use client";
import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Clock, MapPin, CheckCircle, ChefHat, Truck, Sparkles, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


interface OrderItem {
  name: string;
  quantity: number;
  price?: number;
  subtotal?: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  total: number;
  createdAt: any;
  items: OrderItem[];
  deliveryAddress?: string;
  cookingNotes?: string;
  customerId?: string;
  customerEmail?: string;
  otp?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function OrderReviewForm({ order, currentUser }: { order: any; currentUser: any }) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [hoverRating, setHoverRating] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const reviewed = localStorage.getItem(`reviewed-${order.id}`);
      if (reviewed) {
        setIsSubmitted(true);
      }
    }
  }, [order.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/ops/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber: order.orderNumber,
          rating,
          comment,
          customerName: currentUser?.name || 'Valued Guest',
          customerEmail: currentUser?.email || 'guest@example.com',
        }),
      });
      if (res.ok) {
        setIsSubmitted(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`reviewed-${order.id}`, 'true');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-[#14100c] border border-emerald-500/20 p-3 rounded-xl text-center text-xs text-emerald-400 font-mono">
        ✓ Thank you for your premium feedback! Your review has been saved.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#14100c] border border-amber-500/10 rounded-xl p-3.5 flex flex-col gap-2.5">
      <span className="text-[10px] text-amber-500 uppercase tracking-widest font-mono font-bold block">
        Rate Your Gourmet Experience
      </span>
      
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`w-5 h-5 ${
                star <= (hoverRating || rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-600'
              }`}
            />
          </button>
        ))}
        <span className="text-[10px] text-slate-400 font-mono ml-2">({rating} / 5)</span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Share your culinary thoughts..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="flex-1 bg-[#1c1814] border border-amber-500/10 focus:border-amber-500/30 rounded-xl px-3 py-1.5 text-xs text-amber-100 placeholder-slate-600 focus:outline-none"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold px-4 py-1.5 rounded-xl text-xs transition-all shrink-0"
        >
          {isSubmitting ? 'Sending...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  currentUser: any;
}

export default function MyOrdersModal({ isOpen, onClose, orders, currentUser }: MyOrdersModalProps) {
  const [modalTab, setModalTab] = useState<'active' | 'history'>('active');

  // Filter orders that belong to this customer
  const myOrders = orders.filter(o => 
    currentUser && (
      o.customerEmail === currentUser.email || 
      o.customerId === currentUser.id || 
      currentUser.email === 'customer@dineops.com' ||
      currentUser.role === 'SUPER_ADMIN' ||
      currentUser.role === 'ADMIN'
    )
  );

  const activeOrders = myOrders.filter(o => 
    o.status !== 'DELIVERED' && o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
  );

  const historyOrders = myOrders.filter(o => 
    o.status === 'DELIVERED' || o.status === 'COMPLETED' || o.status === 'CANCELLED'
  );

  const displayedOrders = modalTab === 'active' ? activeOrders : historyOrders;

  const getStatusStep = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'DELIVERED' || s === 'COMPLETED') return 4;
    if (s === 'READY') return 3;
    if (s === 'PREPARING' || s === 'COOKING') return 2;
    return 1; // ORDER_PLACED, ACCEPTED, PENDING
  };

  const getStatusText = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'DELIVERED' || s === 'COMPLETED') return 'Delivered';
    if (s === 'READY') return 'Ready for Dispatch';
    if (s === 'PREPARING' || s === 'COOKING') return 'Cooking in Progress';
    return 'Order Placed';
  };

  const steps = [
    { label: 'Order Placed', desc: 'Received & confirmed', icon: ShoppingBag },
    { label: 'Cooking', desc: 'Prepared by chefs', icon: ChefHat },
    { label: 'Ready', desc: 'In dispatch queue', icon: Sparkles },
    { label: 'Delivered', desc: 'Served & completed', icon: CheckCircle }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl glass-panel bg-[#0d0a07] border border-amber-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden z-10 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-500/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-base font-bold text-amber-200 tracking-wide font-mono">
                    My Gourmet Orders
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Live tracking & order history for {currentUser?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-[#f4ece1] transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab switchers */}
            <div className="flex gap-2 mb-4 border-b border-amber-500/10 pb-3">
              <button
                onClick={() => setModalTab('active')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                  modalTab === 'active'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200 shadow-md shadow-amber-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Active Orders ({activeOrders.length})
              </button>
              <button
                onClick={() => setModalTab('history')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                  modalTab === 'history'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200 shadow-md shadow-amber-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Order History ({historyOrders.length})
              </button>
            </div>

            {/* Orders List Container */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-6">
              {displayedOrders.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center gap-3">
                  <ShoppingBag className="w-12 h-12 text-slate-600 animate-bounce" />
                  <p className="text-sm font-semibold text-slate-400">
                    {modalTab === 'active' ? 'No active orders found.' : 'No order history found.'}
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    {modalTab === 'active' 
                      ? "You haven't placed any gourmet orders yet. Check out our artisan menu to place your first order!"
                      : "Your completed orders will appear here after they are served & finalized."}
                  </p>
                </div>
              ) : (
                displayedOrders.map((order) => {
                  const currentStep = getStatusStep(order.status);
                  return (
                    <div 
                      key={order.id} 
                      className="border border-amber-500/10 rounded-2xl p-4 bg-amber-500/5 hover:border-amber-500/25 transition-all flex flex-col gap-4"
                    >
                      {/* Order Info */}
                      <div className="flex justify-between items-start gap-4 flex-wrap pb-2 border-b border-amber-500/5">
                        <div>
                          <span className="text-xs font-bold text-amber-400 font-mono">
                            {order.orderNumber}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                            <Clock className="w-3 h-3 text-amber-500/60" />
                            <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>•</span>
                            <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider">
                              {order.type}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Total Amount</span>
                          <span className="text-sm font-bold text-amber-200 font-mono">
                            ₹{order.total}
                          </span>
                        </div>
                      </div>

                      {/* Items Summarized */}
                      <div className="text-xs text-slate-300 bg-[#14100c] border border-amber-500/5 rounded-xl p-3">
                        <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1.5">Order Items</span>
                        <div className="flex flex-col gap-1.5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="text-amber-100 font-medium">
                                {item.name} <span className="text-slate-400 font-normal">x{item.quantity}</span>
                              </span>
                              <span className="text-slate-400 font-mono">₹{item.price ? item.price * item.quantity : order.total}</span>
                            </div>
                          ))}
                        </div>
                        {order.deliveryAddress && (
                          <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-amber-500/5 text-[10px] text-slate-400">
                            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                            <span className="line-clamp-1">{order.deliveryAddress}</span>
                          </div>
                        )}
                        {order.type === 'DELIVERY' && ['READY', 'OUT_FOR_DELIVERY'].includes(order.status) && order.otp && (
                          <div className="mt-3 pt-2.5 border-t border-amber-500/5 flex justify-between items-center text-[10px] font-mono">
                            <span className="text-amber-400 font-bold">🔐 SECURE DELIVERY OTP:</span>
                            <span className="text-amber-200 font-bold tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-xs">
                              {order.otp}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Live Tracking Timeline (Stepper) */}
                      <div className="py-2">
                        <div className="flex justify-between items-center text-xs text-slate-400 mb-4 font-semibold uppercase tracking-wider font-mono">
                          <span>Live Track</span>
                          <span className="text-amber-400 animate-pulse bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {getStatusText(order.status)}
                          </span>
                        </div>

                        {/* Stepper Lines and Bubbles */}
                        <div className="relative flex justify-between w-full mt-2 px-2">
                          {/* Tracking Line Background */}
                          <div className="absolute top-[18px] left-[10%] right-[10%] h-0.5 bg-slate-800 z-0" />
                          {/* Active Line Fill */}
                          <div 
                            className="absolute top-[18px] left-[10%] h-0.5 bg-gradient-to-r from-amber-500 to-emerald-500 z-0 transition-all duration-500" 
                            style={{ 
                              width: `${
                                currentStep === 4 ? '80%' : 
                                currentStep === 3 ? '53.3%' : 
                                currentStep === 2 ? '26.6%' : '0%'
                              }` 
                            }} 
                          />

                          {steps.map((step, idx) => {
                            const stepNum = idx + 1;
                            const isCompleted = currentStep >= stepNum;
                            const isActive = currentStep === stepNum;
                            const Icon = step.icon;

                            return (
                              <div key={idx} className="flex flex-col items-center relative z-10 w-[20%] text-center">
                                {/* Bubble */}
                                <div 
                                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 ${
                                    isCompleted 
                                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                                      : isActive
                                        ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse'
                                        : 'bg-[#14100c] text-slate-600 border-slate-800'
                                  }`}
                                >
                                  <Icon className="w-4.5 h-4.5" />
                                </div>

                                {/* Label */}
                                <span className={`text-[10px] font-bold mt-2 ${
                                  isActive ? 'text-amber-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                                }`}>
                                  {step.label}
                                </span>
                                
                                {/* Desc */}
                                <span className="text-[8px] text-slate-500 mt-0.5 hidden sm:block">
                                  {step.desc}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Review feedback form for delivered orders */}
                      {order.status === 'DELIVERED' && (
                        <OrderReviewForm order={order} currentUser={currentUser} />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-amber-500/10 pt-4 mt-4 flex justify-end">
              <button
                onClick={onClose}
                className="bg-amber-500 hover:bg-amber-600 text-black px-5 py-2 rounded-xl text-xs font-bold transition-all"
              >
                Close Tracking
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
