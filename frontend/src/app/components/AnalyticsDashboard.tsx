"use client";

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, ShoppingBag, Landmark, Download, Sparkles, Brain, ThumbsUp } from 'lucide-react';
import PremiumAlertModal from './PremiumAlertModal';

const mockChartData = [
  { name: 'Jan', sales: 4000, orders: 240 },
  { name: 'Feb', sales: 3000, orders: 198 },
  { name: 'Mar', sales: 5000, orders: 310 },
  { name: 'Apr', sales: 2780, orders: 168 },
  { name: 'May', sales: 6890, orders: 420 },
  { name: 'Jun', sales: 8390, orders: 500 },
];

const mockCategoryData = [
  { name: 'Breakfast Specials', value: 3400 },
  { name: 'Executive Lunches', value: 4500 },
  { name: 'Gourmet Dinners', value: 5200 },
  { name: 'Artisan Chaat', value: 2800 },
  { name: 'Beverages & Coolers', value: 1900 },
  { name: 'Sweet Endings', value: 2200 },
];

interface AnalyticsDashboardProps {
  orders: any[];
  lang: 'EN' | 'HI';
}

export default function AnalyticsDashboard({ orders, lang }: AnalyticsDashboardProps) {
  const [alertConfig, setAlertConfig] = useState<{ title: string, message: string, type?: 'success' | 'info' } | null>(null);
  
  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Month,Revenue,Orders\n"
      + "Jan,4000,240\n"
      + "Feb,3000,198\n"
      + "Mar,5000,310\n"
      + "Apr,2780,168\n"
      + "May,6890,420\n"
      + "Jun,8390,500";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "dineops_sales_report_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const revenueTotal = orders.reduce((sum, o) => sum + Number(o.total || 0), 0) + 30420; // adding baseline mock revenue
  const ordersCount = orders.length + 540;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto py-6 px-4 md:px-8">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: 'Gross Revenue', value: `₹${revenueTotal.toLocaleString()}`, change: '+12.4%', icon: Landmark },
          { title: 'Orders Placed', value: ordersCount, change: '+8.2%', icon: ShoppingBag },
          { title: 'Total Customers', value: '382', change: '+14.1%', icon: Users },
          { title: 'Avg Order Value', value: '₹540.00', change: '+3.5%', icon: TrendingUp }
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="glass-panel p-5 rounded-2xl border border-amber-500/10 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">{m.title}</span>
                <h4 className="text-2xl font-bold text-amber-200 mt-1 font-mono">{m.value}</h4>
                <span className="text-[10px] text-emerald-400 font-bold font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                  {m.change} MTD
                </span>
              </div>
              <div className="p-3.5 bg-amber-500/5 rounded-xl border border-amber-500/10 text-amber-500">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Line Chart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-3xl border border-amber-500/15 flex flex-col justify-between h-80">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h4 className="text-sm font-bold text-amber-200">Gross Sales Trends</h4>
              <p className="text-[10px] text-slate-500">MTD performance overview chart</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/25 hover:bg-amber-500/10 text-[10px] font-mono font-bold text-amber-300 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
          
          <div className="h-56 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.05)" />
                <XAxis dataKey="name" stroke="rgba(212,175,55,0.3)" />
                <YAxis stroke="rgba(212,175,55,0.3)" />
                <Tooltip contentStyle={{ backgroundColor: '#0d0a07', borderColor: 'rgba(212,175,55,0.2)' }} labelStyle={{ color: '#d4af37' }} />
                <Line type="monotone" dataKey="sales" stroke="#d4af37" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart Categories sales */}
        <div className="glass-panel p-5 rounded-3xl border border-amber-500/15 flex flex-col justify-between h-80">
          <div>
            <h4 className="text-sm font-bold text-amber-200">Dishes Performance By Category</h4>
            <p className="text-[10px] text-slate-500">Distribution analysis by sales volume</p>
          </div>
          <div className="h-56 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockCategoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,175,55,0.05)" />
                <XAxis type="number" stroke="rgba(212,175,55,0.3)" />
                <YAxis dataKey="name" type="category" stroke="rgba(212,175,55,0.3)" width={95} />
                <Tooltip contentStyle={{ backgroundColor: '#0d0a07', borderColor: 'rgba(212,175,55,0.2)' }} />
                <Bar dataKey="value" fill="rgba(212,175,55,0.65)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI forecast cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Prediction */}
        <div className="glass-panel p-5 rounded-3xl border border-amber-500/15">
          <div className="flex items-center gap-2 mb-4 border-b border-amber-500/10 pb-3">
            <Brain className="w-5 h-5 text-amber-500" />
            <h4 className="text-sm font-bold text-amber-200 uppercase font-mono tracking-wider">AI Forecast & Demand Insights</h4>
          </div>
          
          <div className="flex flex-col gap-3">
            {[
              { day: 'Friday Night Peak', time: '19:00 - 22:00', load: '94% predicted crowd density', action: 'Suggested staff: 3 Chefs + 2 Cashiers' },
              { day: 'Saturday Brunch Spike', time: '13:00 - 15:30', load: '97% predicted platters spike', action: 'Prepare extra Sourdough & Waffle Mixes' },
              { day: 'Sunday Delivery Wave', time: '18:00 - 21:00', load: '92% delivery order volume', action: 'Onboard +2 courier partners' }
            ].map((p, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex justify-between gap-3 text-xs items-start leading-relaxed">
                <div>
                  <h5 className="font-bold text-amber-100">{p.day} • <span className="font-mono text-amber-400">{p.time}</span></h5>
                  <p className="text-[10px] text-slate-400 mt-1">{p.action}</p>
                </div>
                <span className="text-[10px] font-bold text-amber-300 font-mono shrink-0 bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded">
                  {p.load}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI marketing suggestions & sentiment */}
        <div className="glass-panel p-5 rounded-3xl border border-amber-500/15">
          <div className="flex items-center gap-2 mb-4 border-b border-amber-500/10 pb-3">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h4 className="text-sm font-bold text-amber-200 uppercase font-mono tracking-wider">AI Marketing Campaign Engine</h4>
          </div>

          <div className="flex flex-col gap-3">
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/20 to-slate-900 border border-amber-500/20 text-xs">
              <span className="text-[9px] uppercase tracking-wider text-amber-500 font-bold font-mono">Live Campaign Suggestion</span>
              <h5 className="font-bold text-amber-200 mt-1">Weekend Monsoon Rain Chai Promo</h5>
              <p className="text-slate-400 text-[10px] mt-1 leading-relaxed">Forecasts show rain in Mumbai this Friday. Launch push notifications for DineOps Masala Cutting Chai. Auto voucher code: RAINYBREW (20% Off).</p>
              <button
                onClick={() => setAlertConfig({
                  title: 'Campaign Dispatched',
                  message: 'Monsoon Chai Promo vouchers dispatched to all active database audiences via SMS and push channels.',
                  type: 'success'
                })}
                className="mt-3 bg-amber-500 text-black px-4 py-1.5 rounded-lg font-bold text-[10px] hover:bg-amber-600"
              >
                Dispatch Campaign Vouchers
              </button>
            </div>

            <div className="flex gap-3 justify-between items-center text-xs p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ThumbsUp className="w-4 h-4" />
                <span>Chef MenuItem Review Sentiment</span>
              </div>
              <span className="font-mono text-amber-300 font-bold bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded">
                92% POSITIVE FEEDBACK (AI Evaluated)
              </span>
            </div>
          </div>
        </div>
      </div>

      <PremiumAlertModal
        isOpen={!!alertConfig}
        onClose={() => setAlertConfig(null)}
        title={alertConfig?.title || 'Notification'}
        message={alertConfig?.message || ''}
        type={alertConfig?.type}
      />
    </div>
  );
}
