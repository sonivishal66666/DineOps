"use client";
import React from 'react';
import { ShieldCheck, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PremiumAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
}

export default function PremiumAlertModal({ isOpen, onClose, title, message, type = 'info' }: PremiumAlertModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Alert Content Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-sm glass-panel bg-[#0d0a07] border border-amber-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden z-10 flex flex-col items-center text-center gap-4 animate-glow"
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500">
              {type === 'success' ? <ShieldCheck className="w-6 h-6 text-emerald-400" /> : <Info className="w-6 h-6 text-amber-400" />}
            </div>

            <div>
              <h3 className="text-xs font-bold text-amber-200 tracking-widest font-mono uppercase">{title}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{message}</p>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#0d0a07] font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              Acknowledge
            </button>

            <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
