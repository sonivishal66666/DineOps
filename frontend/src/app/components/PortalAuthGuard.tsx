"use client";
import React, { useState, useEffect } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, Cpu, Check, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface PortalAuthGuardProps {
  allowedRoles: string[];
  portalName: string;
  children: React.ReactNode;
}

export default function PortalAuthGuard({ allowedRoles, portalName, children }: PortalAuthGuardProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentRole, setCurrentRole] = useState<string>('');
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  
  // Login Form States
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [statusLog, setStatusLog] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('currentUser');
      const savedRole = localStorage.getItem('currentRole');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setCurrentUser(parsed);
          setCurrentRole(savedRole || parsed.role || 'CUSTOMER');
        } catch (e) {}
      }
      setIsHydrated(true);
    }
  }, []);

  const handlePortalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    setStatusLog('DECRYPTING ACCESS SIGNATURES...');

    setTimeout(async () => {
      // Direct Super Admin check
      if (email === 'admin@admin' && password === 'admin') {
        const superAdminUser = { id: 'user-superadmin', name: 'Vishal Soni', email: 'admin@admin', role: 'SUPER_ADMIN' };
        saveSession(superAdminUser, 'SUPER_ADMIN');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        if (res.ok) {
          const data = await res.json();
          saveSession(data.user, data.user.role, data.token);
        } else {
          throw new Error('Verification failed. Invalid email or security code.');
        }
      } catch (err: any) {
        // Fallback Mock logins matching roles
        const userPrefix = email.split('@')[0].toUpperCase();
        const mockCredentials: any = {
          'ADMIN': { id: 'user-admin', name: 'Rajesh Sharma', role: 'ADMIN' },
          'CHEF': { id: 'user-chef', name: 'Chef Marco D\'Souza', role: 'CHEF' },
          'KDS': { id: 'user-staff', name: 'Amit Verma', role: 'CHEF' },
          'CASHIER': { id: 'user-cashier', name: 'Sneha Gupta', role: 'CASHIER' },
          'DELIVERY': { id: 'user-delivery', name: 'Rahul Yadav', role: 'DELIVERY_STAFF' },
          'SUPER': { id: 'user-superadmin', name: 'Vishal Soni', role: 'SUPER_ADMIN' },
        };

        if (mockCredentials[userPrefix] && password === 'password123') {
          saveSession(mockCredentials[userPrefix], mockCredentials[userPrefix].role);
        } else if (email === 'customer@dineops.com' && password === 'password123') {
          saveSession({ id: 'user-customer', name: 'Vishaal Kumar', email: 'customer@dineops.com', role: 'CUSTOMER' }, 'CUSTOMER');
        } else {
          setErrorMsg('Invalid login credentials or credentials mismatch.');
          setIsLoading(false);
        }
      }
    }, 1200);
  };

  const saveSession = (user: any, role: string, token?: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('currentRole', role);
      if (token) {
        localStorage.setItem('authToken', token);
      }
    }
    setCurrentUser(user);
    setCurrentRole(role);
    setIsLoading(false);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentRole');
      localStorage.removeItem('authToken');
    }
    setCurrentUser(null);
    setCurrentRole('');
    setEmail('');
    setPassword('');
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#0d0a07] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin"></div>
      </div>
    );
  }

  // Check if role is authorized
  const hasAccess = currentUser && (allowedRoles.includes(currentRole) || currentRole === 'SUPER_ADMIN');

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#0d0a07] text-[#f4ece1] flex items-center justify-center p-4 relative overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.08),rgba(255,255,255,0))]">
      {/* Dynamic scan line effect when loading */}
      {isLoading && <div className="auth-scanline"></div>}

      <div className="w-full max-w-md">
        {currentUser ? (
          // Authenticated but Unauthorized view
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-8 rounded-3xl border border-rose-500/20 shadow-2xl flex flex-col gap-6 text-center bg-[#0a0806]"
          >
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-2xl mx-auto shadow-[0_0_15px_rgba(244,63,94,0.1)]">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-amber-200 uppercase tracking-widest font-mono">Permission Level Denied</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                You are currently signed in as <strong className="text-amber-100">{currentUser.name}</strong> with role <code className="text-amber-400 font-mono">[{currentRole}]</code>. This role does not have authorization to view the <strong className="text-[#f4ece1]">{portalName}</strong> control center.
              </p>
            </div>

            <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/15 text-[10px] text-slate-500 leading-relaxed font-mono">
              REQUIRED CLEARANCE: {allowedRoles.join(', ')}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out Session</span>
              </button>
            </div>
          </motion.div>
        ) : (
          // Logged Out Portal Authentication Form
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 rounded-3xl border border-amber-500/20 shadow-2xl bg-[#0a0806] flex flex-col gap-6"
          >
            <div className="text-center border-b border-amber-500/10 pb-4">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-amber-200 uppercase tracking-widest font-mono">{portalName} Access Portal</h2>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-mono">Security Checkpoint Clearance</p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono rounded-xl text-center">
                {errorMsg}
              </div>
            )}

            {isLoading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
                <span className="text-amber-300 text-xs font-mono uppercase tracking-wider animate-pulse">{statusLog}</span>
              </div>
            ) : (
              <form onSubmit={handlePortalLogin} className="flex flex-col gap-4">
                <div>
                  <label className="text-[9px] uppercase font-mono tracking-wider text-amber-500/80 font-bold block mb-1">Corporate Email / Username</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="e.g. chef@dineops.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#16120e] border border-amber-500/15 focus:border-amber-500 focus:shadow-[0_0_10px_rgba(245,158,11,0.2)] rounded-xl pl-9 pr-4 py-2.5 text-xs text-amber-100 placeholder-slate-600 focus:outline-none transition-all"
                    />
                    <Mail className="w-4 h-4 text-slate-600 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-mono tracking-wider text-amber-500/80 font-bold block mb-1">Security PIN / Access Key</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#16120e] border border-amber-500/15 focus:border-amber-500 focus:shadow-[0_0_10px_rgba(245,158,11,0.2)] rounded-xl pl-9 pr-10 py-2.5 text-xs text-amber-100 placeholder-slate-600 focus:outline-none transition-all"
                    />
                    <Lock className="w-4 h-4 text-slate-600 absolute left-3 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-600 hover:text-slate-400"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-[9px] text-slate-500 leading-normal flex gap-2 items-start mt-1">
                  <Cpu className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-300">Staff Credentials Notice:</span>
                    <p className="mt-0.5">Please check with your Super Admin for active roles. Common mock accounts use <code className="text-amber-200 font-mono">password123</code> (e.g. chef@dineops.com / cashier@dineops.com).</p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#070503] font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all mt-3 shadow-lg shadow-amber-500/20"
                >
                  Verify Clearance Key
                </button>
              </form>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
