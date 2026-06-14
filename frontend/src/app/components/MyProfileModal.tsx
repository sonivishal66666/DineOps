"use client";
import React, { useState, useEffect } from 'react';
import { X, User, Mail, Award, Wallet, MapPin, Shield, Calendar, AlertTriangle, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface MyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

export default function MyProfileModal({ isOpen, onClose, currentUser }: MyProfileModalProps) {
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'details' | 'bookings' | 'subscriptions'>('details');

  // Editable Form Inputs
  const [birthDateInput, setBirthDateInput] = useState<string>('');
  const [anniversaryDateInput, setAnniversaryDateInput] = useState<string>('');
  const [allergiesInput, setAllergiesInput] = useState<string>('');
  const [homeAddressInput, setHomeAddressInput] = useState<string>('');
  const [homeCityInput, setHomeCityInput] = useState<string>('');
  const [officeAddressInput, setOfficeAddressInput] = useState<string>('');
  const [officeCityInput, setOfficeCityInput] = useState<string>('');

  const fetchProfile = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const res = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token || 'fake-token-if-mock'}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        populateInputs(data);
      } else {
        throw new Error();
      }
    } catch (err) {
      // Offline fallback profile data
      const fallback = {
        id: currentUser.id || 'usr-mock-1',
        name: currentUser.name || 'Vishal Soni',
        email: currentUser.email || 'customer@dineops.com',
        role: currentUser.role || 'CUSTOMER',
        profile: {
          addresses: [
            { id: 'addr-1', label: 'Home', address: '45/B West End Road, Bandra West', city: 'Mumbai', isDefault: true },
            { id: 'addr-2', label: 'Office', address: 'Building 4, Naman Chambers, BKC', city: 'Mumbai', isDefault: false }
          ],
          allergies: ['Gluten (Mild)', 'Nuts'],
          loyaltyPoints: currentUser.role === 'SUPER_ADMIN' ? 5000 : 180,
          loyaltyTier: currentUser.role === 'SUPER_ADMIN' ? 'PLATINUM' : 'SILVER',
          cashbackBalance: currentUser.role === 'SUPER_ADMIN' ? 500 : 75,
          birthDate: '1995-08-15',
          anniversaryDate: '2022-04-18',
        }
      };
      setProfileData(fallback);
      populateInputs(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const populateInputs = (data: any) => {
    if (!data || !data.profile) return;
    setBirthDateInput(data.profile.birthDate || '');
    setAnniversaryDateInput(data.profile.anniversaryDate || '');
    setAllergiesInput(data.profile.allergies?.join(', ') || '');
    
    const home = data.profile.addresses?.find((a: any) => a.id === 'addr-1');
    const office = data.profile.addresses?.find((a: any) => a.id === 'addr-2');
    
    setHomeAddressInput(home?.address || '');
    setHomeCityInput(home?.city || '');
    setOfficeAddressInput(office?.address || '');
    setOfficeCityInput(office?.city || '');
  };

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
      setIsEditing(false);
      setSuccessMsg('');
    }
  }, [isOpen, currentUser]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSuccessMsg('');
    
    const updatedProfile = {
      birthDate: birthDateInput,
      anniversaryDate: anniversaryDateInput,
      allergies: allergiesInput.split(',').map(s => s.trim()).filter(Boolean),
      addresses: [
        { id: 'addr-1', label: 'Home', address: homeAddressInput, city: homeCityInput, isDefault: true },
        { id: 'addr-2', label: 'Office', address: officeAddressInput, city: officeCityInput, isDefault: false }
      ]
    };

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'fake-token-if-mock'}`
        },
        body: JSON.stringify(updatedProfile)
      });
      if (res.ok) {
        setSuccessMsg('Profile details updated successfully!');
        setIsEditing(false);
        fetchProfile();
      } else {
        throw new Error();
      }
    } catch (err) {
      // In local mode, optimistically write changes to the loaded profileData
      setProfileData((prev: any) => ({
        ...prev,
        profile: {
          ...prev.profile,
          birthDate: birthDateInput,
          anniversaryDate: anniversaryDateInput,
          allergies: allergiesInput.split(',').map(s => s.trim()).filter(Boolean),
          addresses: [
            { id: 'addr-1', label: 'Home', address: homeAddressInput, city: homeCityInput, isDefault: true },
            { id: 'addr-2', label: 'Office', address: officeAddressInput, city: officeCityInput, isDefault: false }
          ]
        }
      }));
      setSuccessMsg('Profile details updated in local memory.');
      setIsEditing(false);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch ((tier || '').toUpperCase()) {
      case 'PLATINUM': return 'bg-purple-500/20 text-purple-300 border-purple-500/35';
      case 'GOLD': return 'bg-amber-500/20 text-amber-300 border-amber-500/35';
      case 'SILVER': return 'bg-slate-400/20 text-slate-300 border-slate-400/35';
      default: return 'bg-amber-800/20 text-amber-500 border-amber-800/35';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg glass-panel bg-[#0d0a07] border border-amber-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-500/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-200 tracking-wide font-mono">
                    My Account Profile
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Manage security, loyalty rewards, and addresses
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

            {successMsg && (
              <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-mono rounded-xl text-center mb-3">
                {successMsg}
              </div>
            )}

            {isLoading || !profileData ? (
              <div className="py-20 text-center flex flex-col items-center gap-3 text-slate-400">
                <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin"></div>
                <span className="text-xs font-mono">Retrieving account data...</span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-5">
                {/* Profile card summary */}
                <div className="flex items-center justify-between bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center font-bold text-xl text-black font-sans shrink-0">
                      {profileData.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-amber-100">{profileData.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold border font-mono ${getTierBadgeColor(profileData.profile?.loyaltyTier)}`}>
                          {profileData.profile?.loyaltyTier || 'BRONZE'} MEMBER
                        </span>
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold border border-amber-500/15 bg-amber-500/10 text-amber-300 font-mono">
                          {profileData.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 border border-amber-500/20 rounded-xl hover:bg-amber-500/10 text-amber-400 transition-all flex items-center gap-1.5 text-xs font-bold font-mono"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>EDIT</span>
                    </button>
                  )}
                </div>

                {/* Tab selector */}
                <div className="flex border border-amber-500/10 rounded-xl overflow-hidden text-[10px] font-mono font-bold bg-[#14100c]">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('details'); setIsEditing(false); }}
                    className={`flex-1 py-2 text-center transition-all cursor-pointer ${
                      activeTab === 'details' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-amber-200'
                    }`}
                  >
                    Profile Details
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('bookings'); setIsEditing(false); }}
                    className={`flex-1 py-2 text-center transition-all border-l border-r border-amber-500/10 cursor-pointer ${
                      activeTab === 'bookings' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-amber-200'
                    }`}
                  >
                    Tables ({profileData.reservations?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('subscriptions'); setIsEditing(false); }}
                    className={`flex-1 py-2 text-center transition-all cursor-pointer ${
                      activeTab === 'subscriptions' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-amber-200'
                    }`}
                  >
                    Meal Plans ({profileData.subscriptions?.length || 0})
                  </button>
                </div>

                {activeTab === 'details' && (
                  <>
                    {/* Account Details (Locked Name & Email) */}
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] text-amber-500 uppercase tracking-widest font-mono font-bold">Contact Credentials (Locked)</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-[#14100c]/50 border border-amber-500/5 p-3 rounded-xl flex items-center gap-3 cursor-not-allowed">
                          <Mail className="w-4 h-4 text-slate-500" />
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase font-mono">Email Address</span>
                            <span className="text-slate-400 font-medium break-all">{profileData.email}</span>
                          </div>
                        </div>
                        <div className="bg-[#14100c]/50 border border-amber-500/5 p-3 rounded-xl flex items-center gap-3 cursor-not-allowed">
                          <Shield className="w-4 h-4 text-slate-500" />
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase font-mono">System Account Name</span>
                            <span className="text-slate-400 font-medium">{profileData.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Locations (Editable) */}
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] text-amber-500 uppercase tracking-widest font-mono font-bold">Registered Locations (Editable)</span>
                      <div className="flex flex-col gap-3">
                        {/* Home Address */}
                        <div className="bg-[#14100c] border border-amber-500/5 p-3 rounded-xl flex flex-col gap-2">
                          <div className="flex items-center gap-2 border-b border-amber-500/5 pb-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-400" />
                            <span className="text-[10px] font-bold text-amber-200 uppercase font-mono">Home Address</span>
                          </div>
                          {isEditing ? (
                            <div className="flex flex-col gap-1.5 mt-1 text-xs">
                              <input
                                type="text"
                                placeholder="Street address..."
                                value={homeAddressInput}
                                onChange={(e) => setHomeAddressInput(e.target.value)}
                                className="bg-[#16120e] border border-amber-500/10 focus:border-amber-500/40 rounded-xl px-2.5 py-1.5 text-amber-100 placeholder-slate-600 focus:outline-none"
                              />
                              <input
                                type="text"
                                placeholder="City..."
                                value={homeCityInput}
                                onChange={(e) => setHomeCityInput(e.target.value)}
                                className="bg-[#16120e] border border-amber-500/10 focus:border-amber-500/40 rounded-xl px-2.5 py-1.5 text-amber-100 placeholder-slate-600 focus:outline-none w-1/2"
                              />
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 leading-normal">
                              {homeAddressInput ? `${homeAddressInput}, ${homeCityInput}` : 'No address set.'}
                            </p>
                          )}
                        </div>

                        {/* Office Address */}
                        <div className="bg-[#14100c] border border-amber-500/5 p-3 rounded-xl flex flex-col gap-2">
                          <div className="flex items-center gap-2 border-b border-amber-500/5 pb-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-400" />
                            <span className="text-[10px] font-bold text-amber-200 uppercase font-mono">Office Location</span>
                          </div>
                          {isEditing ? (
                            <div className="flex flex-col gap-1.5 mt-1 text-xs">
                              <input
                                type="text"
                                placeholder="Street address..."
                                value={officeAddressInput}
                                onChange={(e) => setOfficeAddressInput(e.target.value)}
                                className="bg-[#16120e] border border-amber-500/10 focus:border-amber-500/40 rounded-xl px-2.5 py-1.5 text-amber-100 placeholder-slate-600 focus:outline-none"
                              />
                              <input
                                type="text"
                                placeholder="City..."
                                value={officeCityInput}
                                onChange={(e) => setOfficeCityInput(e.target.value)}
                                className="bg-[#16120e] border border-amber-500/10 focus:border-amber-500/40 rounded-xl px-2.5 py-1.5 text-amber-100 placeholder-slate-600 focus:outline-none w-1/2"
                              />
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 leading-normal">
                              {officeAddressInput ? `${officeAddressInput}, ${officeCityInput}` : 'No address set.'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Preferences & Dates (Editable) */}
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] text-amber-500 uppercase tracking-widest font-mono font-bold">Preferences & Dates (Editable)</span>
                      <div className="bg-[#14100c] border border-amber-500/5 p-4 rounded-xl flex flex-col gap-3 text-xs">
                        {/* Allergies */}
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Allergies:
                          </span>
                          {isEditing ? (
                            <input
                              type="text"
                              placeholder="e.g. Nuts, Dairy"
                              value={allergiesInput}
                              onChange={(e) => setAllergiesInput(e.target.value)}
                              className="bg-[#16120e] border border-amber-500/10 focus:border-amber-500/40 rounded-xl px-2.5 py-1 text-amber-100 focus:outline-none text-xs text-right w-44 font-semibold"
                            />
                          ) : (
                            <span className="text-amber-300 font-semibold">{allergiesInput || 'None registered'}</span>
                          )}
                        </div>

                        {/* DOB */}
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-amber-500" /> Date of Birth:
                          </span>
                          {isEditing ? (
                            <input
                              type="date"
                              value={birthDateInput}
                              onChange={(e) => setBirthDateInput(e.target.value)}
                              className="bg-[#16120e] border border-amber-500/10 focus:border-amber-500/40 rounded-xl px-2 py-0.5 text-amber-200 focus:outline-none font-mono text-xs text-right"
                            />
                          ) : (
                            <span className="text-slate-300 font-mono">
                              {birthDateInput ? new Date(birthDateInput).toLocaleDateString() : 'N/A'}
                            </span>
                          )}
                        </div>

                        {/* Anniversary */}
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-amber-500" /> Anniversary:
                          </span>
                          {isEditing ? (
                            <input
                              type="date"
                              value={anniversaryDateInput}
                              onChange={(e) => setAnniversaryDateInput(e.target.value)}
                              className="bg-[#16120e] border border-amber-500/10 focus:border-amber-500/40 rounded-xl px-2 py-0.5 text-amber-200 focus:outline-none font-mono text-xs text-right"
                            />
                          ) : (
                            <span className="text-slate-300 font-mono">
                              {anniversaryDateInput ? new Date(anniversaryDateInput).toLocaleDateString() : 'N/A'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Wallets (Read Only Points/Balances) */}
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] text-amber-500 uppercase tracking-widest font-mono font-bold">My Wallets & Rewards</span>
                      <div className="grid grid-cols-2 gap-3 text-xs text-center">
                        <div className="bg-gradient-to-br from-amber-950/60 to-[#14100c] border border-amber-500/15 p-4 rounded-2xl flex flex-col items-center gap-1.5">
                          <Award className="w-5 h-5 text-amber-500/70 mb-0.5" />
                          <span className="text-[9px] text-slate-500 uppercase font-mono tracking-widest">Loyalty Points</span>
                          <span className="text-xl font-black text-amber-300 font-mono">{profileData.profile?.loyaltyPoints || 0}</span>
                          <span className="text-[9px] text-amber-600/70 font-mono">pts</span>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-950/40 to-[#14100c] border border-emerald-500/20 p-4 rounded-2xl flex flex-col items-center gap-1.5">
                          <Wallet className="w-5 h-5 text-emerald-400/70 mb-0.5" />
                          <span className="text-[9px] text-slate-500 uppercase font-mono tracking-widest">Gift Wallet</span>
                          <span className="text-xl font-black text-emerald-300 font-mono">₹{profileData.profile?.cashbackBalance ?? 0}</span>
                          <span className="text-[9px] text-emerald-600/70 font-mono">redeemable at checkout</span>
                        </div>
                      </div>
                      {(profileData.profile?.cashbackBalance ?? 0) > 0 && (
                        <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-3 py-2">
                          <span className="text-lg">💡</span>
                          <p className="text-[10px] text-emerald-300/80 leading-relaxed">
                            You have <strong className="text-emerald-300">₹{profileData.profile?.cashbackBalance ?? 0}</strong> in your Gift Wallet. Select <span className="font-bold">&ldquo;Pay via Wallet&rdquo;</span> at checkout to use it.
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {activeTab === 'bookings' && (
                  <div className="flex flex-col gap-3 min-h-[300px]">
                    <span className="text-[10px] text-amber-500 uppercase tracking-widest font-mono font-bold">My Table Bookings</span>
                    {(!profileData.reservations || profileData.reservations.length === 0) ? (
                      <div className="text-center py-12 bg-[#14100c]/40 rounded-xl border border-amber-500/5 text-slate-500 text-xs font-mono">
                        No active table bookings found.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5 max-h-[350px] overflow-y-auto pr-1">
                        {profileData.reservations.map((res: any) => (
                          <div key={res.id} className="bg-[#14100c] border border-amber-500/10 p-3.5 rounded-2xl flex flex-col gap-1.5 hover:border-amber-500/25 transition-all">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-amber-300 font-mono">Table {res.tableNumber}</span>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase font-mono ${
                                res.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                              }`}>
                                {res.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono pt-1">
                              <div>📅 Date: {new Date(res.reservationDate).toLocaleDateString()}</div>
                              <div>⏰ Time: {res.timeSlot}</div>
                              <div>👥 Guests: {res.guestCount}</div>
                              <div>📝 Notes: {res.notes || 'None'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'subscriptions' && (
                  <div className="flex flex-col gap-3 min-h-[300px]">
                    <span className="text-[10px] text-amber-500 uppercase tracking-widest font-mono font-bold">Meal Subscriptions</span>
                    {(!profileData.subscriptions || profileData.subscriptions.length === 0) ? (
                      <div className="text-center py-12 bg-[#14100c]/40 rounded-xl border border-amber-500/5 text-slate-500 text-xs font-mono">
                        No active subscriptions found.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5 max-h-[350px] overflow-y-auto pr-1">
                        {profileData.subscriptions.map((sub: any) => (
                          <div key={sub.id} className="bg-[#14100c] border border-amber-500/10 p-4 rounded-2xl flex flex-col gap-3 hover:border-amber-500/25 transition-all">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h5 className="text-xs font-bold text-amber-200 leading-tight">{sub.planName}</h5>
                                <span className="text-[8px] text-slate-500 font-mono block mt-1 uppercase">ID: {sub.id}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase font-mono ${
                                sub.active ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                              }`}>
                                {sub.active ? 'ACTIVE' : 'EXPIRED'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono border-t border-b border-amber-500/5 py-2">
                              <div>🗓️ Starts: {new Date(sub.startDate).toLocaleDateString()}</div>
                              <div>🗓️ Ends: {new Date(sub.endDate).toLocaleDateString()}</div>
                              <div>💰 Price: ₹{sub.pricePaid}</div>
                              <div>🍱 Status: {sub.mealsUsed} / {sub.mealsTotal} meals consumed</div>
                            </div>

                            {/* Progress bar */}
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between text-[8px] font-mono text-slate-500">
                                <span>MEAL TELEMETRY</span>
                                <span>{Math.round((sub.mealsUsed / sub.mealsTotal) * 100)}% USED</span>
                              </div>
                              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-amber-500 transition-all duration-500" 
                                  style={{ width: `${(sub.mealsUsed / sub.mealsTotal) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-amber-500/10 pt-4 mt-4 flex justify-between gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      populateInputs(profileData);
                    }}
                    className="border border-amber-500/20 text-slate-400 hover:bg-amber-500/5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    {isSaving ? (
                      <span className="w-3.5 h-3.5 rounded-full border border-black/20 border-t-black animate-spin"></span>
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Save Changes</span>
                  </button>
                </>
              ) : (
                <>
                  <span />
                  <button
                    onClick={onClose}
                    className="bg-amber-500 hover:bg-amber-600 text-black px-5 py-2 rounded-xl text-xs font-bold transition-all"
                  >
                    Close Profile Card
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
