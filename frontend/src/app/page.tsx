"use client";

import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import CustomerPortal from './components/CustomerPortal';
import POSTerminal from './components/POSTerminal';
import KitchenKDS from './components/KitchenKDS';
import DeliveryDashboard from './components/DeliveryDashboard';
import InventoryStaff from './components/InventoryStaff';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import RBACMatrix from './components/RBACMatrix';
import AccessDeniedModal from './components/AccessDeniedModal';
import MyOrdersModal from './components/MyOrdersModal';
import MyReservationsModal from './components/MyReservationsModal';
import MyProfileModal from './components/MyProfileModal';
import { Search, Moon, Bot, X, User, Lock, UserPlus, LogIn, Sparkles, ChefHat, Flame, Coffee, Pizza, Cake, ArrowRight, ShieldAlert, Landmark, ShieldCheck, Heart, UtensilsCrossed, Mail, Key, Shield, HelpCircle, Terminal, Cpu, Activity, Fingerprint, Eye, EyeOff, Check, Calendar, Gift, Star, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const SLIDESHOW_DATA = [
  {
    img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop&q=85',
    tag: 'ULTRA LUXURY LOUNGE',
    titlePart1: 'Where Every Meal',
    titlePart2: 'Becomes a Memorable Experience.',
    desc: 'Step into DineOps, a glassmorphic culinary room fusing raw industrial design with premium gold accents and exceptional modern gastronomy.'
  },
  {
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1600&auto=format&fit=crop&q=85',
    tag: 'UNCOMPROMISING CULINARY ART',
    titlePart1: 'Crafted Flavors.',
    titlePart2: 'Exceptional Service. Unforgettable Dining.',
    desc: 'Savor premium flame-broiled Miyazaki A5 Wagyu sliders, hand-crafted artisan blends, and truffle fusions prepared under ultra-low thermal indexes.'
  },
  {
    img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&auto=format&fit=crop&q=85',
    tag: 'A WORLD OF EXCELLENCE',
    titlePart1: 'Discover a World of',
    titlePart2: 'Culinary Excellence, One Plate at a Time.',
    desc: 'Experience rich Paneer Butter Masala Naan combos, Old Delhi Style Butter Chicken, and premium desserts infused with botanical essences.'
  },
  {
    img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=1600&auto=format&fit=crop&q=85',
    tag: 'TIMELESS CULINARY HERITAGE',
    titlePart1: 'Fresh Ingredients.',
    titlePart2: 'Timeless Recipes. Modern Dining.',
    desc: 'Sip masterfully extracted espresso elixirs, indulge in local heritage curries, and experience digital table booking with contactless QR bill payment.'
  }
];

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null); // Null means show landing page
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [showAccessDeniedModal, setShowAccessDeniedModal] = useState<boolean>(false);
  const [showOrdersModal, setShowOrdersModal] = useState<boolean>(false);
  const [showReservationsModal, setShowReservationsModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [reservations, setReservations] = useState<any[]>([]);
  
  // Slideshow state
  const [bgIndex, setBgIndex] = useState<number>(0);
  const [scrollY, setScrollY] = useState<number>(0);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const x = (clientX - window.innerWidth / 2) / 60;
    const y = (clientY - window.innerHeight / 2) / 60;
    setMousePos({ x, y });
  };
  
  // Auth Form States
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // High-Tech Scanning State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string>('');
  
  // Interactive Core Spec Terminal Log State
  const [activeSpecTab, setActiveSpecTab] = useState<number>(0);
  
  // Delicacies Carousel & Filter States
  const [delicacyFilter, setDelicacyFilter] = useState<string>('ALL');
  const [delicacyIndex, setDelicacyIndex] = useState<number>(0);

  // AI Concierge Simulator States
  const [chatInput, setChatInput] = useState<string>('');
  const [aiSandboxMessages, setAiSandboxMessages] = useState<any[]>([
    { sender: 'bot', text: 'Welcome! I am DineOps AI Concierge. Select any query card below to watch my cognitive engine dispatch responses.' }
  ]);
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);

  const [currentRole, setCurrentRole] = useState<string>('CUSTOMER');
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  
  // App-wide state
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);

  // Dynamic profile updates fetcher
  const fetchProfileData = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token || !currentUser) return;
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data.profile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchProfileData();
    } else {
      setProfileData(null);
    }
  }, [currentUser]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchProfileData();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [currentUser]);
  
  // Connection states
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([
    { title: 'Welcome to DineOps', body: 'Demo Mode: Switch between Customer Portal, KDS, POS, and Analytics using the top header bar.', time: 'Just now' },
    { title: 'Low Stock Alert', body: 'Aged Truffle Infused Olive Oil has dropped below the 2 liter threshold limit.', time: '5m ago' }
  ]);

  // Sync session with localStorage to persist login state across page refreshes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('currentUser');
      const savedRole = localStorage.getItem('currentRole');
      const savedToken = localStorage.getItem('authToken');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
          if (savedRole) {
            setCurrentRole(savedRole);
          }
          if (savedToken) {
            setAuthToken(savedToken);
          }
        } catch (e) {
          console.error('Restore session failed', e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('currentUser');
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentRole) {
        localStorage.setItem('currentRole', currentRole);
      } else {
        localStorage.removeItem('currentRole');
      }
    }
  }, [currentRole]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (authToken) {
        localStorage.setItem('authToken', authToken);
      } else {
        localStorage.removeItem('authToken');
      }
    }
  }, [authToken]);

  // Slideshow transition interval (3 seconds)
  useEffect(() => {
    if (!currentUser) {
      const timer = setInterval(() => {
        setBgIndex(prev => (prev + 1) % SLIDESHOW_DATA.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [currentUser]);

  // Load baseline mock details if backend fails to connect
  const loadMockBaseline = () => {
    // Categories with Indian Food
    setCategories([
      { id: 'cat-breakfast', name: 'Breakfast Specials', sortOrder: 1 },
      { id: 'cat-italian', name: 'European & Pastas', sortOrder: 2 },
      { id: 'cat-grill', name: 'Gourmet Burgers & Grills', sortOrder: 3 },
      { id: 'cat-meals', name: 'Executive Indian Meals', sortOrder: 4 },
      { id: 'cat-chaat', name: 'Artisan Indian Chaat', sortOrder: 5 },
      { id: 'cat-chinese', name: 'Indo-Chinese Fusions', sortOrder: 6 },
      { id: 'cat-drinks', name: 'Beverages & Coolers', sortOrder: 7 },
      { id: 'cat-desserts', name: 'Sweet Endings', sortOrder: 8 },
    ]);

    // Items including Indian Dishes
    setItems([
      // Breakfast Specials
      { id: 'item-1', categoryId: 'cat-breakfast', name: 'Masala Dosa Combo with Podi', price: 180, image: '/menu/masala-dosa.png', isVeg: true, isVegan: false, isGlutenFree: true, isKeto: false, calories: 340, protein: 8, carbohydrates: 54, fat: 10, allergens: [] },
      { id: 'item-2', categoryId: 'cat-breakfast', name: 'Chole Bhature Premium Outlets', price: 220, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: false, isGlutenFree: false, isKeto: false, calories: 580, protein: 14, carbohydrates: 72, fat: 26, allergens: ['gluten'] },
      { id: 'item-3', categoryId: 'cat-breakfast', name: 'Idli Sambar Ghee Roast Plate', price: 150, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: true, isGlutenFree: true, isKeto: false, calories: 210, protein: 6, carbohydrates: 42, fat: 2, allergens: [] },
      { id: 'item-4', categoryId: 'cat-breakfast', name: 'Rava Upma Bowl with Cashews', price: 130, image: '/menu/rava-upma.png', isVeg: true, isVegan: true, isGlutenFree: false, isKeto: false, calories: 280, protein: 5, carbohydrates: 38, fat: 6, allergens: ['nuts'] },
      { id: 'item-5', categoryId: 'cat-breakfast', name: 'Homestyle Stuffed Aloo Paratha', price: 140, image: '/menu/aloo-paratha.png', isVeg: true, isVegan: false, isGlutenFree: false, isKeto: false, calories: 390, protein: 7, carbohydrates: 52, fat: 14, allergens: ['gluten'] },
      { id: 'item-6', categoryId: 'cat-breakfast', name: 'Fluffy Blueberry Pancakes', price: 210, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: false, isGlutenFree: false, isKeto: false, calories: 350, protein: 6, carbohydrates: 48, fat: 8, allergens: ['gluten', 'dairy'] },
      { id: 'item-7', categoryId: 'cat-breakfast', name: 'French Croissants and Jam', price: 160, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: false, isGlutenFree: false, isKeto: false, calories: 320, protein: 5, carbohydrates: 42, fat: 12, allergens: ['gluten', 'dairy'] },

      // European & Pastas
      { id: 'item-8', categoryId: 'cat-italian', name: 'Pan-Seared Salmon with Asparagus', price: 650, image: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=500&auto=format&fit=crop&q=80', isVeg: false, isVegan: false, isGlutenFree: true, isKeto: true, calories: 480, protein: 38, carbohydrates: 4, fat: 28, allergens: ['seafood'] },
      { id: 'item-9', categoryId: 'cat-italian', name: 'Truffle Mushroom Fettuccine Alfredo', price: 380, image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: false, isGlutenFree: false, isKeto: false, calories: 540, protein: 12, carbohydrates: 58, fat: 24, allergens: ['gluten', 'dairy'] },
      { id: 'item-10', categoryId: 'cat-italian', name: 'Wood-fired Margherita Pizza', price: 320, image: '/menu/margherita-pizza.png', isVeg: true, isVegan: false, isGlutenFree: false, isKeto: false, calories: 680, protein: 22, carbohydrates: 78, fat: 18, allergens: ['gluten', 'dairy'] },
      { id: 'item-11', categoryId: 'cat-italian', name: 'Pesto Genovese Penne Pasta', price: 310, image: '/menu/pesto-penne.png', isVeg: true, isVegan: false, isGlutenFree: false, isKeto: false, calories: 490, protein: 11, carbohydrates: 54, fat: 16, allergens: ['gluten', 'dairy', 'nuts'] },
      { id: 'item-12', categoryId: 'cat-italian', name: 'Four-Cheese Gorgonzola Gnocchi', price: 340, image: '/menu/gnocchi.png', isVeg: true, isVegan: false, isGlutenFree: false, isKeto: false, calories: 520, protein: 14, carbohydrates: 62, fat: 20, allergens: ['gluten', 'dairy'] },
      { id: 'item-13', categoryId: 'cat-italian', name: 'Spaghetti Carbonara Premium', price: 410, image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&auto=format&fit=crop&q=80', isVeg: false, isVegan: false, isGlutenFree: false, isKeto: false, calories: 650, protein: 24, carbohydrates: 68, fat: 26, allergens: ['gluten', 'dairy'] },

      // Gourmet Burgers & Grills
      { id: 'item-14', categoryId: 'cat-grill', name: 'A5 Miyazaki Wagyu Sliders', price: 920, image: '/menu/wagyu-sliders.png', isVeg: false, isVegan: false, isGlutenFree: false, isKeto: false, calories: 720, protein: 32, carbohydrates: 48, fat: 34, allergens: ['gluten'] },
      { id: 'item-15', categoryId: 'cat-grill', name: 'Classic Caesar Salad with Chicken', price: 290, image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&auto=format&fit=crop&q=80', isVeg: false, isVegan: false, isGlutenFree: false, isKeto: false, calories: 340, protein: 18, carbohydrates: 12, fat: 16, allergens: ['gluten', 'dairy'] },
      { id: 'item-16', categoryId: 'cat-grill', name: 'Gourmet Cottage Cheese Steak', price: 320, image: '/menu/paneer-steak.png', isVeg: true, isVegan: false, isGlutenFree: true, isKeto: true, calories: 450, protein: 22, carbohydrates: 8, fat: 32, allergens: ['dairy'] },
      { id: 'item-17', categoryId: 'cat-grill', name: 'Smoked BBQ Chicken Wings', price: 280, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80', isVeg: false, isVegan: false, isGlutenFree: true, isKeto: true, calories: 510, protein: 28, carbohydrates: 6, fat: 24, allergens: [] },
      { id: 'item-18', categoryId: 'cat-grill', name: 'Flame-broiled Ribeye Steak', price: 850, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80', isVeg: false, isVegan: false, isGlutenFree: true, isKeto: true, calories: 780, protein: 48, carbohydrates: 0, fat: 52, allergens: [] },
      { id: 'item-19', categoryId: 'cat-grill', name: 'DineOps Signature Chicken Club', price: 260, image: '/menu/chicken-club.png', isVeg: false, isVegan: false, isGlutenFree: false, isKeto: false, calories: 510, protein: 26, carbohydrates: 42, fat: 18, allergens: ['gluten', 'dairy'] },

      // Executive Indian Meals
      { id: 'item-20', categoryId: 'cat-meals', name: 'Rajma Chawal Executive Bowl', price: 240, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: true, isGlutenFree: true, isKeto: false, calories: 450, protein: 12, carbohydrates: 68, fat: 8, allergens: [] },
      { id: 'item-21', categoryId: 'cat-meals', name: 'Shahi Paneer Butter Masala', price: 320, image: '/menu/paneer-butter-masala.png', isVeg: true, isVegan: false, isGlutenFree: true, isKeto: false, calories: 510, protein: 16, carbohydrates: 18, fat: 42, allergens: ['dairy'] },
      { id: 'item-22', categoryId: 'cat-meals', name: 'Gourmet Butter Naan Basket (3pcs)', price: 90, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: false, isGlutenFree: false, isKeto: false, calories: 340, protein: 8, carbohydrates: 54, fat: 12, allergens: ['gluten', 'dairy'] },
      { id: 'item-23', categoryId: 'cat-meals', name: 'Classic Chicken Tikka Platter', price: 380, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&auto=format&fit=crop&q=80', isVeg: false, isVegan: false, isGlutenFree: true, isKeto: true, calories: 420, protein: 32, carbohydrates: 6, fat: 18, allergens: ['dairy'] },
      { id: 'item-24', categoryId: 'cat-meals', name: 'Spiced Paneer Tikka Kebab', price: 320, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: false, isGlutenFree: true, isKeto: true, calories: 380, protein: 18, carbohydrates: 8, fat: 22, allergens: ['dairy'] },
      { id: 'item-25', categoryId: 'cat-meals', name: 'Hyderabadi Dum Chicken Biryani', price: 390, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80', isVeg: false, isVegan: false, isGlutenFree: true, isKeto: false, calories: 720, protein: 32, carbohydrates: 88, fat: 22, allergens: ['dairy'] },
      { id: 'item-26', categoryId: 'cat-meals', name: 'Royal Rajasthani Thali', price: 490, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: false, isGlutenFree: false, isKeto: false, calories: 920, protein: 24, carbohydrates: 110, fat: 38, allergens: ['gluten', 'dairy'] },

      // Artisan Indian Chaat
      { id: 'item-27', categoryId: 'cat-chaat', name: 'Mumbai Special Vada Pav (2pcs)', price: 90, image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: true, isGlutenFree: false, isKeto: false, calories: 310, protein: 8, carbohydrates: 48, fat: 12, allergens: ['gluten'] },
      { id: 'item-28', categoryId: 'cat-chaat', name: 'Delhi Dahi Papdi Chaat Deluxe', price: 120, image: '/menu/papdi-chaat.png', isVeg: true, isVegan: false, isGlutenFree: false, isKeto: false, calories: 280, protein: 6, carbohydrates: 45, fat: 8, allergens: ['gluten', 'dairy'] },
      { id: 'item-29', categoryId: 'cat-chaat', name: 'Spicy Pani Puri Golgappa Plate', price: 100, image: 'https://images.unsplash.com/photo-1605333396915-47ed6b68a00e?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: true, isGlutenFree: false, isKeto: false, calories: 180, protein: 4, carbohydrates: 36, fat: 3, allergens: ['gluten'] },
      { id: 'item-30', categoryId: 'cat-chaat', name: 'Samosa Chaat Mint Chutney', price: 110, image: '/menu/samosa-chaat.png', isVeg: true, isVegan: false, isGlutenFree: false, isKeto: false, calories: 340, protein: 6, carbohydrates: 42, fat: 10, allergens: ['gluten', 'dairy'] },
      { id: 'item-31', categoryId: 'cat-chaat', name: 'Crispy Aloo Tikki Chaat', price: 110, image: '/menu/papdi-chaat.png', isVeg: true, isVegan: false, isGlutenFree: false, isKeto: false, calories: 320, protein: 5, carbohydrates: 38, fat: 12, allergens: ['gluten', 'dairy'] },
      { id: 'item-32', categoryId: 'cat-chaat', name: 'Bhel Puri Street Style', price: 100, image: '/menu/samosa-chaat.png', isVeg: true, isVegan: true, isGlutenFree: false, isKeto: false, calories: 210, protein: 4, carbohydrates: 32, fat: 4, allergens: ['gluten'] },
      { id: 'item-33', categoryId: 'cat-chaat', name: 'Sev Puri Classic', price: 110, image: '/menu/papdi-chaat.png', isVeg: true, isVegan: false, isGlutenFree: false, isKeto: false, calories: 230, protein: 4, carbohydrates: 34, fat: 6, allergens: ['gluten', 'dairy'] },

      // Indo-Chinese Fusions
      { id: 'item-34', categoryId: 'cat-chinese', name: 'Hakka Noodles', price: 260, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: true, isGlutenFree: false, isKeto: false, calories: 380, protein: 8, carbohydrates: 62, fat: 10, allergens: ['gluten', 'soy'] },
      { id: 'item-35', categoryId: 'cat-chinese', name: 'Veg Manchurian', price: 280, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: true, isGlutenFree: false, isKeto: false, calories: 340, protein: 6, carbohydrates: 48, fat: 12, allergens: ['gluten', 'soy'] },
      { id: 'item-36', categoryId: 'cat-chinese', name: 'Crispy Spring Rolls', price: 220, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: true, isGlutenFree: false, isKeto: false, calories: 290, protein: 5, carbohydrates: 36, fat: 11, allergens: ['gluten', 'soy'] },

      // Beverages & Coolers
      { id: 'item-37', categoryId: 'cat-drinks', name: 'Saffron Cardamom Cappuccino', price: 160, image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: false, isGlutenFree: true, isKeto: false, calories: 120, protein: 4, carbohydrates: 18, fat: 4, allergens: ['dairy'] },
      { id: 'item-38', categoryId: 'cat-drinks', name: 'DineOps Masala Cutting Chai', price: 80, image: '/menu/cutting-chai.png', isVeg: true, isVegan: false, isGlutenFree: true, isKeto: false, calories: 95, protein: 2, carbohydrates: 15, fat: 3, allergens: ['dairy'] },
      { id: 'item-39', categoryId: 'cat-drinks', name: 'Mango Lassi Cardamom Cooler', price: 140, image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: false, isGlutenFree: true, isKeto: false, calories: 240, protein: 4, carbohydrates: 46, fat: 2, allergens: ['dairy'] },
      { id: 'item-40', categoryId: 'cat-drinks', name: 'Nimbu Masala Botanical Fizz', price: 120, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: true, isGlutenFree: true, isKeto: false, calories: 85, protein: 0, carbohydrates: 21, fat: 0, allergens: [] },
      { id: 'item-41', categoryId: 'cat-drinks', name: 'DineOps Signature Cold Brew', price: 180, image: '/menu/cold-coffee.png', isVeg: true, isVegan: true, isGlutenFree: true, isKeto: true, calories: 10, protein: 0, carbohydrates: 1, fat: 0, allergens: [] },
      { id: 'item-42', categoryId: 'cat-drinks', name: 'Sweet Badam Kesari Milk', price: 150, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: false, isGlutenFree: true, isKeto: false, calories: 260, protein: 6, carbohydrates: 34, fat: 8, allergens: ['dairy', 'nuts'] },
      { id: 'item-43', categoryId: 'cat-drinks', name: 'Classic Mint Mojito', price: 160, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: true, isGlutenFree: true, isKeto: false, calories: 110, protein: 0, carbohydrates: 28, fat: 0, allergens: [] },

      // Sweet Endings
      { id: 'item-44', categoryId: 'cat-desserts', name: 'Classic Espresso Tiramisu', price: 210, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: false, isGlutenFree: false, isKeto: false, calories: 380, protein: 6, carbohydrates: 44, fat: 16, allergens: ['gluten', 'dairy'] },
      { id: 'item-45', categoryId: 'cat-desserts', name: 'Saffron Rabri Rasmalai Deluxe', price: 180, image: '/menu/rasmalai.png', isVeg: true, isVegan: false, isGlutenFree: true, isKeto: false, calories: 320, protein: 8, carbohydrates: 38, fat: 14, allergens: ['dairy'] },
      { id: 'item-46', categoryId: 'cat-desserts', name: 'Warm Chocolate Lava Cake with Gelato', price: 190, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: false, isGlutenFree: false, isKeto: false, calories: 410, protein: 6, carbohydrates: 62, fat: 16, allergens: ['gluten', 'dairy'] },
      { id: 'item-47', categoryId: 'cat-desserts', name: 'Kesar Kulfi Falooda Bowl', price: 170, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: false, isGlutenFree: true, isKeto: false, calories: 310, protein: 7, carbohydrates: 45, fat: 11, allergens: ['dairy', 'nuts'] },
      { id: 'item-48', categoryId: 'cat-desserts', name: 'Hot Jalebi with Saffron Rabri', price: 160, image: '/menu/jalebi.png', isVeg: true, isVegan: false, isGlutenFree: false, isKeto: false, calories: 390, protein: 5, carbohydrates: 58, fat: 12, allergens: ['gluten', 'dairy'] },
      { id: 'item-49', categoryId: 'cat-desserts', name: 'Creamy New York Cheesecake', price: 240, image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80', isVeg: true, isVegan: false, isGlutenFree: false, isKeto: false, calories: 430, protein: 8, carbohydrates: 42, fat: 24, allergens: ['gluten', 'dairy'] }
    ]);

    // Tables
    setTables([
      { id: 'tab-1-101', tableNumber: '101', capacity: 2, status: 'AVAILABLE', waiterNeeded: false, billRequested: false },
      { id: 'tab-1-102', tableNumber: '102', capacity: 4, status: 'OCCUPIED', waiterNeeded: false, billRequested: false },
      { id: 'tab-1-103', tableNumber: '103', capacity: 8, status: 'RESERVED', waiterNeeded: false, billRequested: false },
      { id: 'tab-1-104', tableNumber: '104', capacity: 2, status: 'AVAILABLE', waiterNeeded: false, billRequested: false },
      { id: 'tab-1-105', tableNumber: '105', capacity: 4, status: 'AVAILABLE', waiterNeeded: false, billRequested: false },
    ]);

    // Inventory
    setInventory([
      { id: 'inv-1', name: 'Premium Arabica Coffee Beans', sku: 'INV-COF-003', quantity: 24.5, unit: 'kg', minStockLevel: 15.0 },
      { id: 'inv-2', name: 'Organic Sourdough Bread Flour', sku: 'INV-FLR-001', quantity: 64.0, unit: 'kg', minStockLevel: 20.0 },
      { id: 'inv-3', name: 'A5 Miyazaki Wagyu Beef', sku: 'INV-BEEF-002', quantity: 18.0, unit: 'kg', minStockLevel: 5.0 },
      { id: 'inv-4', name: 'Aged Truffle Infused Olive Oil', sku: 'INV-OIL-004', quantity: 1.2, unit: 'liters', minStockLevel: 2.0 },
    ]);

    // Shifts
    setShifts([
      { id: 'sh-1', userId: 'usr-1', status: 'ACTIVE', startTime: new Date(), endTime: new Date(), user: { name: 'Chef Marco D\'Souza', role: 'CHEF' } },
      { id: 'sh-2', userId: 'usr-2', status: 'SCHEDULED', startTime: new Date(), endTime: new Date(), user: { name: 'Rahul Yadav', role: 'DELIVERY_STAFF' } },
      { id: 'sh-3', userId: 'usr-3', status: 'ACTIVE', startTime: new Date(), endTime: new Date(), user: { name: 'Sneha Gupta', role: 'CASHIER' } },
    ]);

    // Reservations
    setReservations([
      {
        id: 'res-1',
        tableId: 'tab-1-101',
        userId: 'user-customer',
        guestCount: 2,
        reservationDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        timeSlot: '12:00 - 13:30',
        status: 'CONFIRMED',
        notes: 'Anniversary dinner',
        table: { tableNumber: '101', capacity: 2 }
      },
      {
        id: 'res-2',
        tableId: 'tab-1-103',
        userId: 'user-customer',
        guestCount: 4,
        reservationDate: new Date(),
        timeSlot: '19:00 - 20:30',
        status: 'CONFIRMED',
        notes: 'Window seat preferred',
        table: { tableNumber: '103', capacity: 8 }
      },
      {
        id: 'res-3',
        tableId: 'tab-1-105',
        userId: 'user-customer',
        guestCount: 2,
        reservationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        timeSlot: '20:30 - 22:00',
        status: 'CONFIRMED',
        notes: 'Birthday celebration',
        table: { tableNumber: '105', capacity: 4 }
      }
    ]);

    // Orders
    setOrders([
      { id: 'ord-101', orderNumber: 'BH-2026-9042', status: 'PREPARING', type: 'DINE_IN', total: 769, createdAt: new Date(Date.now() - 15 * 60 * 1000), items: [{ name: 'DineOps Signature Cold Brew', quantity: 2 }, { name: 'A5 Miyazaki Wagyu Sliders', quantity: 1 }] },
      { id: 'ord-102', orderNumber: 'BH-2026-9043', status: 'READY', type: 'DELIVERY', total: 1052, deliveryAddress: 'Apt 4B, Signature Residency, Bandra', otp: '4820', createdAt: new Date(Date.now() - 5 * 60 * 1000), items: [{ name: 'Avocado Rose Sourdough Toast', quantity: 2 }] }
    ]);
  };

  // Sync with NestJS Backend
  const syncWithBackend = async () => {
    try {
      const resMenu = await fetch(`${API_BASE}/menu/categories`);
      if (!resMenu.ok) throw new Error();
      
      const cats = await resMenu.json();
      setCategories(cats);

      const resItems = await fetch(`${API_BASE}/menu/items`);
      const itemsData = await resItems.json();
      setItems(itemsData);

      const resOrders = await fetch(`${API_BASE}/orders`);
      const ordersData = await resOrders.json();
      setOrders(ordersData);

      const resTables = await fetch(`${API_BASE}/ops/tables`);
      const tablesData = await resTables.json();
      setTables(tablesData);

      try {
        const resResv = await fetch(`${API_BASE}/ops/reservations`);
        if (resResv.ok) {
          const resvData = await resResv.json();
          setReservations(resvData);
        }
      } catch (rErr) {}

      const resInv = await fetch(`${API_BASE}/ops/inventory`);
      const invData = await resInv.json();
      setInventory(invData);

      const resShifts = await fetch(`${API_BASE}/ops/shifts`);
      const shiftsData = await resShifts.json();
      setShifts(shiftsData);

      setIsBackendConnected(true);

      // Poll backend notifications for logged-in user
      if (currentUser) {
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
          if (token) {
            const resNotifs = await fetch(`${API_BASE}/auth/notifications`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resNotifs.ok) {
              const notifData = await resNotifs.json();
              if (Array.isArray(notifData) && notifData.length > 0) {
                const formattedNotifs = notifData.map((n: any) => ({
                  title: n.title,
                  body: n.body,
                  time: 'Just now'
                }));
                setNotifications(prev => [...formattedNotifs, ...prev]);
              }
            }
          }
        } catch (notifErr) {
          // Notification polling optional - silent failure
        }
      }
    } catch (err) {
      console.warn('API backend offline. Launching fallback interactive dashboard modes.');
      setIsBackendConnected(false);
      loadMockBaseline();
    }
  };

  useEffect(() => {
    syncWithBackend();
    const interval = setInterval(syncWithBackend, 3000);
    return () => clearInterval(interval);
  }, []);

  const prevStatusesRef = useRef<{ [key: string]: string }>({});
  const prevInventoryRef = useRef<{ [key: string]: number }>({});
 
  useEffect(() => {
    if (!currentUser) return;
    const newNotifications: any[] = [];
    const isInitialized = Object.keys(prevStatusesRef.current).length > 0;
 
    orders.forEach(ord => {
      const isMyOrder = 
        ord.customerEmail === currentUser.email || 
        ord.customerId === currentUser.id || 
        currentUser.email === 'customer@dineops.com' ||
        currentUser.role === 'SUPER_ADMIN';
 
      if (isMyOrder) {
        const prevStatus = prevStatusesRef.current[ord.id];
        if (prevStatus && prevStatus !== ord.status) {
          const cleanStatus: { [key: string]: string } = {
            'ORDER_PLACED': 'Placed',
            'ACCEPTED': 'Accepted',
            'PREPARING': 'Preparing / Cooking',
            'COOKING': 'Being Prepared',
            'PACKED': 'Boxed & Ready',
            'READY': 'Food Ready for Pickup',
            'DELIVERED': 'Delivered Successfully ✓'
          };
          const statusText = cleanStatus[ord.status] || ord.status;
          newNotifications.push({
            title: `Order Status: ${statusText}`,
            body: `Your ticket ${ord.orderNumber} status changed from [${prevStatus}] to [${ord.status}].`,
            time: 'Just now'
          });
        } else if (prevStatus === undefined) {
          if (isInitialized) {
            newNotifications.push({
              title: `New Order Placed`,
              body: `Ticket ${ord.orderNumber} has been placed for ₹${ord.total}.`,
              time: 'Just now'
            });
          }
        }
      }
      prevStatusesRef.current[ord.id] = ord.status;
    });
 
    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev]);
    }
  }, [orders, currentUser]);

  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) return;
    if (inventory.length === 0) return;
    const newNotifications: any[] = [];
    const isInitialized = Object.keys(prevInventoryRef.current).length > 0;

    inventory.forEach(item => {
      const prevQty = prevInventoryRef.current[item.id];
      const currentQty = Number(item.quantity);
      const minLevel = Number(item.minStockLevel);

      if (currentQty < minLevel && (prevQty === undefined || prevQty >= minLevel)) {
        if (isInitialized) {
          newNotifications.push({
            title: 'Low Stock Alert',
            body: `${item.name} has dropped below the ${item.minStockLevel} ${item.unit} threshold limit.`,
            time: 'Just now'
          });
        }
      }
      prevInventoryRef.current[item.id] = currentQty;
    });

    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev]);
    }
  }, [inventory, currentUser]);

  // Login handler with animated scan line
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsScanning(true);
    setScanMessage('INITIALIZING CYBER AUTH KEYCARD...');
    
    setTimeout(async () => {
      setScanMessage('DECRYPTING CREDENTIAL TOKEN AND ROLES...');
      setTimeout(async () => {
        setScanMessage('FINALIZING JWT SECURITY CLEARANCE...');
        setTimeout(async () => {
          setIsScanning(false);
          
          // Check credentials explicitly for Super Admin
          if (email === 'admin@admin' && password === 'admin') {
            const superAdminUser = { name: 'Vishal Soni', email: 'admin@admin', role: 'SUPER_ADMIN' };
            setCurrentUser(superAdminUser);
            setCurrentRole('SUPER_ADMIN');
            setShowAuthModal(false);
            setNotifications(prev => [{ title: 'Logged in as Super Admin', body: 'Access granted to all operational screens.', time: 'Just now' }, ...prev]);
            return;
          }

          if (email === 'admin@admin' || password === 'admin') {
            setAuthError('Super Admin credentials mismatch.');
            return;
          }

          // Connect to Backend authentication
          if (isBackendConnected) {
            try {
              const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
              });
              if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Invalid credentials');
              }
              const data = await res.json();
              setCurrentUser(data.user);
              setCurrentRole(data.user.role || 'CUSTOMER');
              setAuthToken(data.token);
              setShowAuthModal(false);
            } catch (err: any) {
              setAuthError(err.message || 'Login failed. Please check credentials.');
            }
          } else {
            // Mock Login Fallback
            if (email === 'customer@dineops.com' && password === 'password123') {
              const mockCustomer = { name: 'Vishaal Kumar', email: 'customer@dineops.com', role: 'CUSTOMER' };
              setCurrentUser(mockCustomer);
              setCurrentRole('CUSTOMER');
              setShowAuthModal(false);
            } else {
              // Allow dynamic mock logs for other roles for ease of testing
              const role = email.split('@')[0].toUpperCase();
              const availableRoles = ['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'CHEF', 'KITCHEN_STAFF', 'CASHIER', 'DELIVERY_STAFF', 'SUPPORT_STAFF', 'CUSTOMER'];
              if (availableRoles.includes(role)) {
                const matchedRoleUser = { name: `Staff ${role}`, email, role };
                setCurrentUser(matchedRoleUser);
                setCurrentRole(role);
                setShowAuthModal(false);
              } else {
                setAuthError('Use admin@admin / admin, customer@dineops.com / password123, or any staff email (e.g. chef@dineops.com)');
              }
            }
          }
        }, 600);
      }, 600);
    }, 600);
  };

  // Sign Up handler with animated scan line
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsScanning(true);
    setScanMessage('CONSTRUCTING SECURE CUSTOMER BLOCK...');
    
    setTimeout(async () => {
      setScanMessage('CONFIGURING WALLET AND REWARDS ACCOUNT...');
      setTimeout(async () => {
        setIsScanning(false);
        if (isBackendConnected) {
          try {
            const res = await fetch(`${API_BASE}/auth/signup`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password, name, role: 'CUSTOMER' })
            });
            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.message || 'Signup failed');
            }
            const data = await res.json();
            setCurrentUser(data.user);
            setCurrentRole('CUSTOMER');
            setAuthToken(data.token);
            setShowAuthModal(false);
          } catch (err: any) {
            setAuthError(err.message || 'Signup failed.');
          }
        } else {
          // Mock signup logic
          const newMockUser = { name: name || 'Guest User', email, role: 'CUSTOMER' };
          setCurrentUser(newMockUser);
          setCurrentRole('CUSTOMER');
          setShowAuthModal(false);
        }
      }, 700);
    }, 700);
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole('CUSTOMER');
    setAuthToken(null);
    setEmail('');
    setPassword('');
    setName('');
  };

  // Enforce Super Admin restrict block for changing roles
  const handleRoleChange = (newRole: string) => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      setShowAccessDeniedModal(true);
      return;
    }
    setCurrentRole(newRole);
  };

  // Post new order
  const handlePlaceOrder = async (orderDto: any) => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    // Construct rich payload matching what backend expects
    const payload = {
      items: orderDto.items,
      type: orderDto.type,
      couponCode: orderDto.couponCode,
      deliveryAddress: orderDto.deliveryAddress || 'DineOps table',
      cookingNotes: orderDto.cookingNotes,
      tableId: orderDto.tableId,
      paymentMethod: orderDto.paymentMethod || 'UPI',
      customerId: currentUser?.id,
      customerEmail: currentUser?.email,
    };

    let responseOrder = null;

    if (isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE}/orders/place`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          responseOrder = await res.json();
        }
      } catch (err) {
        console.error('Error placing backend order:', err);
      }
    }

    // Use backend order or fallback to frontend mock structure
    const finalOrder = responseOrder || {
      id: `ord-${Date.now()}`,
      orderNumber: `BH-2026-${rand}`,
      status: 'ORDER_PLACED',
      type: orderDto.type,
      total: orderDto.items.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0),
      createdAt: new Date(),
      items: orderDto.items,
      deliveryAddress: orderDto.deliveryAddress || 'DineOps table',
      otp: Math.floor(1000 + Math.random() * 9000).toString(),
      cookingNotes: orderDto.cookingNotes,
      customerId: currentUser?.id || 'usr-guest',
      customerEmail: currentUser?.email || 'customer@dineops.com',
      paymentMethod: orderDto.paymentMethod || 'UPI',
      paymentStatus: orderDto.paymentMethod === 'WALLET' ? 'PAID' : 'PENDING',
    };

    setOrders(prev => [finalOrder, ...prev]);
    setNotifications(prev => [
      {
        title: 'New Order Placed',
        body: `Cart ticket ${finalOrder.orderNumber} placed for ₹${finalOrder.total}. Payment: ${finalOrder.paymentMethod}`,
        time: 'Just now'
      },
      ...prev
    ]);

    // Force user points & cashback refresh if paying via wallet
    if (orderDto.paymentMethod === 'WALLET' && currentUser) {
      setTimeout(() => {
        // Trigger profile refresh in UI
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('profileUpdated'));
        }
      }, 500);
    }
  };

  const handleReserveTable = async (reserveDto: any) => {
    const tableNum = reserveDto.tableId.replace('tab-', '').replace('1-', '');
    setNotifications(prev => [{ title: 'Table Reservation Confirmed', body: `Reserved Table ${tableNum} for ${reserveDto.guestCount} guests.`, time: 'Just now' }, ...prev]);

    // Optimistic local state update
    const newRes = {
      id: `res-${Date.now()}`,
      tableId: reserveDto.tableId,
      userId: currentUser?.id || 'user-customer',
      guestCount: reserveDto.guestCount,
      reservationDate: reserveDto.reservationDate,
      timeSlot: reserveDto.timeSlot,
      status: 'CONFIRMED',
      notes: reserveDto.notes || '',
      table: { tableNumber: tableNum, capacity: reserveDto.guestCount }
    };
    setReservations(prev => [newRes, ...prev]);

    // Also update locally simulated table status to RESERVED
    setTables(prev => prev.map(t => t.id === reserveDto.tableId ? { ...t, status: 'RESERVED' } : t));

    if (isBackendConnected) {
      try {
        await fetch(`${API_BASE}/ops/tables/reserve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...reserveDto, userId: currentUser?.id })
        });
        syncWithBackend();
      } catch (err) {}
    }
  };

  const handleUpdateTableStatus = async (tableId: string, status: string) => {
    // Optimistic local cache update
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));

    const tableNum = tableId.replace('tab-', '').replace('1-', '');
    setNotifications(prev => [
      {
        title: 'Table Status Updated',
        body: `Table ${tableNum} status has been set to [${status}].`,
        time: 'Just now'
      },
      ...prev
    ]);

    if (isBackendConnected) {
      try {
        await fetch(`${API_BASE}/ops/tables/${tableId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
      } catch (err) {}
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string, deliveryStaffId?: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    const ordObj = orders.find(o => o.id === orderId);
    const orderNum = ordObj?.orderNumber || 'BH-XXXX';

    setNotifications(prev => [{ title: 'Order State Advanced', body: `Ticket ${orderNum} status changed to [${status}].`, time: 'Just now' }, ...prev]);

    if (isBackendConnected) {
      try {
        await fetch(`${API_BASE}/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, deliveryStaffId })
        });
      } catch (err) {}
    }
  };

  const handleVerifyOtp = async (orderId: string, otp: string) => {
    const ordObj = orders.find(o => o.id === orderId);
    if (!ordObj) throw new Error('Order details not found');
    if (ordObj.otp !== otp) throw new Error('Verification OTP mismatch.');

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'DELIVERED', otpVerified: true } : o));
    setNotifications(prev => [{ title: 'Delivery Complete Verified', body: `Courier handover complete for order ${ordObj.orderNumber}.`, time: 'Just now' }, ...prev]);

    if (isBackendConnected) {
      const res = await fetch(`${API_BASE}/orders/${orderId}/otp-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp })
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || 'OTP mismatch');
      }
    }
    return { success: true };
  };

  const handleAddInventoryMovement = async (movementDto: any) => {
    setInventory(prev => prev.map(item => {
      if (item.id === movementDto.itemId) {
        const qty = Number(movementDto.quantity);
        const nextQty = movementDto.type === 'IN' ? item.quantity + qty : Math.max(0, item.quantity - qty);
        return { ...item, quantity: nextQty };
      }
      return item;
    }));

    if (isBackendConnected) {
      try {
        await fetch(`${API_BASE}/ops/inventory/movement`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(movementDto)
        });
      } catch (err) {}
    }
  };

  const handleClockShift = async (shiftId: string, type: 'IN' | 'OUT') => {
    setShifts(prev => prev.map(s => {
      if (s.id === shiftId) {
        return {
          ...s,
          status: type === 'IN' ? 'ACTIVE' : 'COMPLETED',
          checkIn: type === 'IN' ? new Date() : s.checkIn,
          checkOut: type === 'OUT' ? new Date() : s.checkOut,
        };
      }
      return s;
    }));

    if (isBackendConnected) {
      try {
        await fetch(`${API_BASE}/ops/shifts/${shiftId}/clock`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type })
        });
      } catch (err) {}
    }
  };

  const aiChatbotReply = async (message: string) => {
    if (isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE}/ops/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
        const data = await res.json();
        return data.response;
      } catch (err) {}
    }
    const q = message.toLowerCase();
    if (q.includes('recommend') || q.includes('eat') || q.includes('drink') || q.includes('menu')) {
      return "I recommend our Royal Butter Chicken paired with Butter Naan, or the Chef Signature Lava Cake with Gelato. Wash it down with our Mango Lassi Cooler!";
    }
    if (q.includes('table') || q.includes('reserve') || q.includes('book')) {
      return "To book a table, sign in and navigate to the 'Reserve a Table' tab. You can click on any available green slot on the layout.";
    }
    if (q.includes('login') || q.includes('admin') || q.includes('credential')) {
      return "To bypass security constraints for testing, enter 'admin@admin' and password 'admin' in the Sign In portal.";
    }
    return "DineOps AI Concierge response compiled: We support predictive menu forecasting, live POS ledger updates, and automated inventory sync. How can I guide you further?";
  };

  const handleSandboxSimulate = (queryText: string) => {
    setIsAiTyping(true);
    setAiSandboxMessages(prev => [...prev, { sender: 'user', text: queryText }]);
    
    setTimeout(async () => {
      const response = await aiChatbotReply(queryText);
      setAiSandboxMessages(prev => [...prev, { sender: 'bot', text: response }]);
      setIsAiTyping(false);
    }, 1200);
  };

  // Diagnostic logs list matching the active spec console tab
  const DIAGNOSTIC_LOGS = [
    [
      "[SMART_RECOMMENDER] Running personalized menu matchmaking algorithm...",
      "[SMART_RECOMMENDER] Taste profile mapped: High preference for aromatic spices & specialty coffee.",
      "[SMART_RECOMMENDER] Suggested pairing: Hyderabad Dum Biryani paired with Mango Lassi Cooler (94% match).",
      "[SMART_RECOMMENDER] Recommended discount banner auto-generated: 10% off custom coffee combos."
    ],
    [
      "[KITCHEN_TRACKER] Kitchen Display System (KDS) order sync completed.",
      "[KITCHEN_TRACKER] Order BH-2026-9042 [Paneer Butter Masala Combo] entered state [PREPARING] - Station: Main Wok.",
      "[KITCHEN_TRACKER] Order BH-2026-9043 [Cold Brew & Wagyu Sliders] entered state [READY FOR PICKUP] - Station: Bar & Grill.",
      "[KITCHEN_TRACKER] Estimated time to table: 8 minutes. Dispatch alert sent to table host."
    ],
    [
      "[UPI_PAYMENTS] Secure payment gateway initialized (Cashfree & UPI Integration).",
      "[UPI_PAYMENTS] Table 102 requested digital bill summary. Total: ₹1,052.",
      "[UPI_PAYMENTS] Transaction CF_TXN_9042 successfully processed. Status: SUCCESS.",
      "[UPI_PAYMENTS] Loyalty wallet updated: +50 points added to customer profile."
    ],
    [
      "[MULTI_LOCATION] Synchronizing menu and stock rules across Delhi, Bangalore, and Mumbai hubs...",
      "[MULTI_LOCATION] Delhi terminal updated: Menu changes synchronized.",
      "[MULTI_LOCATION] Bangalore kitchen: Shift rotation completed. 4 chefs clocked in.",
      "[MULTI_LOCATION] Mumbai: Live inventory low-stock alert triggered (Aged Truffle Infused Olive Oil < 2L)."
    ]
  ];

  // Raw delicacy database list for carousel on home page
  const FEATURED_DELICACIES_RAW = [
    { name: 'Paneer Butter Masala Naan Combo', price: '₹320', tag: 'Royal Indian', rating: '4.9 (48)', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400', category: 'INDIAN' },
    { name: 'Old Delhi Style Butter Chicken', price: '₹380', tag: 'Royal Indian', rating: '5.0 (92)', img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400', category: 'INDIAN' },
    { name: 'DineOps Signature Cold Brew', price: '₹180', tag: 'Barista Coffee', rating: '4.8 (32)', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400', category: 'COFFEE' },
    { name: 'A5 Miyazaki Wagyu Sliders', price: '₹920', tag: 'Steakhouse Grill', rating: '4.9 (64)', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', category: 'GRILL' },
    { name: 'Signature Lava Cake with Gelato', price: '₹420', tag: 'Decadent Dessert', rating: '4.8 (56)', img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400', category: 'DESSERT' },
    { name: 'Truffle Infused Dal Makhani', price: '₹280', tag: 'Royal Indian', rating: '4.9 (24)', img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', category: 'INDIAN' },
    { name: 'Hyderabad Dum Chicken Biryani', price: '₹350', tag: 'Royal Indian', rating: '5.0 (120)', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', category: 'INDIAN' },
    { name: 'Mango Lassi Botanical Cooler', price: '₹180', tag: 'Royal Indian', rating: '4.7 (18)', img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', category: 'INDIAN' }
  ];

  // Filtering delicacies list dynamically
  const filteredDelicacies = delicacyFilter === 'ALL' 
    ? FEATURED_DELICACIES_RAW 
    : FEATURED_DELICACIES_RAW.filter(d => d.category === delicacyFilter);

  // Carousel actions
  const handleNextDelicacy = () => {
    setDelicacyIndex(prev => (prev + 1) % Math.max(1, filteredDelicacies.length));
  };
  const handlePrevDelicacy = () => {
    setDelicacyIndex(prev => (prev - 1 + filteredDelicacies.length) % Math.max(1, filteredDelicacies.length));
  };

  // ==================== RENDERING SCROLLABLE LANDING/HOME PAGE (NOT LOGGED IN) ====================
  if (!currentUser) {
    return (
      <div 
        onMouseMove={handleMouseMove}
        className="min-h-screen bg-[#070503] text-[#f4ece1] flex flex-col justify-between overflow-x-hidden relative font-sans scroll-smooth bg-grid-pattern"
      >
        
        {/* Cinematic Backdrop Layer */}
        <div 
          className="absolute inset-0 z-0 h-[100vh] overflow-hidden pointer-events-none"
          style={{
            transform: `translate3d(0, ${scrollY * 0.4}px, 0)`,
          }}
        >
          {SLIDESHOW_DATA.map((slide, idx) => (
            <div
              key={idx}
              className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(7,5,3,0.7) 0%, rgba(7,5,3,0.98) 100%), url('${slide.img}')`,
                opacity: bgIndex === idx ? 1 : 0,
                transform: bgIndex === idx ? `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) scale(1.05)` : 'scale(1)',
                transition: 'opacity 1.5s ease-in-out, transform 0.6s ease-out'
              }}
            ></div>
          ))}
          {/* Neon soft glowing accent nodes */}
          <div className="absolute top-48 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none animate-pulse"></div>
          <div className="absolute bottom-48 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none"></div>
        </div>

        {/* Landing Top Navigation Bar */}
        <header className="px-6 py-4 flex items-center justify-between backdrop-blur-lg sticky top-0 z-40 bg-[#070503]/70 border-b border-amber-500/10 transition-all duration-300">
          <div className="flex items-center gap-3">
            <img 
              src="/dineops-logo.jpg" 
              alt="DineOps Logo" 
              className="w-9 h-9 rounded-lg object-cover border border-amber-500/30 animate-float"
            />
            <div>
              <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
                DineOps
              </h1>
              <p className="text-[9px] tracking-widest text-amber-500/80 font-mono font-bold">OPERATIONS PLATFORM</p>
            </div>
          </div>
          
          {/* Middle Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-300">
            {['Dine-In', 'Delivery', 'Table Booking', 'Meal Subscriptions', 'Luxury Gifting'].map((item, index) => (
              <button 
                key={index}
                onClick={() => { setAuthTab('login'); setShowAuthModal(true); }} 
                className="hover:text-amber-300 transition-colors flex items-center gap-1.5 relative group cursor-pointer"
              >
                <span>{item === 'Dine-In' ? '🍽️' : item === 'Delivery' ? '🚚' : item === 'Table Booking' ? '📅' : item === 'Meal Subscriptions' ? '🍱' : '🎁'}</span>
                <span>{item}</span>
                <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-amber-500 group-hover:w-full transition-all duration-300"></span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button className="text-slate-300 hover:text-amber-400 transition-colors p-2 hover:bg-white/5 rounded-full cursor-pointer">
              <Search className="w-4 h-4" />
            </button>
            <button className="text-slate-300 hover:text-amber-400 transition-colors p-2 hover:bg-white/5 rounded-full cursor-pointer">
              <Moon className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setAuthTab('login'); setAuthError(''); setShowAuthModal(true); }}
              className="text-xs font-bold text-[#f4ece1] hover:text-amber-300 transition-colors px-4 py-2 border border-amber-500/10 hover:border-amber-500/30 rounded-xl bg-white/5 cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthTab('signup'); setAuthError(''); setShowAuthModal(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:scale-105 cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </header>

        {/* HERO SECTION WITH FLOATING TELEMETRY HUD */}
        <section className="min-h-[calc(100vh-76px)] flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto px-6 z-10 py-16 gap-12 w-full relative">
          <div className="flex flex-col gap-6 max-w-2xl text-left justify-center min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={bgIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col gap-6"
              >
                {/* Glowing badge */}
                <div className="bg-[#18130e]/90 backdrop-blur-md border border-amber-500/20 px-4 py-1.5 rounded-full text-[10px] font-bold text-amber-300 uppercase tracking-widest flex items-center gap-2 w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{SLIDESHOW_DATA[bgIndex].tag}</span>
                </div>

                {/* Title with animation */}
                <h2 className="text-4xl md:text-7xl font-light tracking-tight leading-tight text-[#f4ece1] font-sans">
                  {SLIDESHOW_DATA[bgIndex].titlePart1} <br />
                  <span 
                    className="bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent font-serif italic font-normal block mt-2 text-glow-gold"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {SLIDESHOW_DATA[bgIndex].titlePart2}
                  </span>
                </h2>

                {/* Subtitle */}
                <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl">
                  {SLIDESHOW_DATA[bgIndex].desc}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 mt-4">
              <button 
                onClick={() => { setAuthTab('login'); setShowAuthModal(true); }}
                className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#070503] font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-[0_4px_25px_rgba(212,175,55,0.25)] hover:scale-105 flex items-center gap-2 group cursor-pointer border border-amber-400/20"
              >
                {/* Auto loop Shimmer */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-150%] animate-shimmer" />
                <span className="relative z-10">Explore Our Menu</span>
                <ArrowRight className="w-4 h-4 relative z-10" />
              </button>
              <button 
                onClick={() => { setAuthTab('signup'); setShowAuthModal(true); }}
                className="bg-white/5 border border-white/10 hover:border-amber-500/40 text-slate-300 hover:text-[#f4ece1] font-bold text-xs px-6 py-3 rounded-xl transition-all hover:bg-white/10"
              >
                Reserve a Table
              </button>
            </div>

            {/* Hyperlinks */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8 text-[11px] font-semibold text-slate-400">
              <span className="text-slate-500">Visit us at:</span>
              <button onClick={() => { setAuthTab('login'); setShowAuthModal(true); }} className="text-amber-400 hover:underline flex items-center gap-1">📍 Mumbai</button>
              <span>•</span>
              <button onClick={() => { setAuthTab('login'); setShowAuthModal(true); }} className="text-amber-400 hover:underline flex items-center gap-1">📍 Bangalore</button>
              <span>•</span>
              <button onClick={() => { setAuthTab('login'); setShowAuthModal(true); }} className="text-amber-400 hover:underline flex items-center gap-1">📍 Delhi</button>
            </div>
          </div>

          {/* RIGHT SIDE: LIVE OPERATIONS OVERVIEW */}
          <div className="w-full lg:w-96 glass-panel rounded-3xl border border-amber-500/20 p-5 shadow-2xl relative overflow-hidden flex flex-col gap-4 bg-[#0d0a07]/80 backdrop-blur-lg">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
            
            {/* HUD Header */}
            <div className="flex justify-between items-center border-b border-amber-500/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 ai-pulse-dot"></div>
                <span className="text-xs font-bold tracking-wider text-amber-300 uppercase">Live Kitchen & Sales Hub</span>
              </div>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest">Active Outlets</span>
            </div>

            {/* Metrics list */}
            <div className="flex flex-col gap-3 text-[10px]">
              <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-amber-500/5">
                <span className="text-slate-400 uppercase font-semibold">Store Status</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Open & Accepting Orders</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-amber-500/5">
                <span className="text-slate-400 uppercase font-semibold">Today's Net Sales</span>
                <span className="text-amber-400 font-bold">₹1,42,850</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-amber-500/5">
                <span className="text-slate-400 uppercase font-semibold">Active Chef Shifts</span>
                <span className="text-amber-300 font-bold">4 chefs clocked in</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-amber-500/5">
                <span className="text-slate-400 uppercase font-semibold">Orders in Prep Queue</span>
                <span className="text-amber-500 font-bold animate-pulse">4 active tickets</span>
              </div>
            </div>

            {/* Graphic telemetry chart indicator */}
            <div className="border border-amber-500/10 rounded-xl p-3 bg-black/40 flex flex-col gap-2">
              <span className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">Hourly Dine-In Traffic</span>
              <div className="flex items-end gap-1.5 h-12 pt-2 justify-between">
                {[45, 60, 30, 80, 50, 95, 40, 70, 85, 30, 65, 50].map((h, idx) => (
                  <div 
                    key={idx} 
                    className="flex-1 rounded-t bg-gradient-to-t from-amber-500 to-orange-500 opacity-80"
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
              </div>
              <div className="flex justify-between text-[8px] text-slate-500 pt-1 font-mono">
                <span>08:00</span>
                <span>PEAK HOURS TRAFFIC: 94%</span>
                <span>24:00</span>
              </div>
            </div>

            {/* HUD Status prompt */}
            <div className="p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-xl text-[9px] text-slate-400 leading-normal">
              <span className="font-bold text-amber-300">ADMIN DEMO:</span> Log in with email <code className="text-amber-300">admin@admin</code> and password <code className="text-amber-300">admin</code> to test chef, cashier, inventory and admin dashboards.
            </div>
          </div>

          {/* Bouncing Scroll Mouse Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 hidden lg:flex flex-col items-center gap-1.5 z-10 pointer-events-none select-none">
            <div className="w-[20px] h-[34px] rounded-full border border-amber-500/30 flex justify-center p-1">
              <motion.div 
                className="w-1 h-1.5 rounded-full bg-amber-400"
                animate={{ 
                  y: [0, 10, 0],
                  opacity: [1, 0, 1]
                }}
                transition={{ 
                  duration: 2.2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            <span className="text-[7.5px] font-mono tracking-widest text-amber-500/55 uppercase font-semibold">Scroll</span>
          </div>
        </section>

        {/* SECTION 2: SELECT CUISINE DOMAIN (From reference layout) */}
        <section className="py-28 px-6 bg-[#040302] z-10 relative border-t border-amber-500/5">
          <div className="max-w-6xl mx-auto text-center flex flex-col items-center gap-4 mb-16">
            <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              DOMAINS
            </span>
            <h3 className="text-3xl md:text-5xl font-extrabold text-[#f4ece1] tracking-tight">Select Cuisine Domain</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Explore state-of-the-art culinary categories curated by our executive culinary specialists.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-5">
            {[
              { title: 'Craft Coffees', desc: '10+ single origin brews', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', icon: Coffee },
              { title: 'Artisan Breakfast', desc: 'Fresh morning plates', img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400', icon: Pizza },
              { title: 'Signature Grills', desc: 'Flame broiled wagyu', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', icon: Flame },
              { title: 'Royal Indian Feasts', desc: 'Rich modern curries', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400', icon: UtensilsCrossed },
              { title: 'Desserts & Gelato', desc: 'Chef-crafted treats', img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400', icon: Cake }
            ].map((domain, idx) => {
              const Icon = domain.icon;
              return (
                <div
                  key={idx}
                  onClick={() => { setAuthTab('login'); setShowAuthModal(true); }}
                  className="glass-card rounded-2xl overflow-hidden h-72 flex flex-col justify-end p-4 border border-amber-500/5 hover:border-amber-500/30 transition-all cursor-pointer relative group shadow-lg"
                >
                  <div className="absolute inset-0 bg-cover bg-center filter brightness-[0.45] group-hover:scale-110 transition-transform duration-700" style={{ backgroundImage: `url('${domain.img}')` }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#040302] via-transparent to-transparent"></div>
                  
                  <div className="relative z-10 flex flex-col gap-1.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-1 group-hover:bg-amber-500 group-hover:text-black transition-all group-hover:rotate-6">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-amber-200 text-xs tracking-wide leading-tight group-hover:text-amber-300">{domain.title}</h4>
                    <p className="text-[10px] text-slate-400 leading-none">{domain.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: CORE SPECIFICATIONS INTERACTIVE CONSOLE (From reference layout) */}
        <section className="py-28 px-6 bg-[#070503] z-10 relative border-t border-amber-500/5">
          <div className="max-w-6xl mx-auto text-center flex flex-col items-center gap-4 mb-16">
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              WHY BREWHUB
            </span>
            <h3 className="text-3xl md:text-5xl font-extrabold text-[#f4ece1] tracking-tight">The DineOps Experience</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Everything you need for a world-class dining journey, from kitchen to table.
            </p>
          </div>

          {/* 4 Feature Grids */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { title: 'Smart Recommendations', text: 'Personalized dish suggestions based on your taste, mood, and dietary preferences.', icon: Bot, index: 0 },
              { title: 'Live Kitchen Tracking', text: 'Watch your order journey from prep to plating — know exactly when it arrives.', icon: ChefHat, index: 1 },
              { title: 'Seamless Payments', text: 'Pay with UPI, cards, wallets, or cash. Split bills with friends in a tap.', icon: Landmark, index: 2 },
              { title: 'All Locations, One Account', text: 'Your preferences, rewards, and favorites follow you to every DineOps outlet.', icon: ShieldCheck, index: 3 }
            ].map((f, i) => {
              const Icon = f.icon;
              const isActive = activeSpecTab === f.index;
              return (
                <div 
                  key={i} 
                  onClick={() => setActiveSpecTab(f.index)}
                  className={`glass-card p-5 rounded-2xl border transition-all cursor-pointer ${
                    isActive 
                      ? 'border-indigo-500 bg-indigo-950/10 shadow-[0_0_20px_rgba(99,102,241,0.15)] scale-105' 
                      : 'border-amber-500/5 hover:border-amber-500/20'
                  }`}
                >
                  <div className={`p-2.5 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isActive ? 'bg-indigo-500 text-black' : 'bg-indigo-500/10 text-indigo-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-amber-200 text-xs mt-3">{f.title}</h4>
                  <p className="text-[10.5px] text-slate-400 leading-relaxed mt-1.5">{f.text}</p>
                </div>
              );
            })}
          </div>

          {/* INTERACTIVE FEATURE ACTIVITY CONSOLE */}
          <div className="max-w-5xl mx-auto rounded-2xl border border-amber-500/20 bg-black/75 p-5 shadow-inner relative overflow-hidden">
            <div className="absolute top-2 right-4 flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500/70"></span>
              <span className="w-2 h-2 rounded-full bg-yellow-500/70"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500/70"></span>
            </div>
            <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Live Activity Log Stream</span>
            </div>
            <div className="flex flex-col gap-1.5 text-[10.5px] text-amber-200/90 leading-relaxed min-h-[90px]">
              {DIAGNOSTIC_LOGS[activeSpecTab].map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-amber-500/50 select-none">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats metrics boxes from reference layout */}
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {[
              { val: '200+', label: 'Curated dishes across cuisines' },
              { val: '50k+', label: 'Happy diners served monthly' },
              { val: '4.9★', label: 'Average customer rating' },
              { val: '15+', label: 'Premium dining locations' }
            ].map((stat, i) => (
              <div key={i} className="glass-card p-5 rounded-xl border border-amber-500/5 text-center flex flex-col gap-1 shadow-md hover:border-amber-500/20">
                <span className="text-3xl font-extrabold bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-200 bg-clip-text text-transparent font-mono text-glow-gold">
                  {stat.val}
                </span>
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: FEATURED DELICACIES SLIDESHOW / CAROUSEL */}
        <section className="py-28 px-6 bg-[#040302] z-10 relative border-t border-amber-500/5">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-6">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                DELICACIES
              </span>
              <h3 className="text-3xl md:text-5xl font-extrabold text-[#f4ece1] mt-3 tracking-tight">Featured Delicacies</h3>
              <p className="text-xs text-slate-400 mt-2">
                Premium selected menu pairings currently hot in the kitchen.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 border border-white/5 bg-black/40 rounded-xl p-1 font-mono text-[9px] font-bold">
              {['ALL', 'INDIAN', 'COFFEE', 'GRILL', 'DESSERT'].map(category => (
                <button
                  key={category}
                  onClick={() => {
                    setDelicacyFilter(category);
                    setDelicacyIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    delicacyFilter === category 
                      ? 'bg-amber-500 text-black shadow-md' 
                      : 'text-slate-400 hover:text-[#f4ece1]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Slider Layout */}
          <div className="max-w-6xl mx-auto relative flex items-center">
            {/* Left controller */}
            <button 
              onClick={handlePrevDelicacy}
              className="absolute -left-4 md:-left-12 z-20 w-10 h-10 rounded-full bg-black/80 border border-amber-500/20 flex items-center justify-center text-amber-400 hover:bg-amber-500 hover:text-black transition-colors"
            >
              &larr;
            </button>

            {/* Delicacies Grid displaying slice of items */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full overflow-hidden px-1 py-2">
              {filteredDelicacies.slice(delicacyIndex, delicacyIndex + 4).concat(
                filteredDelicacies.slice(0, Math.max(0, 4 - (filteredDelicacies.length - delicacyIndex)))
              ).slice(0, Math.min(4, filteredDelicacies.length)).map((food, i) => (
                <div
                  key={i}
                  onClick={() => { setAuthTab('login'); setShowAuthModal(true); }}
                  className="glass-card rounded-2xl overflow-hidden border border-amber-500/5 hover:border-amber-500/25 flex flex-col justify-between h-96 cursor-pointer group shadow-lg relative"
                >
                  <div className="h-52 bg-cover bg-center group-hover:scale-105 transition-transform duration-500 relative" style={{ backgroundImage: `url('${food.img}')` }}>
                    <div className="absolute top-3 left-3 bg-[#070503]/90 border border-amber-500/20 px-2.5 py-1 rounded text-[8px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                      {food.tag}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between bg-[#0b0907] border-t border-white/5">
                    <div>
                      <h4 className="font-extrabold text-amber-200 text-xs leading-tight line-clamp-2 tracking-wide group-hover:text-amber-300 transition-colors">{food.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-2 font-semibold">Exotic blend prepared daily by Executive Masterchefs.</p>
                    </div>
                    <div className="flex justify-between items-center border-t border-amber-500/5 pt-3 mt-2">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">★ <span className="font-semibold text-amber-300">{food.rating}</span></span>
                      <span className="text-amber-400 font-extrabold font-mono text-xs text-glow-gold">{food.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right controller */}
            <button 
              onClick={handleNextDelicacy}
              className="absolute -right-4 md:-right-12 z-20 w-10 h-10 rounded-full bg-black/80 border border-amber-500/20 flex items-center justify-center text-amber-400 hover:bg-amber-500 hover:text-black transition-colors"
            >
              &rarr;
            </button>
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => { setAuthTab('login'); setShowAuthModal(true); }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 mx-auto border-b border-indigo-500/10 hover:border-indigo-400 pb-1"
            >
              <span>ACCESS FULL DIGITAL BILLING CATALOGUE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* SECTION 5: INTERACTIVE AI CONCIERGE SANDBOX */}
        <section className="py-28 px-6 bg-[#070503] z-10 relative border-t border-amber-500/5">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Sandbox details */}
            <div className="flex flex-col gap-6 text-left">
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 w-fit">
                YOUR ASSISTANT
              </span>
              <h3 className="text-3xl md:text-5xl font-extrabold text-[#f4ece1] tracking-tight">Your Personal Food Concierge</h3>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                Need a recommendation? Have dietary restrictions? Want to know today's specials? Our friendly AI assistant is always here to help you find your perfect meal.
              </p>

              {/* Simulation pills */}
              <div className="flex flex-col gap-2.5">
                {[
                  { q: 'What is today\'s signature dish recommendation?', icon: Sparkles },
                  { q: 'How do I reserve table 103 for 4 guests?', icon: Calendar },
                  { q: 'Tell me about the Royal Indian feasts items', icon: UtensilsCrossed },
                  { q: 'Is there a bypass to check the operations?', icon: Key }
                ].map((pill, idx) => {
                  const PillIcon = pill.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSandboxSimulate(pill.q)}
                      disabled={isAiTyping}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/25 text-left text-xs font-semibold text-slate-300 hover:text-[#f4ece1] hover:bg-white/10 transition-all font-mono"
                    >
                      <PillIcon className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{pill.q}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat Simulation Dashboard */}
            <div className="glass-panel rounded-3xl border border-amber-500/20 p-5 shadow-2xl bg-black/60 relative overflow-hidden flex flex-col gap-4 h-[340px] justify-between">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
              
              <div className="flex justify-between items-center border-b border-amber-500/10 pb-2">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-bold tracking-wider text-amber-300 uppercase">Chat with DineOps AI</span>
                </div>
                <span className="text-[8px] text-slate-500 font-semibold">LIVE FEED</span>
              </div>

              {/* Chat outputs */}
              <div className="flex-1 overflow-y-auto pr-1 py-2 flex flex-col gap-3 text-[10.5px]">
                {aiSandboxMessages.map((m, idx) => (
                  <div key={idx} className={`p-2.5 rounded-xl border max-w-[85%] ${
                    m.sender === 'user'
                      ? 'bg-amber-500/5 border-amber-500/20 text-amber-200 self-end'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-100 self-start'
                  }`}>
                    <span className="font-bold text-[9px] uppercase block mb-1 text-slate-500">
                      {m.sender === 'user' ? 'You' : 'DineOps AI'}
                    </span>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                ))}
                
                {isAiTyping && (
                  <div className="bg-amber-500/5 border border-amber-500/20 p-2.5 rounded-xl text-amber-300 self-start animate-pulse">
                    <span>DineOps AI is thinking...</span>
                  </div>
                )}
              </div>

              <div className="text-[8px] text-slate-500 text-center uppercase tracking-widest border-t border-white/5 pt-2 font-semibold">
                Powered by DineOps AI • Available 24/7
              </div>
            </div>

          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 border-t border-amber-500/10 text-center text-[10px] text-slate-500 font-mono tracking-wide bg-[#040302] z-10 relative">
          © 2026 DineOps • Premium Dining Experiences • Mumbai • Bangalore • Delhi
        </footer>

        {/* AUTHENTICATION PORTALS OVERLAY MODAL */}
        <AnimatePresence>
          {showAuthModal && (
            <motion.div 
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="glass-panel w-full max-w-md rounded-3xl border border-indigo-500/40 overflow-hidden shadow-2xl p-6 relative bg-[#0a0806]"
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
              >
                {/* Custom scanner scanline when scanning */}
                {isScanning && <div className="auth-scanline"></div>}

                <button 
                  onClick={() => { if (!isScanning) setShowAuthModal(false); }}
                  className="absolute top-4 right-4 text-slate-400 hover:text-[#f4ece1] transition-colors"
                  disabled={isScanning}
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Tabs with glowing selector */}
                <div className="flex border-b border-amber-500/10 pb-3 mb-5">
                  <button
                    disabled={isScanning}
                    onClick={() => { setAuthTab('login'); setAuthError(''); }}
                    className={`flex-1 text-center pb-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                      authTab === 'login'
                        ? 'border-b-2 border-amber-500 text-amber-300 text-glow-gold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                  <button
                    disabled={isScanning}
                    onClick={() => { setAuthTab('signup'); setAuthError(''); }}
                    className={`flex-1 text-center pb-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                      authTab === 'signup'
                        ? 'border-b-2 border-amber-500 text-amber-300 text-glow-gold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </button>
                </div>

                {authError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono rounded-xl mb-4 text-center">
                    {authError}
                  </div>
                )}

                {/* SECURE CREDENTIALS AUTHENTICATION GATES */}
                {isScanning ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-5 text-center">
                    <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
                    <div className="flex flex-col gap-2">
                      <span className="text-amber-300 text-xs font-bold uppercase tracking-wider animate-pulse">Securing Connection Gateway</span>
                      <p className="text-[10px] text-slate-400 max-w-xs">{scanMessage}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* DEDICATED SEPARATE LOGIN PORTAL */}
                    {authTab === 'login' && (
                      <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <div>
                          <label className="text-[9px] uppercase font-mono tracking-wider text-amber-500/80 font-bold block mb-1">Email / Hub Username</label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              placeholder="admin@admin OR customer@dineops.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full bg-[#16120e] border border-amber-500/15 focus:border-amber-500 focus:shadow-[0_0_10px_rgba(245,158,11,0.2)] rounded-xl pl-9 pr-4 py-2.5 text-xs text-amber-100 placeholder-slate-600 focus:outline-none transition-all"
                            />
                            <Mail className="w-4 h-4 text-slate-600 absolute left-3 top-3.5" />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] uppercase font-mono tracking-wider text-amber-500/80 font-bold block mb-1">Security Access Key</label>
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

                        <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-[10px] text-slate-400 leading-relaxed flex gap-2 items-start mt-2">
                          <Lock className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-amber-300">Credentials Restriction Policy:</span>
                            <p className="mt-0.5">Use <code className="text-amber-200 font-mono">admin@admin</code> and password <code className="text-amber-200 font-mono">admin</code> to log in as Super Admin. Customers use <code className="text-amber-200 font-mono">customer@dineops.com</code> / <code className="text-amber-200 font-mono">password123</code>.</p>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#070503] font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all mt-4 shadow-lg shadow-amber-500/20"
                        >
                          Verify Credentials & Enter
                        </button>
                      </form>
                    )}

                    {/* DEDICATED SEPARATE SIGN UP PORTAL */}
                    {authTab === 'signup' && (
                      <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                        <div>
                          <label className="text-[9px] uppercase font-mono tracking-wider text-amber-500/80 font-bold block mb-1">Your Full Name</label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              placeholder="e.g. Vishaal Kumar"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full bg-[#16120e] border border-amber-500/15 focus:border-amber-500 focus:shadow-[0_0_10px_rgba(245,158,11,0.2)] rounded-xl pl-9 pr-4 py-2.5 text-xs text-amber-100 placeholder-slate-600 focus:outline-none transition-all"
                            />
                            <User className="w-4 h-4 text-slate-600 absolute left-3 top-3.5" />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] uppercase font-mono tracking-wider text-amber-500/80 font-bold block mb-1">Email ID</label>
                          <div className="relative">
                            <input
                              type="email"
                              required
                              placeholder="customer@email.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full bg-[#16120e] border border-amber-500/15 focus:border-amber-500 focus:shadow-[0_0_10px_rgba(245,158,11,0.2)] rounded-xl pl-9 pr-4 py-2.5 text-xs text-amber-100 placeholder-slate-600 focus:outline-none transition-all"
                            />
                            <Mail className="w-4 h-4 text-slate-600 absolute left-3 top-3.5" />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] uppercase font-mono tracking-wider text-amber-500/80 font-bold block mb-1">Choose Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              placeholder="Minimum 6 characters"
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

                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#070503] font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all mt-4 shadow-lg shadow-amber-500/20"
                        >
                          Create Account & Sign In
                        </button>
                      </form>
                    )}
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ==================== MAIN LOGGED IN APP LAYOUT ====================
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onChangeRole={handleRoleChange}
        notifications={notifications.filter(n => {
          if (n.title && n.title.includes('Low Stock Alert')) {
            return currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN');
          }
          return true;
        })}
        onClearNotifications={() => setNotifications([])}
        userPoints={profileData?.loyaltyPoints ?? (currentUser.role === 'SUPER_ADMIN' ? 5000 : 180)}
        userTier={profileData?.loyaltyTier ?? (currentUser.role === 'SUPER_ADMIN' ? 'Platinum' : 'Silver')}
        cashback={profileData?.cashbackBalance ?? (currentUser.role === 'SUPER_ADMIN' ? 500 : 75)}
        lang={lang}
        onChangeLang={setLang}
        userName={currentUser.name}
        userEmail={currentUser.email}
        currentUserRole={currentUser?.role}
        onOpenMyOrders={() => setShowOrdersModal(true)}
        onOpenMyProfile={() => setShowProfileModal(true)}
        onOpenMyReservations={() => setShowReservationsModal(true)}
      />

      {/* Connection / Auth Indicator Bar */}
      <div className="bg-[#14100c] px-6 py-1.5 border-b border-amber-500/5 flex justify-between items-center text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-400' : 'bg-amber-400'} pulse-glow`}></span>
          <span className="text-slate-400 uppercase">
            {isBackendConnected ? 'LIVE DATABASE' : 'LOCAL MOCK DATABASE'} • Welcome, {currentUser.name} ({currentUser.role})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-500">SYSTEM DATE: 2026-06-03</span>
          <button
            onClick={handleLogout}
            className="text-rose-400 hover:text-rose-300 font-bold uppercase transition-colors shrink-0"
          >
            [ Sign Out ]
          </button>
        </div>
      </div>

      {/* Main Switcher Portal Layout */}
      <main className="flex-1 bg-[#0d0a07]">
        {currentRole === 'CUSTOMER' && (
          <CustomerPortal
            categories={categories}
            items={items}
            onPlaceOrder={handlePlaceOrder}
            onReserveTable={handleReserveTable}
            aiChatbotReply={aiChatbotReply}
            lang={lang}
            currentUser={currentUser}
            tables={tables}
            onUpdateTableStatus={handleUpdateTableStatus}
          />
        )}

        {currentRole === 'CASHIER' && (
          <POSTerminal
            items={items}
            onPlacePOSOrder={handlePlaceOrder}
            lang={lang}
          />
        )}

        {currentRole === 'CHEF' && (
          <KitchenKDS
            orders={orders}
            onUpdateStatus={handleUpdateStatus}
            lang={lang}
          />
        )}

        {currentRole === 'DELIVERY_STAFF' && (
          <DeliveryDashboard
            orders={orders}
            onUpdateStatus={handleUpdateStatus}
            onVerifyOtp={handleVerifyOtp}
            lang={lang}
          />
        )}

        {currentRole === 'ADMIN' && (
          <InventoryStaff
            inventory={inventory}
            shifts={shifts}
            onAddMovement={handleAddInventoryMovement}
            onClockShift={handleClockShift}
            lang={lang}
          />
        )}

        {currentRole === 'SUPER_ADMIN' && (
          <div className="flex flex-col gap-8 py-4">
            <AnalyticsDashboard orders={orders} lang={lang} />
            <RBACMatrix lang={lang} />
          </div>
        )}
      </main>
      
      <AccessDeniedModal
        isOpen={showAccessDeniedModal}
        onClose={() => setShowAccessDeniedModal(false)}
        currentUser={currentUser}
      />
      
      <MyOrdersModal
        isOpen={showOrdersModal}
        onClose={() => setShowOrdersModal(false)}
        orders={orders}
        currentUser={currentUser}
      />
      
      <MyProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentUser={currentUser}
      />

      <MyReservationsModal
        isOpen={showReservationsModal}
        onClose={() => setShowReservationsModal(false)}
        reservations={reservations}
        currentUser={currentUser}
      />
    </div>
  );
}
