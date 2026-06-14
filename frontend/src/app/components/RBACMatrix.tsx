"use client";

import React from 'react';
import { Shield, Check, X } from 'lucide-react';

interface RBACMatrixProps {
  lang: 'EN' | 'HI';
}

export default function RBACMatrix({ lang }: RBACMatrixProps) {
  const roles = [
    'Super Admin',
    'Admin',
    'Branch Manager',
    'Chef',
    'Kitchen Staff',
    'Cashier',
    'Delivery Staff',
    'Support Staff',
    'Customer'
  ];

  const permissions = [
    { name: 'Manage Branches & Franchises', allowed: [true, false, false, false, false, false, false, false, false] },
    { name: 'Configure Platform Pricing Plans', allowed: [true, false, false, false, false, false, false, false, false] },
    { name: 'Manage Global Admins', allowed: [true, false, false, false, false, false, false, false, false] },
    { name: 'Manage Menu Dishes & Prices', allowed: [true, true, false, false, false, false, false, false, false] },
    { name: 'Configure Coupons & Promo Campaigns', allowed: [true, true, false, false, false, false, false, false, false] },
    { name: 'Manage Branch Inventory Suppliers', allowed: [true, true, true, false, false, false, false, false, false] },
    { name: 'Manage Shifts & Staff Schedules', allowed: [true, true, true, false, false, false, false, false, false] },
    { name: 'Update Kitchen Prep & Plating', allowed: [false, false, false, true, true, false, false, false, false] },
    { name: 'Clock Shifts & Log Attendances', allowed: [false, false, false, true, true, true, true, true, false] },
    { name: 'Checkout Walk-In orders (POS)', allowed: [true, true, true, false, false, true, false, false, false] },
    { name: 'Live GPS Courier Transits', allowed: [false, false, false, false, false, false, true, false, false] },
    { name: 'Browse Menu & Place Dine-In Cart', allowed: [true, true, true, true, true, true, true, true, true] }
  ];

  return (
    <div className="glass-panel p-6 rounded-3xl border border-amber-500/20 max-w-5xl mx-auto py-6 px-4 md:px-8">
      <div className="flex items-center gap-3 border-b border-amber-500/10 pb-4 mb-6">
        <Shield className="w-6 h-6 text-amber-400" />
        <div>
          <h3 className="text-lg font-bold text-amber-200">DineOps Enterprise Role Permission Matrix</h3>
          <p className="text-xs text-slate-400">Security Access Governance and RBAC Policies</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-amber-950/20 border-b border-amber-500/15 font-mono text-[10px] text-amber-500 uppercase tracking-wider">
              <th className="p-3.5">System Permission Scope</th>
              {roles.map(role => (
                <th key={role} className="p-3.5 text-center whitespace-nowrap">{role}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-500/5">
            {permissions.map((perm, idx) => (
              <tr key={idx} className="hover:bg-amber-500/[0.01] transition-colors">
                <td className="p-3.5 font-semibold text-amber-100">{perm.name}</td>
                {perm.allowed.map((val, roleIdx) => (
                  <td key={roleIdx} className="p-3.5 text-center">
                    {val ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
