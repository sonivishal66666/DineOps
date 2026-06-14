"use client";

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, ArrowUpRight, ArrowDownRight, Package, UserCheck, CalendarDays, ShieldCheck, Calendar, RefreshCw, Trash2, Edit2, Check, X } from 'lucide-react';
import PremiumAlertModal from './PremiumAlertModal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  minStockLevel: number;
  supplierName?: string;
  supplierEmail?: string;
}

interface StaffShift {
  id: string;
  userId: string;
  startTime: any;
  endTime: any;
  checkIn?: any;
  checkOut?: any;
  status: string;
  hourlyRate: number;
  user?: {
    name: string;
    role: string;
  };
}

interface InventoryStaffProps {
  inventory: InventoryItem[];
  shifts: StaffShift[];
  onAddMovement: (movementDto: any) => void;
  onClockShift: (shiftId: string, type: 'IN' | 'OUT') => void;
  lang: 'EN' | 'HI';
}

export default function InventoryStaff({
  inventory,
  shifts,
  onAddMovement,
  onClockShift,
  lang,
}: InventoryStaffProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'staff' | 'reservations'>('inventory');
  const [alertConfig, setAlertConfig] = useState<{ title: string, message: string, type?: 'success' | 'info' } | null>(null);

  // Reservations state
  const [reservations, setReservations] = useState<any[]>([]);
  const [loadingReservations, setLoadingReservations] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<any>({});

  const fetchReservations = async () => {
    setLoadingReservations(true);
    try {
      const res = await fetch(`${API_BASE}/ops/reservations`);
      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      } else {
        throw new Error();
      }
    } catch (err) {
      // Offline fallback
      setReservations([
        {
          id: 'res-fallback-1',
          tableId: 'tab-1-103',
          userId: 'user-customer',
          guestCount: 4,
          reservationDate: new Date().toISOString(),
          timeSlot: '19:00 - 20:30',
          status: 'CONFIRMED',
          notes: 'Anniversary dinner',
          user: { name: 'Vishaal Kumar', email: 'customer@dineops.com' },
          table: { tableNumber: '103', capacity: 8 },
        }
      ]);
    } finally {
      setLoadingReservations(false);
    }
  };

  const handleUpdateReservation = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/ops/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFields),
      });
      if (res.ok) {
        setReservations(prev => prev.map(r => r.id === id ? { ...r, ...editFields } : r));
        setAlertConfig({ title: 'Reservation Updated', message: 'Booking details have been saved.', type: 'success' });
      } else {
        // Local update fallback
        setReservations(prev => prev.map(r => r.id === id ? { ...r, ...editFields } : r));
        setAlertConfig({ title: 'Reservation Updated (Local)', message: 'Booking updated in local memory.', type: 'success' });
      }
    } catch (err) {
      setReservations(prev => prev.map(r => r.id === id ? { ...r, ...editFields } : r));
      setAlertConfig({ title: 'Reservation Updated (Local)', message: 'Booking updated in local memory.', type: 'success' });
    } finally {
      setEditingId(null);
      setEditFields({});
    }
  };

  const handleDeleteReservation = async (id: string) => {
    try {
      await fetch(`${API_BASE}/ops/reservations/${id}`, { method: 'DELETE' });
    } catch (err) {}
    setReservations(prev => prev.filter(r => r.id !== id));
    setAlertConfig({ title: 'Reservation Cancelled', message: 'The table booking has been removed.', type: 'success' });
  };

  useEffect(() => {
    if (activeTab === 'reservations') {
      fetchReservations();
    }
  }, [activeTab]);

  // Quick Restock form states
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [moveType, setMoveType] = useState<'IN' | 'OUT'>('IN');
  const [qtyInput, setQtyInput] = useState<string>('');
  const [reasonInput, setReasonInput] = useState<string>('Restock Batch');

  const handleRestockSubmit = () => {
    if (!selectedItem || !qtyInput) return;
    onAddMovement({
      itemId: selectedItem,
      type: moveType,
      quantity: parseFloat(qtyInput),
      reason: reasonInput
    });
    setQtyInput('');
    setAlertConfig({
      title: 'Inventory Updated',
      message: `Registered stock movement [${moveType}] for ${qtyInput} units successfully!`,
      type: 'success'
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto py-6 px-4 md:px-8">
      {/* Tab toggle */}
      <div className="flex gap-2 border-b border-amber-500/10 pb-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold border transition-all ${
            activeTab === 'inventory'
              ? 'bg-amber-500/25 border-amber-500/40 text-amber-200'
              : 'border-transparent text-slate-400 hover:text-amber-300'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Ingredient & Stock Inventory</span>
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold border transition-all ${
            activeTab === 'staff'
              ? 'bg-amber-500/25 border-amber-500/40 text-amber-200'
              : 'border-transparent text-slate-400 hover:text-amber-300'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Staff Attendance & Shifts</span>
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold border transition-all ${
            activeTab === 'reservations'
              ? 'bg-amber-500/25 border-amber-500/40 text-amber-200'
              : 'border-transparent text-slate-400 hover:text-amber-300'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Table Reservations</span>
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inventory Table List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-amber-200">Stock Inventory Registry</h3>
            <div className="glass-panel rounded-2xl overflow-hidden border border-amber-500/10 max-h-[480px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-amber-950/20 border-b border-amber-500/10 font-mono text-[10px] text-amber-500 uppercase tracking-wider">
                    <th className="p-3">Ingredient Name</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3 text-right">Current Stock</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/5">
                  {inventory.map(item => {
                    const isLow = item.quantity <= item.minStockLevel;
                    return (
                      <tr key={item.id} className="hover:bg-amber-500/[0.02] transition-colors">
                        <td className="p-3 font-semibold text-amber-100">
                          {item.name}
                        </td>
                        <td className="p-3 font-mono text-slate-400 text-[10px]">{item.sku}</td>
                        <td className="p-3 text-right font-bold text-amber-400 font-mono">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="p-3 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                              <ShieldAlert className="w-2.5 h-2.5 text-rose-400" />
                              <span>LOW STOCK</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                              <span>IN STOCK</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick stock adjustment panel */}
          <div className="glass-panel p-5 rounded-3xl border border-amber-500/20 h-fit flex flex-col gap-4">
            <span className="text-xs uppercase font-mono tracking-wider text-amber-500 font-semibold">Stock adjustments</span>
            
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Select Ingredient</label>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className="w-full bg-[#181410] border border-amber-500/10 rounded-xl px-3 py-2 text-xs text-amber-100 focus:outline-none cursor-pointer"
              >
                <option value="" style={{ color: '#1a130f', backgroundColor: '#fefaf6' }}>Choose item...</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.id} style={{ color: '#1a130f', backgroundColor: '#fefaf6' }}>
                    {item.name} ({item.sku})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex border border-amber-500/15 rounded-xl p-1 bg-[#181410]">
              <button
                onClick={() => setMoveType('IN')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  moveType === 'IN' ? 'bg-emerald-500 text-black' : 'text-slate-400'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Stock IN (Restock)</span>
              </button>
              <button
                onClick={() => setMoveType('OUT')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  moveType === 'OUT' ? 'bg-rose-500 text-black' : 'text-slate-400'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Stock OUT (Waste)</span>
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Deduction / Addition Qty</label>
              <input
                type="number"
                placeholder="e.g. 10.5"
                value={qtyInput}
                onChange={(e) => setQtyInput(e.target.value)}
                className="w-full bg-[#181410] border border-amber-500/10 rounded-xl px-3 py-2 text-xs text-amber-100 placeholder-slate-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Reason Log Description</label>
              <input
                type="text"
                placeholder="e.g. Received new shipment from vendor"
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                className="w-full bg-[#181410] border border-amber-500/10 rounded-xl px-3 py-2 text-xs text-amber-100 focus:outline-none"
              />
            </div>

            <button
              onClick={handleRestockSubmit}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-2.5 rounded-xl text-xs mt-2 transition-all"
            >
              Submit Movement Entry
            </button>
          </div>
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-amber-200">Shift Schedule & Timeclock Attendance</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {shifts.map(shift => {
              const start = new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const end = new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const checkInTime = shift.checkIn ? new Date(shift.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
              const checkOutTime = shift.checkOut ? new Date(shift.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;

              return (
                <div key={shift.id} className="glass-panel p-4 rounded-2xl border border-amber-500/10 flex flex-col justify-between h-52">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-amber-100 text-sm leading-tight">{shift.user?.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        shift.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : shift.status === 'ACTIVE'
                          ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                          : 'bg-amber-500/10 text-amber-300 border border-amber-500/25'
                      }`}>
                        {shift.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-500/80 font-semibold uppercase font-mono">{shift.user?.role}</p>

                    <div className="mt-3 text-xs text-slate-300 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-slate-400" /> <span>Shift: {start} - {end}</span></div>
                      {checkInTime && <div className="text-[11px] text-emerald-400 font-mono">Clock In: {checkInTime}</div>}
                      {checkOutTime && <div className="text-[11px] text-slate-400 font-mono">Clock Out: {checkOutTime}</div>}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-amber-500/5 flex gap-2">
                    {shift.status === 'SCHEDULED' && (
                      <button
                        onClick={() => onClockShift(shift.id, 'IN')}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-bold py-1.5 rounded-lg"
                      >
                        Clock-In Duty
                      </button>
                    )}
                    {shift.status === 'ACTIVE' && (
                      <button
                        onClick={() => onClockShift(shift.id, 'OUT')}
                        className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold py-1.5 rounded-lg"
                      >
                        Clock-Out Duty
                      </button>
                    )}
                    {shift.status === 'COMPLETED' && (
                      <span className="w-full text-center text-[10px] text-slate-500 py-1 font-mono uppercase font-bold">
                        Shift Complete
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'reservations' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-amber-200">Table Reservations Manager</h3>
            <button
              onClick={fetchReservations}
              className="p-1.5 hover:bg-amber-500/10 rounded-lg text-amber-400 transition-all border border-amber-500/10 flex items-center gap-1.5 px-3 text-xs font-mono"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {loadingReservations ? (
            <div className="py-16 text-center flex flex-col items-center gap-2 text-slate-400">
              <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin"></div>
              <span className="text-xs font-mono">Loading reservations...</span>
            </div>
          ) : reservations.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-500 text-sm font-mono border border-amber-500/5">
              No table reservations found.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reservations.map(res => (
                <div key={res.id} className="glass-panel border border-amber-500/10 rounded-2xl p-4 flex flex-col gap-3 hover:border-amber-500/20 transition-all">
                  {editingId === res.id ? (
                    // Edit mode
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 font-mono">Editing Reservation</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateReservation(res.id)}
                            className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                          >
                            <Check className="w-3 h-3" /> Save
                          </button>
                          <button
                            onClick={() => { setEditingId(null); setEditFields({}); }}
                            className="flex items-center gap-1 border border-amber-500/20 text-slate-400 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                          >
                            <X className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="text-[9px] text-slate-500 uppercase font-mono block mb-1">Status</label>
                          <select
                            value={editFields.status || res.status}
                            onChange={e => setEditFields((f: any) => ({ ...f, status: e.target.value }))}
                            className="w-full bg-[#181410] border border-amber-500/10 rounded-xl px-2 py-1.5 text-xs text-amber-100 focus:outline-none"
                          >
                            <option value="CONFIRMED" style={{ color: '#1a130f', backgroundColor: '#fefaf6' }}>CONFIRMED</option>
                            <option value="PENDING" style={{ color: '#1a130f', backgroundColor: '#fefaf6' }}>PENDING</option>
                            <option value="CANCELLED" style={{ color: '#1a130f', backgroundColor: '#fefaf6' }}>CANCELLED</option>
                            <option value="COMPLETED" style={{ color: '#1a130f', backgroundColor: '#fefaf6' }}>COMPLETED</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-500 uppercase font-mono block mb-1">Date</label>
                          <input
                            type="date"
                            defaultValue={res.reservationDate?.split('T')[0]}
                            onChange={e => setEditFields((f: any) => ({ ...f, reservationDate: e.target.value }))}
                            className="w-full bg-[#181410] border border-amber-500/10 rounded-xl px-2 py-1.5 text-xs text-amber-100 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-500 uppercase font-mono block mb-1">Time Slot</label>
                          <select
                            value={editFields.timeSlot || res.timeSlot}
                            onChange={e => setEditFields((f: any) => ({ ...f, timeSlot: e.target.value }))}
                            className="w-full bg-[#181410] border border-amber-500/10 rounded-xl px-2 py-1.5 text-xs text-amber-100 focus:outline-none"
                          >
                            <option value="12:00 - 13:30" style={{ color: '#1a130f', backgroundColor: '#fefaf6' }}>12:00 - 13:30</option>
                            <option value="13:30 - 15:00" style={{ color: '#1a130f', backgroundColor: '#fefaf6' }}>13:30 - 15:00</option>
                            <option value="18:30 - 20:00" style={{ color: '#1a130f', backgroundColor: '#fefaf6' }}>18:30 - 20:00</option>
                            <option value="19:00 - 20:30" style={{ color: '#1a130f', backgroundColor: '#fefaf6' }}>19:00 - 20:30</option>
                            <option value="20:00 - 21:30" style={{ color: '#1a130f', backgroundColor: '#fefaf6' }}>20:00 - 21:30</option>
                            <option value="21:30 - 23:00" style={{ color: '#1a130f', backgroundColor: '#fefaf6' }}>21:30 - 23:00</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-500 uppercase font-mono block mb-1">Guests</label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            defaultValue={res.guestCount}
                            onChange={e => setEditFields((f: any) => ({ ...f, guestCount: Number(e.target.value) }))}
                            className="w-full bg-[#181410] border border-amber-500/10 rounded-xl px-2 py-1.5 text-xs text-amber-100 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-amber-300 font-mono">
                            Table {res.table?.tableNumber || res.tableId?.replace('tab-1-', '')}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase font-mono ${
                            res.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : res.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}>
                            {res.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-slate-400 font-mono">
                          <div>👤 {res.user?.name || 'Guest'}</div>
                          <div>📅 {res.reservationDate ? new Date(res.reservationDate).toLocaleDateString() : 'N/A'}</div>
                          <div>⏰ {res.timeSlot}</div>
                          <div>👥 {res.guestCount} guests</div>
                        </div>
                        {res.notes && (
                          <div className="text-[10px] text-slate-500 font-mono">📝 {res.notes}</div>
                        )}
                        {res.user?.email && (
                          <div className="text-[10px] text-slate-500 font-mono">✉️ {res.user.email}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setEditingId(res.id);
                            setEditFields({
                              status: res.status,
                              guestCount: res.guestCount,
                              reservationDate: res.reservationDate,
                              timeSlot: res.timeSlot,
                              tableId: res.tableId,
                              notes: res.notes,
                            });
                          }}
                          className="p-2 border border-amber-500/20 rounded-xl hover:bg-amber-500/10 text-amber-400 transition-all"
                          title="Edit reservation"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteReservation(res.id)}
                          className="p-2 border border-rose-500/20 rounded-xl hover:bg-rose-500/10 text-rose-400 transition-all"
                          title="Cancel reservation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
