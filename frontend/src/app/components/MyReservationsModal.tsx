"use client";
import React from 'react';
import { X, Calendar, Users, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Reservation {
  id: string;
  tableId: string;
  userId: string;
  guestCount: number;
  reservationDate: string | Date;
  timeSlot: string;
  status: string;
  notes?: string;
  table?: {
    tableNumber: string;
    capacity: number;
  };
}

interface MyReservationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservations: Reservation[];
  currentUser: any;
}

export default function MyReservationsModal({ isOpen, onClose, reservations, currentUser }: MyReservationsModalProps) {
  // Filter reservations for the current user
  const myReservations = reservations.filter(r => 
    currentUser && (r.userId === currentUser.id || currentUser.email === 'customer@dineops.com')
  );

  const getReservationTimeFrame = (dateStr: string | Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const resDate = new Date(dateStr);
    resDate.setHours(0, 0, 0, 0);

    if (resDate.getTime() < today.getTime()) {
      return { label: 'Past', className: 'bg-slate-500/10 text-slate-400 border border-slate-500/20' };
    } else if (resDate.getTime() > today.getTime()) {
      return { label: 'Future', className: 'bg-amber-500/10 text-amber-300 border border-amber-500/20' };
    } else {
      return { label: 'Today', className: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold animate-pulse' };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-xl glass-panel bg-[#0d0a07] border border-amber-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden z-10 flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-500/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-base font-bold text-amber-200 tracking-wide font-mono">
                    Table Reservations Booked
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Active & past table allocations for {currentUser?.name}
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

            {/* List */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
              {myReservations.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center gap-3">
                  <Calendar className="w-12 h-12 text-slate-600 animate-bounce" />
                  <p className="text-sm font-semibold text-slate-400">No table bookings found.</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    You haven't reserved any premium dining tables yet.
                  </p>
                </div>
              ) : (
                myReservations.map((res) => {
                  const timeframe = getReservationTimeFrame(res.reservationDate);
                  const tableNumber = res.table?.tableNumber || res.tableId.replace('tab-', '');
                  
                  return (
                    <div 
                      key={res.id} 
                      className="border border-amber-500/10 rounded-2xl p-4 bg-amber-500/5 hover:border-amber-500/25 transition-all flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-amber-500/5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-amber-300 font-mono">Table {tableNumber}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase tracking-wider ${timeframe.className}`}>
                            {timeframe.label}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {res.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-500/60" />
                          <span>{new Date(res.reservationDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-500/60" />
                          <span>{res.timeSlot}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-amber-500/60" />
                          <span>{res.guestCount} Guests</span>
                        </div>
                      </div>

                      {res.notes && (
                        <p className="text-[10px] text-slate-400 bg-[#14100c] p-2 rounded-lg italic">
                          Notes: {res.notes}
                        </p>
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
                Close History
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
