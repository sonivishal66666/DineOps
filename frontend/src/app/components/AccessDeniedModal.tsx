"use client";
import React from 'react';
import { ShieldAlert, X, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredRole?: string;
  currentUser?: any;
}

export default function AccessDeniedModal({
  isOpen,
  onClose,
  requiredRole = 'SUPER_ADMIN',
  currentUser
}: AccessDeniedModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md glass-panel bg-[#0d0a07] border-2 border-red-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.15)] relative overflow-hidden z-10 flex flex-col items-center text-center gap-4"
          >
            {/* Warning Shield Graphic */}
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 relative pulse-glow">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
              <Lock className="w-4 h-4 text-red-400 absolute bottom-3 right-3 bg-[#0d0a07] rounded-full p-0.5 border border-red-500/30" />
            </div>

            {/* Header */}
            <div>
              <h3 className="text-lg font-bold text-red-400 uppercase tracking-widest font-mono">
                Security Clearance Alert
              </h3>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                ACCESS_DENIED // ERROR_CODE: 403
              </p>
            </div>

            {/* Error Message */}
            <div className="bg-[#14100c] border border-red-500/10 rounded-2xl p-4 text-xs leading-relaxed text-slate-300">
              <p>
                Only <strong className="text-amber-200">Super Admin Vishal Soni</strong> (logged in as <span className="text-amber-400/90 font-mono">admin@admin</span>) is authorized to toggle operations portals or switch active roles.
              </p>
              {currentUser && (
                <p className="mt-2 pt-2 border-t border-red-500/5 text-[10px] text-slate-400">
                  Current Session: <span className="text-red-400/90 font-bold uppercase">{currentUser.name}</span> ({currentUser.role})
                </p>
              )}
            </div>

            {/* Action button */}
            <button
              onClick={onClose}
              className="w-full mt-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-950/40"
            >
              Acknowledge & Close
            </button>

            {/* Close Button top-right */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
