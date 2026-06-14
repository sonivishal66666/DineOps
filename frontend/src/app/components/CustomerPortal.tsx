"use client";

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Search, Mic, Leaf, Flame, Award, Plus, Minus, X,
  MapPin, Clock, MessageCircle, Bot, Send, Tag, Gift, Wallet,
  CreditCard, Smartphone, Building, Check, Lock, Unlock,
  ChevronRight, Star, Sparkles, UtensilsCrossed, Calendar,
} from 'lucide-react';
import PremiumAlertModal from './PremiumAlertModal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface CustomizationOption {
  name: string;   // backend field is 'name'
  label?: string; // alias — some mocks use 'label'
  price: number;
}

interface Customization {
  name: string;
  options: CustomizationOption[];
}

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  isVeg: boolean;
  isKeto?: boolean;
  isGlutenFree?: boolean;
  isPopular?: boolean;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  customizations?: Customization[];
}

interface Category {
  id: string;
  name: string;
  description?: string;
  sortOrder?: number;
}

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  customizations: string[];
}

interface CustomerPortalProps {
  categories: Category[];
  items: MenuItem[];
  onPlaceOrder: (orderDto: any) => void;
  onReserveTable: (reserveDto: any) => void;
  aiChatbotReply: (msg: string) => Promise<string>;
  lang: 'EN' | 'HI';
  currentUser?: any;
  tables?: any[];
  onUpdateTableStatus?: (tableId: string, status: string) => void;
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function CustomerPortal({
  categories,
  items,
  onPlaceOrder,
  onReserveTable,
  aiChatbotReply,
  lang,
  currentUser,
  tables = [],
  onUpdateTableStatus = () => {},
}: CustomerPortalProps) {

  /* ── Tab / Navigation ── */
  const [activeTab, setActiveTab] = useState<string>('menu');

  /* ── Menu Filters ── */
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterVeg, setFilterVeg] = useState<boolean>(false);
  const [filterKeto, setFilterKeto] = useState<boolean>(false);
  const [filterGluten, setFilterGluten] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>({});

  /* ── Cart ── */
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [dbCoupons, setDbCoupons] = useState<any[]>([]);

  /* ── Customization Modal ── */
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [customSelections, setCustomSelections] = useState<{ [key: string]: string }>({});
  const [customQty, setCustomQty] = useState<number>(1);

  /* ── Checkout ── */
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutType, setCheckoutType] = useState<'DINE_IN' | 'DELIVERY' | 'PICKUP'>('DINE_IN');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [pickupTime, setPickupTime] = useState<string>('');
  const [cookingInstructions, setCookingInstructions] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'WALLET'>('UPI');

  /* ── Payment Simulator ── */
  const [showPaymentSim, setShowPaymentSim] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  /* ── Wallet ── */
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loadingWallet, setLoadingWallet] = useState<boolean>(false);

  /* ── Gifting ── */
  const [selectedGiftAmount, setSelectedGiftAmount] = useState<number | null>(null);
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [giftMessage, setGiftMessage] = useState<string>('');
  const [isSendingGift, setIsSendingGift] = useState<boolean>(false);

  /* ── Table Reservation ── */
  const [resDate, setResDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [resSlot, setResSlot] = useState<string>('DINNER');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [resTable, setResTable] = useState<string>('');
  const [resSuccess, setResSuccess] = useState<boolean>(false);

  /* ── AI Chatbot ── */
  const [showChatbot, setShowChatbot] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([
    { sender: 'bot', text: "Hello! I'm DineOps AI Concierge. I can recommend dishes, help with reservations, or answer any questions. How can I assist you today?" },
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  /* ── Alert Modal ── */
  const [alertConfig, setAlertConfig] = useState<{ title: string; message: string; type?: string } | null>(null);

  /* ─────────────────────────────────────────────
     DERIVED / COMPUTED
  ───────────────────────────────────────────── */
  const filteredItems = items.filter((item) => {
    if (selectedCategory && item.categoryId !== selectedCategory) return false;
    if (filterVeg && !item.isVeg) return false;
    if (filterKeto && !item.isKeto) return false;
    if (filterGluten && !item.isGlutenFree) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const cartSubtotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const gst = Number((cartSubtotal * 0.05).toFixed(2));
  const deliveryFee = checkoutType === 'DELIVERY' ? 40 : 0;

  // Dynamic Coupon code evaluation
  const activeCoupon = dbCoupons.length > 0
    ? dbCoupons.find((c) => c.code === couponCode.toUpperCase().trim() && c.active)
    : null;

  let dynamicDiscount = 0;
  if (activeCoupon) {
    if (cartSubtotal >= Number(activeCoupon.minOrderValue || 0)) {
      if (activeCoupon.discountType === 'PERCENTAGE' || activeCoupon.discountType === 'PERCENT') {
        dynamicDiscount = cartSubtotal * (Number(activeCoupon.value) / 100);
        if (activeCoupon.maxDiscount && dynamicDiscount > Number(activeCoupon.maxDiscount)) {
          dynamicDiscount = Number(activeCoupon.maxDiscount);
        }
      } else {
        dynamicDiscount = Number(activeCoupon.value);
      }
    }
  }

  const finalDiscount = activeCoupon
    ? dynamicDiscount
    : (couponCode.toUpperCase().trim() === 'BREWFIRST' && cartSubtotal >= 300
        ? Math.min(150, cartSubtotal * 0.2)
        : couponCode.toUpperCase().trim() === 'LUXURY50'
        ? 50
        : appliedDiscount);

  const cartTotal = Math.max(0, cartSubtotal + gst + deliveryFee - finalDiscount);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const isAdmin =
    currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';

  /* ─────────────────────────────────────────────
     WALLET
  ───────────────────────────────────────────── */
  const fetchWalletBalance = async () => {
    if (!currentUser) return;
    setLoadingWallet(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${token || 'fake-token'}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.profile?.cashbackBalance || 0);
      }
    } catch {
      setWalletBalance(120);
    } finally {
      setLoadingWallet(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${API_BASE}/ops/coupons`);
      if (res.ok) {
        const data = await res.json();
        setDbCoupons(data);
      }
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchWalletBalance();
      fetchCoupons();
    }
  }, [currentUser]);

  useEffect(() => {
    if (isCheckoutOpen && currentUser) {
      fetchWalletBalance();
      fetchCoupons();
    }
  }, [isCheckoutOpen, currentUser]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchWalletBalance();
      fetchCoupons();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [currentUser]);

  /* ─────────────────────────────────────────────
     VOICE SEARCH
  ───────────────────────────────────────────── */
  const handleVoiceSearch = () => {
    setIsListening(true);
    const mockPhrases = ['paneer tikka', 'biryani', 'masala chai', 'pani puri', 'cheesecake'];
    setTimeout(() => {
      const phrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
      setSearchQuery(phrase);
      setIsListening(false);
    }, 2000);
  };

  /* ─────────────────────────────────────────────
     CART HANDLERS
  ───────────────────────────────────────────── */
  const handleAddToCart = (item: MenuItem) => {
    if (item.customizations && item.customizations.length > 0) {
      setCustomizingItem(item);
      setCustomSelections({});
      setCustomQty(1);
    } else {
      const existing = cart.find((c) => c.menuItemId === item.id && c.customizations.length === 0);
      if (existing) {
        setCart(cart.map((c) =>
          c.id === existing.id ? { ...c, quantity: c.quantity + 1 } : c
        ));
      } else {
        setCart([
          ...cart,
          {
            id: `${item.id}-${Date.now()}`,
            menuItemId: item.id,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: 1,
            customizations: [],
          },
        ]);
      }
    }
  };

  const handleConfirmCustomization = () => {
    if (!customizingItem) return;
    const selectedList = Object.entries(customSelections).map(
      ([groupName, optName]) => `${groupName}: ${optName}`
    );
    const extraCost = customizingItem.customizations?.reduce((sum, group) => {
      const selected = customSelections[group.name];
      const option = group.options.find((o) => (o.name || o.label) === selected);
      return sum + (option ? Number(option.price || 0) : 0);
    }, 0) ?? 0;
    const itemPrice = (customizingItem.price + extraCost) * customQty;

    setCart([
      ...cart,
      {
        id: `${customizingItem.id}-${Date.now()}`,
        menuItemId: customizingItem.id,
        name: customizingItem.name,
        image: customizingItem.image,
        price: customizingItem.price + extraCost,
        quantity: customQty,
        customizations: selectedList,
      },
    ]);
    setCustomizingItem(null);
  };

  const handleUpdateCartQty = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === cartId ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const handleRemoveFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((c) => c.id !== cartId));
  };

  /* ─────────────────────────────────────────────
     CHECKOUT
  ───────────────────────────────────────────── */
  const handleCheckout = () => {
    onPlaceOrder({
      items: cart.map((c) => ({
        menuItemId: c.menuItemId,
        name: c.name,
        quantity: c.quantity,
        price: c.price,
        customizations: c.customizations,
      })),
      type: checkoutType,
      couponCode,
      deliveryAddress,
      cookingNotes: cookingInstructions,
      tableId: checkoutType === 'DINE_IN' ? selectedTable : undefined,
      paymentMethod,
    });
    setCart([]);
    setIsCheckoutOpen(false);
  };

  /* ─────────────────────────────────────────────
     AI CHAT
  ───────────────────────────────────────────── */
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    const botResponse = await aiChatbotReply(userMsg);
    setChatMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
  };

  /* ─────────────────────────────────────────────
     TABS CONFIG
  ───────────────────────────────────────────── */
  const tabs = [
    { id: 'menu', label: '🍽 Menu', icon: UtensilsCrossed },
    { id: 'tables', label: '📅 Reserve', icon: Calendar },
    { id: 'subscriptions', label: '♾ Plans', icon: Star },
    { id: 'gifting', label: '🎁 Gift', icon: Gift },
  ];

  /* ═══════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#0d0a07] text-[#f4ece1] font-sans">

      {/* ── TOP NAVIGATION TABS ── */}
      <div className="sticky top-[60px] md:top-[69px] z-30 bg-gradient-to-b from-[#0d0a07]/95 to-[#0d0a07]/80 backdrop-blur-md border-b border-amber-500/10 px-4 md:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center bg-[#14100c]/80 border border-amber-500/15 p-1 rounded-2xl gap-1 shadow-lg shadow-black/80 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'gifting') {
                      setSelectedGiftAmount(null);
                      setRecipientEmail('');
                      setGiftMessage('');
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-2 group ${
                    isActive
                      ? 'bg-amber-500 text-[#0d0a07] shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-amber-300 hover:bg-amber-500/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0d0a07]' : 'text-amber-500/70 group-hover:text-amber-400'}`} />
                  <span>{tab.label.replace(/[\uD800-\uDFFF].\s+/, '')}</span>
                </button>
              );
            })}
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:from-amber-500/25 hover:to-amber-600/25 border border-amber-500/30 hover:border-amber-500/50 text-amber-300 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg shadow-black/40 group active:scale-95"
          >
            <ShoppingCart className="w-4 h-4 text-amber-500 group-hover:animate-bounce" />
            <span className="hidden sm:inline">My Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-[#0d0a07] text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">

        {/* ══════════════════════════════════════
            MENU TAB
        ══════════════════════════════════════ */}
        {activeTab === 'menu' && (
          <div className="flex flex-col gap-6 w-full">
            {/* Premium Welcome Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-amber-500/15 bg-gradient-to-r from-[#14100c] via-[#211a14] to-[#14100c] p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06),transparent_60%)] pointer-events-none" />
              <div className="z-10 flex-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    Signature Dining
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                </div>
                <h2 className="text-xl md:text-3xl font-extrabold text-amber-100 tracking-tight leading-tight">
                  Welcome back, <span className="bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500 bg-clip-text text-transparent">{currentUser?.name || 'Gourmet Guest'}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-2 max-w-xl leading-relaxed">
                  Indulge in our carefully curated seasonal recipes. Every dish is a blend of premium ingredients and culinary masterclass, tailored for a state-of-the-art dining experience.
                </p>
              </div>
              <div className="z-10 bg-[#1e1710]/50 backdrop-blur-md border border-amber-500/20 rounded-2xl p-4 flex flex-col gap-1 items-center justify-center min-w-[140px] shadow-lg shadow-black/40">
                <span className="text-[9px] font-mono text-amber-500/70 uppercase font-semibold">Gourmet Balance</span>
                <span className="text-lg font-bold text-amber-300 font-mono">₹{walletBalance.toFixed(2)}</span>
                <span className="text-[9px] text-slate-500 font-mono font-medium">Auto-synced</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* ── LEFT SIDEBAR ── */}
            <div className="lg:col-span-1 flex flex-col gap-4">

              {/* Search */}
              <div className="glass-panel p-4 rounded-2xl flex flex-col gap-3">
                <span className="text-xs uppercase font-mono tracking-wider text-amber-500 font-semibold">Search</span>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-500/60" />
                  <input
                    type="text"
                    placeholder="Search dishes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#181410] border border-amber-500/10 rounded-xl pl-8 pr-8 py-2 text-xs text-amber-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/30"
                  />
                  <button
                    onClick={handleVoiceSearch}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg ${
                      isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-amber-500/80 hover:bg-amber-500/10'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div className="glass-panel p-4 rounded-2xl flex flex-col gap-3">
                <span className="text-xs uppercase font-mono tracking-wider text-amber-500 font-semibold">Category</span>
                <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedCategory === ''
                        ? 'bg-amber-500/20 border-amber-500/30 text-amber-200'
                        : 'border-transparent hover:bg-amber-500/5 text-slate-300'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-amber-500/20 border-amber-500/30 text-amber-200'
                          : 'border-transparent hover:bg-amber-500/5 text-slate-300'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary Filters */}
              <div className="glass-panel p-4 rounded-2xl flex flex-col gap-3">
                <span className="text-xs uppercase font-mono tracking-wider text-amber-500 font-semibold">Dietary</span>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterVeg}
                      onChange={(e) => setFilterVeg(e.target.checked)}
                      className="accent-emerald-500 rounded"
                    />
                    <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterKeto}
                      onChange={(e) => setFilterKeto(e.target.checked)}
                      className="accent-amber-500 rounded"
                    />
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>Keto Friendly</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterGluten}
                      onChange={(e) => setFilterGluten(e.target.checked)}
                      className="accent-yellow-400 rounded"
                    />
                    <Award className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Gluten Free</span>
                  </label>
                </div>
              </div>
            </div>

            {/* ── MENU GRID ── */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold font-mono tracking-wide text-amber-200">
                  {selectedCategory
                    ? categories.find((c) => c.id === selectedCategory)?.name
                    : "Chef's Full Selection"}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {filteredItems.length} delicacies
                </span>
              </div>

              {filteredItems.length === 0 ? (
                <div className="glass-panel py-20 text-center text-slate-400 text-sm rounded-2xl">
                  No dishes match your filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="glass-card rounded-2xl overflow-hidden flex flex-col group"
                    >
                      {/* Image */}
                      <div className="aspect-[4/3] w-full relative bg-[#181410] overflow-hidden">
                        {/* Shimmer skeleton */}
                        <div
                          className={`absolute inset-0 skeleton-shimmer transition-opacity duration-500 z-10 ${
                            loadedImages[item.id] ? 'opacity-0 pointer-events-none' : 'opacity-100'
                          }`}
                        />
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          onLoad={() =>
                            setLoadedImages((prev) => ({ ...prev, [item.id]: true }))
                          }
                          className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-out ${
                            loadedImages[item.id] ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                        {/* Veg/Non-veg badge */}
                        <div className="absolute top-3 left-3 bg-[#0d0a07]/80 backdrop-blur-md border border-amber-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1.5 text-[9px] font-bold z-20">
                          <span
                            className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          />
                          <span>{item.isVeg ? 'VEG' : 'NON-VEG'}</span>
                        </div>
                        {/* Popular badge */}
                        {item.isPopular && (
                          <div className="absolute top-3 right-3 z-20">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/90 text-black uppercase flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Chef's Pick
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h4 className="font-bold text-amber-100 text-sm leading-tight">
                              {item.name}
                            </h4>
                            <span className="text-amber-400 font-bold text-sm font-mono shrink-0">
                              ₹{item.price}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                          {/* Nutrition macros */}
                          {item.calories !== undefined && (
                            <div className="mt-2 pt-2 border-t border-amber-500/5 flex justify-between text-[10px] text-slate-500 font-mono">
                              <span>{item.calories} kCal</span>
                              {item.protein !== undefined && <span>P: {item.protein}g</span>}
                              {item.carbohydrates !== undefined && <span>C: {item.carbohydrates}g</span>}
                              {item.fat !== undefined && <span>F: {item.fat}g</span>}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-[#0d0a07] font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

        {/* ══════════════════════════════════════
            TABLE RESERVATION TAB
        ══════════════════════════════════════ */}
        {activeTab === 'tables' && (
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-amber-500/20 max-w-4xl mx-auto w-full">
            <div className="text-center max-w-lg mx-auto mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-200 bg-clip-text text-transparent">
                Reserve Your Premium Dining Experience
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                Select your preferred table from our live floor plan.
              </p>
            </div>

            {resSuccess ? (
              <div className="text-center py-12 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                <span className="text-4xl">🎉</span>
                <h4 className="text-lg font-bold text-emerald-300 mt-3">Reservation Confirmed!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Table {resTable} has been booked for {resDate} — {resSlot} slot.
                </p>
                <button
                  onClick={() => { setResSuccess(false); setResTable(''); }}
                  className="mt-5 bg-amber-500 text-black text-xs font-bold px-5 py-2 rounded-xl hover:bg-amber-600"
                >
                  Book Another Table
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ── Booking Form ── */}
                <div className="flex flex-col gap-4">
                  <span className="text-xs font-mono font-semibold uppercase text-amber-500">
                    Booking Details
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Date</label>
                      <input
                        type="date"
                        value={resDate}
                        onChange={(e) => setResDate(e.target.value)}
                        className="w-full bg-[#181410] border border-amber-500/10 rounded-xl px-3 py-2 text-xs text-amber-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Time Slot</label>
                      <select
                        value={resSlot}
                        onChange={(e) => setResSlot(e.target.value)}
                        className="w-full bg-[#181410] border border-amber-500/10 rounded-xl px-3 py-2 text-xs text-amber-100"
                      >
                        <option value="BREAKFAST">Breakfast</option>
                        <option value="LUNCH">Lunch</option>
                        <option value="DINNER">Dinner</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Guests</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={guestCount}
                        onChange={(e) => setGuestCount(parseInt(e.target.value, 10))}
                        className="w-full bg-[#181410] border border-amber-500/10 rounded-xl px-3 py-2 text-xs text-amber-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Selected Table</label>
                      <input
                        type="text"
                        readOnly
                        placeholder="Click on floor map"
                        value={resTable ? `Table ${resTable}` : ''}
                        className="w-full bg-[#181410] border border-amber-500/10 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold cursor-default"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!resTable) {
                        setAlertConfig({ title: 'Select a Table', message: 'Please click a table on the floor map first.' });
                        return;
                      }
                      onReserveTable({
                        tableId: `tab-1-${resTable}`,
                        guestCount,
                        reservationDate: resDate,
                        timeSlot: resSlot,
                        notes: 'Luxury reserve request',
                      });
                      setResSuccess(true);
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold py-2.5 rounded-xl mt-1"
                  >
                    Confirm Table Reservation
                  </button>

                  {/* ── Admin Controls Panel ── */}
                  {isAdmin && resTable && (
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/25 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold uppercase text-amber-300">
                          Admin Controls: Table {resTable}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Status:{' '}
                          <span className="font-bold text-amber-200 uppercase">
                            {(() => {
                              const tbl = tables.find((t) => t.tableNumber === resTable);
                              return tbl ? tbl.status : 'AVAILABLE';
                            })()}
                          </span>
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            const tbl = tables.find((t) => t.tableNumber === resTable);
                            const tId = tbl ? tbl.id : `tab-1-${resTable}`;
                            onUpdateTableStatus(tId, 'LOCKED');
                            setAlertConfig({ title: 'Table Locked', message: `Table ${resTable} has been locked by admin.`, type: 'success' });
                          }}
                          className="flex items-center justify-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold py-2 rounded-xl transition-all"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          Lock Table
                        </button>
                        <button
                          onClick={() => {
                            const tbl = tables.find((t) => t.tableNumber === resTable);
                            const tId = tbl ? tbl.id : `tab-1-${resTable}`;
                            onUpdateTableStatus(tId, 'AVAILABLE');
                            setAlertConfig({ title: 'Table Unlocked', message: `Table ${resTable} is now available.`, type: 'success' });
                          }}
                          className="flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold py-2 rounded-xl transition-all"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          Unlock Table
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Floor Plan ── */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-amber-500">Live Restaurant Floor Plan</span>
                    <div className="flex gap-3 text-[10px]">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500" />
                        Available
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/30 border border-rose-500" />
                        Occupied
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-900/60 border border-rose-700" />
                        Locked
                      </span>
                    </div>
                  </div>

                  <div className="border border-amber-500/10 bg-[#14100c] rounded-2xl p-6 grid grid-cols-4 gap-4 min-h-[200px] items-center text-center">
                    {(() => {
                      const displayedTables =
                        tables && tables.length > 0
                          ? tables.filter(
                              (t) => parseInt(t.tableNumber, 10) >= 101 && parseInt(t.tableNumber, 10) <= 108
                            )
                          : [
                              { id: 'tab-1-101', tableNumber: '101', capacity: 2, status: 'AVAILABLE' },
                              { id: 'tab-1-102', tableNumber: '102', capacity: 4, status: 'OCCUPIED' },
                              { id: 'tab-1-103', tableNumber: '103', capacity: 8, status: 'RESERVED' },
                              { id: 'tab-1-104', tableNumber: '104', capacity: 2, status: 'AVAILABLE' },
                              { id: 'tab-1-105', tableNumber: '105', capacity: 4, status: 'AVAILABLE' },
                              { id: 'tab-1-106', tableNumber: '106', capacity: 6, status: 'OCCUPIED' },
                              { id: 'tab-1-107', tableNumber: '107', capacity: 2, status: 'AVAILABLE' },
                              { id: 'tab-1-108', tableNumber: '108', capacity: 4, status: 'AVAILABLE' },
                            ];

                      return displayedTables.map((table) => {
                        const nr = table.tableNumber;
                        const cap = table.capacity;
                        const status = table.status;
                        const isLocked = status === 'LOCKED';
                        const isOccupied = status === 'OCCUPIED' || status === 'RESERVED';
                        const isDisabled = !isAdmin && (isLocked || isOccupied);

                        return (
                          <button
                            key={nr}
                            onClick={() => !isDisabled && setResTable(nr)}
                            disabled={isDisabled}
                            className={`h-16 rounded-xl border flex flex-col justify-center items-center gap-1 transition-all ${
                              isLocked
                                ? 'bg-rose-950/40 border-rose-700/50 text-rose-400'
                                : isOccupied
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 cursor-not-allowed'
                                : resTable === nr
                                ? 'bg-amber-500/30 border-amber-500 text-amber-200 scale-105 shadow-lg shadow-amber-500/20'
                                : 'bg-emerald-500/5 hover:bg-emerald-500/15 border-emerald-500/30 text-emerald-300 cursor-pointer'
                            }`}
                          >
                            <span className="font-bold text-xs">T{nr}</span>
                            <span className="text-[9px] opacity-70">{cap} seats</span>
                            {isLocked && <Lock className="w-3 h-3 mt-0.5" />}
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════
            MEAL SUBSCRIPTIONS TAB
        ══════════════════════════════════════ */}
        {activeTab === 'subscriptions' && (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
            <div className="text-center">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-200 bg-clip-text text-transparent">
                Artisan Meal Subscription Plans
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Scheduled catering for corporate, college, or home deliveries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Weekly Lunch Plan',
                  price: 1199,
                  details: '5 Gourmet Lunches, Mon–Fri delivery',
                  points: '120 pts cashback',
                  icon: '🍱',
                },
                {
                  name: 'Monthly Student Plan',
                  price: 3999,
                  details: '20 Meals total, customizable menu',
                  points: '400 pts cashback',
                  icon: '🎓',
                },
                {
                  name: 'Corporate Platinum Elite',
                  price: 9999,
                  details: 'Premium lunch + cold brews daily for 30 days',
                  points: '1000 pts cashback',
                  icon: '💼',
                },
              ].map((plan, i) => (
                <div
                  key={i}
                  className="glass-panel border border-amber-500/20 p-5 rounded-2xl flex flex-col justify-between h-72"
                >
                  <div>
                    <div className="text-3xl mb-3">{plan.icon}</div>
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2.5 py-1 text-[10px] uppercase font-mono font-bold rounded-lg w-fit mb-3">
                      {plan.points}
                    </div>
                    <h4 className="text-base font-bold text-amber-200">{plan.name}</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{plan.details}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-amber-500/5">
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-[10px] text-slate-500 font-mono">Monthly Cost</span>
                      <span className="text-xl font-bold text-amber-400 font-mono">₹{plan.price}</span>
                    </div>
                    <button
                      onClick={() =>
                        setAlertConfig({
                          title: 'Subscription Activated!',
                          message: `You've subscribed to ${plan.name}. Your first delivery is scheduled for tomorrow.`,
                          type: 'success',
                        })
                      }
                      className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 rounded-xl text-xs"
                    >
                      Activate Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            GIFTING TAB
        ══════════════════════════════════════ */}
        {activeTab === 'gifting' && (
          <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
            <div className="text-center">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-200 bg-clip-text text-transparent">
                Luxury Dining Gift Cards
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Give the gift of exceptional culinary experiences to your loved ones.
              </p>
            </div>

            {selectedGiftAmount === null ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { amount: 500, title: 'Starter Gift', desc: 'Perfect for a light brunch or café visit', color: 'from-amber-600 to-amber-800' },
                  { amount: 1000, title: 'Premium Dining', desc: 'Ideal for a full dining experience', color: 'from-yellow-500 to-amber-700' },
                  { amount: 2500, title: 'Elite Experience', desc: 'A lavish multi-course gourmet experience', color: 'from-amber-400 to-yellow-600' },
                  { amount: 5000, title: 'Platinum Prestige', desc: 'The ultimate gifting indulgence', color: 'from-yellow-300 to-amber-500' },
                ].map((card, i) => (
                  <div key={i} className="glass-panel border border-amber-500/20 p-5 rounded-2xl flex flex-col justify-between hover:border-amber-500/40 transition-all duration-300 group bg-[#0a0806]">
                    <div>
                      <div className={`h-28 rounded-xl bg-gradient-to-br ${card.color} flex flex-col items-center justify-between p-4 mb-4 relative overflow-hidden shadow-lg group-hover:shadow-amber-500/5 transition-all`}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-8 -translate-y-8 blur-md" />
                        <div className="w-full flex justify-between items-center z-10">
                          <span className="text-[10px] text-amber-200 font-mono tracking-widest">DineOps Luxury</span>
                          <Gift className="w-4 h-4 text-amber-200" />
                        </div>
                        <span className="text-white font-black text-3xl font-mono z-10">₹{card.amount}</span>
                        <div className="w-full text-right text-[8px] text-amber-200/60 font-mono z-10">VALIDITY: 1 YEAR</div>
                      </div>
                      <h4 className="text-sm font-bold text-amber-200">{card.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{card.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedGiftAmount(card.amount);
                        setRecipientEmail('');
                        setGiftMessage('');
                      }}
                      className="mt-4 w-full bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-[#0d0a07] border border-amber-500/30 text-xs font-bold py-2.5 rounded-xl transition-all duration-300"
                    >
                      Select Card
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel border border-amber-500/20 p-6 rounded-2xl flex flex-col md:flex-row gap-8 bg-[#0a0806] shadow-xl relative">
                {/* Left side: selected card display */}
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className={`w-full max-w-[320px] aspect-[1.58/1] rounded-2xl bg-gradient-to-br ${
                    selectedGiftAmount === 500 ? 'from-amber-600 to-amber-800' :
                    selectedGiftAmount === 1000 ? 'from-yellow-500 to-amber-700' :
                    selectedGiftAmount === 2500 ? 'from-amber-400 to-yellow-600' :
                    'from-yellow-300 to-amber-500'
                  } flex flex-col justify-between p-5 relative overflow-hidden shadow-2xl border border-white/10`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)]" />
                    <div className="w-full flex justify-between items-center">
                      <span className="text-xs text-amber-200 font-mono tracking-widest font-bold">DineOps Premium Gift</span>
                      <Gift className="w-5 h-5 text-amber-100" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-amber-200/80 font-mono">VALUED AT</span>
                      <span className="text-white font-black text-4xl font-mono leading-none">₹{selectedGiftAmount}</span>
                    </div>
                    <div className="w-full flex justify-between items-end text-[9px] text-amber-200/60 font-mono">
                      <span>SECURE TRANSFERS</span>
                      <span>VALIDITY 12M</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedGiftAmount(null)}
                    className="text-xs text-rose-400 hover:text-rose-300 underline font-mono mt-4"
                  >
                    ← Change card amount
                  </button>
                </div>

                {/* Right side: Email input form */}
                <div className="flex-[1.2] flex flex-col gap-4">
                  <h4 className="text-sm font-bold text-amber-200 uppercase tracking-wider font-mono">Gifting Information</h4>
                  <p className="text-[11px] text-slate-400">
                    Enter the email address of the recipient. If they have a DineOps account, this card value will credit directly to their wallet.
                  </p>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[9px] uppercase font-mono text-slate-500 block mb-1">Recipient Gmail / Email</label>
                      <input
                        type="email"
                        placeholder="recipient@gmail.com"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        className="w-full bg-[#16120e] border border-amber-500/15 focus:border-amber-500/40 rounded-xl px-3 py-2 text-xs text-amber-100 placeholder-slate-600 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-mono text-slate-500 block mb-1">Personal Note (Optional)</label>
                      <textarea
                        placeholder="Enjoy a luxurious dining experience on me!"
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        rows={2}
                        className="w-full bg-[#16120e] border border-amber-500/15 focus:border-amber-500/40 rounded-xl px-3 py-2 text-xs text-amber-100 placeholder-slate-600 focus:outline-none transition-all resize-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      if (!recipientEmail.trim()) {
                        setAlertConfig({ title: 'Invalid Email', message: 'Please enter a valid recipient email address.', type: 'warning' });
                        return;
                      }
                      setIsSendingGift(true);
                      try {
                        const token = localStorage.getItem('authToken');
                        const res = await fetch(`${API_BASE}/ops/gift-vouchers/purchase`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                          },
                          body: JSON.stringify({
                            amount: selectedGiftAmount,
                            recipientEmail: recipientEmail.trim(),
                            senderId: currentUser?.id,
                          })
                        });

                        const data = await res.json();
                        if (res.ok) {
                          setAlertConfig({
                            title: 'Gift Card Sent!',
                            message: data.message || `₹${selectedGiftAmount} sent successfully to ${recipientEmail}.`,
                            type: 'success',
                          });
                          setSelectedGiftAmount(null);
                          setRecipientEmail('');
                          setGiftMessage('');
                          // Dispatch updates
                          window.dispatchEvent(new Event('profileUpdated'));
                          fetchWalletBalance();
                        } else {
                          setAlertConfig({
                            title: 'Failed to Send',
                            message: data.message || 'The email address entered might not be registered or system is offline.',
                            type: 'error',
                          });
                        }
                      } catch (err) {
                        setAlertConfig({
                          title: 'Connection Offline',
                          message: 'Unable to contact backend. Falling back to simulated purchase.',
                          type: 'error',
                        });
                        // Fallback simulated success
                        setTimeout(() => {
                          setAlertConfig({
                            title: 'Simulated Purchase Success',
                            message: `Simulated: sent ₹${selectedGiftAmount} gift card to ${recipientEmail}.`,
                            type: 'success',
                          });
                          setSelectedGiftAmount(null);
                          setRecipientEmail('');
                          setGiftMessage('');
                        }, 1000);
                      } finally {
                        setIsSendingGift(false);
                      }
                    }}
                    disabled={isSendingGift}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-[#0d0a07] font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {isSendingGift ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-[#0d0a07] border-t-transparent rounded-full animate-spin" />
                        <span>Sending Credit...</span>
                      </>
                    ) : (
                      <>
                        <Gift className="w-3.5 h-3.5" />
                        <span>Purchase & Credit Wallet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════
          CART SLIDE-OUT PANEL
      ══════════════════════════════════════ */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0d0a07] border-l border-amber-500/20 h-full flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/10">
              <div>
                <h3 className="font-bold text-amber-200 text-base">Your Order Cart</h3>
                <p className="text-[10px] text-slate-400">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-amber-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm gap-3 py-16">
                  <ShoppingCart className="w-10 h-10 opacity-30" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="glass-card rounded-xl p-3 flex gap-3 items-start">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-amber-100 truncate">{item.name}</h4>
                      {item.customizations.length > 0 && (
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">{item.customizations.join(', ')}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateCartQty(item.id, -1)}
                            className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-xs font-bold text-amber-100 w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateCartQty(item.id, 1)}
                            className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <span className="text-xs font-bold text-amber-400 font-mono">
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </span>
                        <button onClick={() => handleRemoveFromCart(item.id)} className="text-slate-500 hover:text-rose-400">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t border-amber-500/10 px-5 py-4 flex flex-col gap-3">
                {/* Coupon */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-[#181410] border border-amber-500/10 rounded-xl px-3 py-2 text-xs text-amber-100 uppercase focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      const code = couponCode.toUpperCase().trim();
                      if (!code) {
                        setAlertConfig({ title: 'Enter Code', message: 'Please enter a coupon code.', type: 'warning' });
                        return;
                      }
                      const matched = dbCoupons.find(c => c.code === code);
                      if (matched) {
                        if (!matched.active) {
                          setAlertConfig({ title: 'Coupon Inactive', message: 'This coupon code has been disabled by the admin.', type: 'error' });
                        } else if (cartSubtotal < matched.minOrderValue) {
                          setAlertConfig({ title: 'Min Order Needed', message: `This coupon requires a minimum order value of ₹${matched.minOrderValue}.`, type: 'info' });
                        } else {
                          const amt = matched.discountType === 'PERCENTAGE' || matched.discountType === 'PERCENT'
                            ? `${matched.value}% off`
                            : `flat ₹${matched.value} off`;
                          setAlertConfig({ title: 'Promo Applied!', message: `Success! Promo code applied: ${amt}.`, type: 'success' });
                        }
                      } else {
                        // Fallback static checks
                        if (code === 'BREWFIRST') {
                          if (cartSubtotal >= 300) {
                            setAlertConfig({ title: 'Promo Applied!', message: '20% off applied (max ₹150) on orders above ₹300.', type: 'success' });
                          } else {
                            setAlertConfig({ title: 'Min Order Needed', message: 'This coupon requires a minimum order value of ₹300.', type: 'info' });
                          }
                        } else if (code === 'LUXURY50') {
                          setAlertConfig({ title: 'Promo Applied!', message: '₹50 flat discount applied.', type: 'success' });
                        } else {
                          setAlertConfig({ title: 'Invalid Code', message: 'The coupon code entered is invalid or expired.', type: 'error' });
                        }
                      }
                    }}
                    className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 px-3 rounded-xl text-xs font-semibold"
                  >
                    Apply
                  </button>
                </div>

                {/* Summary */}
                <div className="flex flex-col gap-1 text-xs font-mono text-slate-400">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{cartSubtotal}</span></div>
                  <div className="flex justify-between"><span>GST (5%)</span><span>₹{gst}</span></div>
                  {finalDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400"><span>Discount</span><span>-₹{finalDiscount}</span></div>
                  )}
                  <div className="flex justify-between text-amber-300 font-bold text-sm pt-1 border-t border-amber-500/10">
                    <span>Total</span><span>₹{cartTotal}</span>
                  </div>
                </div>

                <button
                  onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          CHECKOUT MODAL
      ══════════════════════════════════════ */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-amber-500/30 shadow-2xl p-6 flex flex-col gap-4 relative bg-[#0a0806] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-amber-200 text-base">Complete Your Order</h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-amber-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Type */}
            <div>
              <label className="text-[9px] uppercase tracking-wider text-amber-500 font-semibold block mb-2">Order Type</label>
              <div className="flex border border-amber-500/15 rounded-xl overflow-hidden text-xs">
                {(['DINE_IN', 'DELIVERY', 'PICKUP'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setCheckoutType(type)}
                    className={`flex-1 py-2.5 font-bold transition-colors ${
                      checkoutType === type ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-400 hover:text-amber-300'
                    }`}
                  >
                    {type === 'DINE_IN' ? 'Dine In' : type === 'DELIVERY' ? 'Delivery' : 'Pickup'}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional Fields */}
            <div className="flex flex-col gap-3">
              {checkoutType === 'DELIVERY' && (
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-amber-500 font-semibold block mb-1">Delivery Address</label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full bg-[#181410] border border-amber-500/10 rounded-xl px-3 py-2 text-xs text-amber-100 h-16 resize-none focus:outline-none"
                  />
                </div>
              )}
              {checkoutType === 'DINE_IN' && (
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-amber-500 font-semibold block mb-1">Select Table</label>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="w-full bg-[#181410] border border-amber-500/10 rounded-xl px-3 py-2 text-xs text-amber-100"
                  >
                    <option value="">Choose a Table</option>
                    <option value="tab-1-101">Table 101 (2 seater)</option>
                    <option value="tab-1-103">Table 103 (8 seater)</option>
                    <option value="tab-1-104">Table 104 (2 seater)</option>
                    <option value="tab-1-105">Table 105 (4 seater)</option>
                  </select>
                </div>
              )}
              {checkoutType === 'PICKUP' && (
                <div>
                  <label className="text-[9px] uppercase tracking-wider text-amber-500 font-semibold block mb-1">Scheduled Pickup Time</label>
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-[#181410] border border-amber-500/10 rounded-xl px-3 py-2 text-xs text-amber-100"
                  />
                </div>
              )}
              <div>
                <label className="text-[9px] uppercase tracking-wider text-amber-500 font-semibold block mb-1">Cooking Instructions (optional)</label>
                <textarea
                  value={cookingInstructions}
                  onChange={(e) => setCookingInstructions(e.target.value)}
                  placeholder="e.g. Less spicy, no onion..."
                  className="w-full bg-[#181410] border border-amber-500/10 rounded-xl px-3 py-2 text-xs text-amber-100 h-14 resize-none focus:outline-none placeholder-slate-600"
                />
              </div>
            </div>

            {/* Price Summary */}
            <div className="flex flex-col gap-1 text-xs font-mono text-slate-400 border-t border-amber-500/10 pt-3">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{cartSubtotal}</span></div>
              <div className="flex justify-between"><span>GST 5%</span><span>₹{gst}</span></div>
              {checkoutType === 'DELIVERY' && <div className="flex justify-between"><span>Delivery</span><span>₹40</span></div>}
              {finalDiscount > 0 && <div className="flex justify-between text-emerald-400"><span>Discount</span><span>-₹{finalDiscount}</span></div>}
              <div className="flex justify-between text-amber-300 font-bold text-sm pt-1 border-t border-amber-500/10">
                <span>Total</span><span>₹{cartTotal}</span>
              </div>
            </div>

            {/* Wallet info */}
            {currentUser && (
              <div className="text-[10px] text-slate-400 bg-amber-500/5 border border-amber-500/10 rounded-xl px-3 py-2 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                {loadingWallet ? 'Loading wallet...' : `Cashback Balance: ₹${walletBalance} available`}
              </div>
            )}

            <button
              onClick={() => { setIsCheckoutOpen(false); setShowPaymentSim(true); }}
              disabled={cart.length === 0}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold py-3 rounded-xl text-sm transition-all"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          PAYMENT SIMULATOR MODAL
      ══════════════════════════════════════ */}
      {showPaymentSim && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-amber-500/30 shadow-2xl p-6 flex flex-col gap-5 relative bg-[#0a0806] text-slate-200">

            {/* Close */}
            {!isProcessingPayment && !paymentSuccess && (
              <button
                onClick={() => { setShowPaymentSim(false); setIsCheckoutOpen(true); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-amber-300"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {isProcessingPayment ? (
              <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
                <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                <span className="text-amber-300 text-xs font-bold uppercase tracking-wider animate-pulse">
                  Processing Payment...
                </span>
                <p className="text-[10px] text-slate-400">Communicating with payment gateway...</p>
              </div>
            ) : paymentSuccess ? (
              <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
                  <Check className="w-7 h-7 text-emerald-400" />
                </div>
                <h4 className="text-lg font-bold text-emerald-300">Payment Successful!</h4>
                <p className="text-xs text-slate-400">Your order has been placed. Bon appétit!</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div>
                  <h3 className="font-bold text-amber-200 text-base">Secure Payment</h3>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-slate-500">Order Total</span>
                    <span className="text-lg font-mono font-bold text-amber-400">₹{cartTotal}</span>
                  </div>
                </div>

                {/* Method Selector */}
                <div className="flex border border-amber-500/10 rounded-xl overflow-hidden text-xs">
                  {([
                    { key: 'UPI', label: 'UPI / QR', icon: Smartphone },
                    { key: 'CARD', label: 'Card', icon: CreditCard },
                    { key: 'NETBANKING', label: 'Netbanking', icon: Building },
                    { key: 'WALLET', label: 'Wallet', icon: Wallet },
                  ] as const).map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setPaymentMethod(key)}
                      className={`flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 transition-colors ${
                        paymentMethod === key ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-400 hover:text-amber-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                {/* Method Details */}
                <div className="min-h-[130px] flex items-center justify-center">
                  {paymentMethod === 'UPI' && (
                    <div className="flex flex-col items-center gap-2 text-center w-full">
                      <div className="w-28 h-28 bg-white p-1.5 rounded-xl shadow-lg flex items-center justify-center">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=dineops@cashfree&pn=DineOps&am=${cartTotal}&cu=INR`}
                          alt="UPI QR"
                          className="w-full h-full"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">Scan with any UPI app to pay ₹{cartTotal}</p>
                    </div>
                  )}
                  {paymentMethod === 'CARD' && (
                    <div className="flex flex-col gap-3 w-full">
                      <div>
                        <label className="text-[9px] uppercase font-mono text-slate-500 block mb-1">Card Number</label>
                        <input type="text" defaultValue="4312 8764 9012 3456" disabled
                          className="w-full bg-[#16120e] border border-amber-500/15 rounded-xl px-3 py-2 text-xs text-amber-100 cursor-not-allowed" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] uppercase font-mono text-slate-500 block mb-1">Expiry</label>
                          <input type="text" defaultValue="12/28" disabled
                            className="w-full bg-[#16120e] border border-amber-500/15 rounded-xl px-3 py-2 text-xs text-amber-100 cursor-not-allowed" />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-mono text-slate-500 block mb-1">CVV</label>
                          <input type="password" defaultValue="123" disabled
                            className="w-full bg-[#16120e] border border-amber-500/15 rounded-xl px-3 py-2 text-xs text-amber-100 cursor-not-allowed" />
                        </div>
                      </div>
                    </div>
                  )}
                  {paymentMethod === 'NETBANKING' && (
                    <div className="flex flex-col gap-2 w-full">
                      <label className="text-[9px] uppercase font-mono text-slate-500">Select Bank</label>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map((bank) => (
                          <button
                            key={bank}
                            className="p-2 rounded-xl border border-amber-500/10 hover:border-amber-500/30 bg-white/5 hover:bg-white/10 text-left text-amber-100 font-semibold transition-all"
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {paymentMethod === 'WALLET' && (
                    <div className="flex flex-col gap-2.5 w-full p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Available Wallet Balance:</span>
                        <span className="font-bold text-amber-300 font-mono">₹{walletBalance.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Order Total:</span>
                        <span className="font-bold text-amber-400 font-mono">₹{cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-amber-500/10 pt-2 flex justify-between items-center">
                        <span className="text-slate-200">Remaining Balance:</span>
                        <span className={`font-black font-mono ${walletBalance >= cartTotal ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ₹{(walletBalance - cartTotal).toFixed(2)}
                        </span>
                      </div>
                      {walletBalance < cartTotal ? (
                        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 font-medium text-[10px] leading-relaxed">
                          ⚠️ Insufficient balance in wallet. Please choose another payment method or credit your wallet by sending a gift card to your email.
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-medium text-[10px] leading-relaxed">
                          ✓ Balance verified. Funds will be deducted from your cashback wallet.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Pay Button */}
                <button
                  onClick={() => {
                    setIsProcessingPayment(true);
                    setTimeout(() => {
                      setIsProcessingPayment(false);
                      setPaymentSuccess(true);
                      setTimeout(() => {
                        handleCheckout();
                        setShowPaymentSim(false);
                        setPaymentSuccess(false);
                      }, 1500);
                    }, 2200);
                  }}
                  disabled={paymentMethod === 'WALLET' && walletBalance < cartTotal}
                  className={`w-full font-bold py-3 rounded-xl text-sm transition-all ${
                    paymentMethod === 'WALLET' && walletBalance < cartTotal
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/10'
                  }`}
                >
                  Pay ₹{cartTotal}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          CUSTOMIZATION MODAL
      ══════════════════════════════════════ */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-amber-500/30 shadow-2xl p-6 flex flex-col gap-4 bg-[#0a0806]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-amber-200 text-base">{customizingItem.name}</h3>
                <p className="text-xs text-amber-400 font-mono">₹{customizingItem.price}</p>
              </div>
              <button onClick={() => setCustomizingItem(null)} className="text-slate-400 hover:text-amber-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customization Groups */}
            <div className="flex flex-col gap-4 max-h-64 overflow-y-auto pr-1">
              {customizingItem.customizations?.map((group) => (
                <div key={group.name}>
                  <label className="text-[10px] uppercase font-mono text-amber-500 font-semibold block mb-2">
                    {group.name}
                  </label>
                  <div className="flex flex-col gap-1.5">
                    {group.options.map((opt, optIdx) => {
                      const optText = opt.name || opt.label || `Option ${optIdx + 1}`;
                      const isSelected = customSelections[group.name] === optText;
                      return (
                        <button
                          key={`${group.name}-${optIdx}`}
                          onClick={() => setCustomSelections({ ...customSelections, [group.name]: optText })}
                          style={{
                            background: isSelected ? 'rgba(245,158,11,0.18)' : '#1e1810',
                            border: `1px solid ${isSelected ? 'rgba(245,158,11,0.55)' : 'rgba(245,158,11,0.15)'}`,
                            color: '#fef3c7',
                          }}
                          className="flex justify-between items-center px-3 py-2.5 rounded-xl text-xs font-semibold transition-all w-full"
                        >
                          <span style={{ color: '#fef3c7' }}>{optText}</span>
                          {Number(opt.price) > 0 && (
                            <span style={{ color: '#fbbf24', fontWeight: 700, fontFamily: 'monospace' }}>
                              +₹{Number(opt.price)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between border-t border-amber-500/10 pt-3">
              <span className="text-xs text-slate-400">Quantity</span>
              <div className="flex items-center gap-3 border border-amber-500/10 rounded-xl px-3 py-1.5 bg-[#181410]">
                <button onClick={() => setCustomQty(Math.max(1, customQty - 1))} className="text-amber-500">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-amber-100 w-4 text-center">{customQty}</span>
                <button onClick={() => setCustomQty(customQty + 1)} className="text-amber-500">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCustomizingItem(null)}
                className="py-2.5 rounded-xl border border-amber-500/20 text-slate-400 hover:bg-amber-500/5 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCustomization}
                className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          AI CHATBOT BUBBLE
      ══════════════════════════════════════ */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {showChatbot && (
          <div className="glass-panel w-80 rounded-2xl border border-amber-500/20 shadow-2xl flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="bg-amber-500/10 border-b border-amber-500/15 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-black" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-200">DineOps AI</p>
                  <p className="text-[9px] text-emerald-400">● Online</p>
                </div>
              </div>
              <button onClick={() => setShowChatbot(false)} className="text-slate-400 hover:text-amber-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex flex-col gap-2 p-3 max-h-64 overflow-y-auto bg-[#0d0a07]">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`text-[11px] px-3 py-2 rounded-xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber-500 text-black self-end font-semibold'
                      : 'bg-[#1a1410] border border-amber-500/10 text-slate-200 self-start'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-2 border-t border-amber-500/10 flex gap-1.5 bg-[#14100c]">
              <input
                type="text"
                placeholder="Ask me anything..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                className="flex-1 bg-[#1c1814] border border-amber-500/10 rounded-xl px-2.5 py-1.5 text-xs text-amber-100 placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={sendChatMessage}
                className="bg-amber-500 text-black px-3 rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowChatbot(!showChatbot)}
          className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-600 text-black flex items-center justify-center shadow-2xl shadow-amber-500/30 transition-all hover:scale-105"
        >
          {showChatbot ? <X className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
        </button>
      </div>

      {/* ══════════════════════════════════════
          PREMIUM ALERT MODAL
      ══════════════════════════════════════ */}
      <PremiumAlertModal
        isOpen={!!alertConfig}
        onClose={() => setAlertConfig(null)}
        title={alertConfig?.title || 'Notification'}
        message={alertConfig?.message || ''}
        type={alertConfig?.type as any}
      />
    </div>
  );
}
