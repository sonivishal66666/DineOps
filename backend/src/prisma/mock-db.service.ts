import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface MockCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  sortOrder: number;
}

export interface MockMenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isVeg: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isKeto: boolean;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  allergens: string[];
  isPopular: boolean;
  isTrending: boolean;
  active: boolean;
  customizations?: any[];
}

export interface MockBranch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  active: boolean;
}

export interface MockTable {
  id: string;
  branchId: string;
  tableNumber: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'LOCKED';
  waiterNeeded: boolean;
  billRequested: boolean;
  qrCode?: string;
}

export interface MockOrder {
  id: string;
  branchId: string;
  customerId?: string;
  deliveryStaffId?: string;
  tableId?: string;
  orderNumber: string;
  status: string;
  type: 'PICKUP' | 'DELIVERY' | 'DINE_IN';
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentTransactionId?: string;
  cookingNotes?: string;
  deliveryNotes?: string;
  deliveryAddress?: string;
  otp?: string;
  otpVerified: boolean;
  createdAt: Date;
  items: any[];
}

export interface MockInventory {
  id: string;
  branchId: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  minStockLevel: number;
  supplierName: string;
  supplierEmail: string;
  expiryDate?: Date;
}

export interface MockShift {
  id: string;
  userId: string;
  branchId: string;
  startTime: Date;
  endTime: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'ABSENT';
  hourlyRate: number;
}

@Injectable()
export class MockDbService {
  private readonly logger = new Logger(MockDbService.name);

  public categories: MockCategory[] = [];
  public menuItems: MockMenuItem[] = [];
  public branches: MockBranch[] = [];
  public tables: MockTable[] = [];
  public orders: MockOrder[] = [];
  public inventoryItems: MockInventory[] = [];
  public staffShifts: MockShift[] = [];
  public users: any[] = [];
  public reservations: any[] = [];
  public giftCards: any[] = [];
  public coupons: any[] = [];
  public subscriptions: any[] = [];
  public auditLogs: any[] = [];
  public reviews: any[] = [];

  constructor() {
    this.loadFromDisk();
    if (typeof global !== 'undefined') {
      setInterval(() => this.saveToDisk(), 2000);
    }
  }

  public triggerNotification(userId: string, title: string, body: string) {
    const idx = this.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      if (!this.users[idx].notifications) {
        this.users[idx].notifications = [];
      }
      this.users[idx].notifications.push({
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title,
        body,
        time: 'Just now'
      });
      this.saveToDisk();
    }
  }

  private getPersistencePath() {
    if (process.env.VERCEL) {
      const tempPath = path.join('/tmp', 'mock-db-persistence.json');
      if (!fs.existsSync(tempPath)) {
        const rootPath = path.join(process.cwd(), 'mock-db-persistence.json');
        if (fs.existsSync(rootPath)) {
          try {
            fs.copyFileSync(rootPath, tempPath);
          } catch (e) {}
        }
      }
      return tempPath;
    }
    return path.join(process.cwd(), 'mock-db-persistence.json');
  }

  private loadFromDisk() {
    const filePath = this.getPersistencePath();
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(data);
        this.categories = parsed.categories || [];
        this.menuItems = parsed.menuItems || [];
        this.branches = parsed.branches || [];
        this.tables = parsed.tables || [];
        this.orders = (parsed.orders || []).map((o: any) => ({ ...o, createdAt: new Date(o.createdAt) }));
        this.inventoryItems = parsed.inventoryItems || [];
        this.staffShifts = (parsed.staffShifts || []).map((s: any) => ({ ...s, startTime: new Date(s.startTime), endTime: new Date(s.endTime) }));
        this.users = parsed.users || [];
        this.reservations = parsed.reservations || [];
        this.giftCards = parsed.giftCards || [];
        this.coupons = parsed.coupons || [];
        this.subscriptions = parsed.subscriptions || [];
        this.auditLogs = parsed.auditLogs || [];
        this.reviews = parsed.reviews || [];
        this.logger.log(`Persisted Mock Database loaded successfully from ${filePath}`);
        return;
      }
    } catch (err) {
      this.logger.error(`Error loading mock database from disk: ${err.message}`);
    }

    this.seedAll();
    this.saveToDisk();
  }

  public saveToDisk() {
    const filePath = this.getPersistencePath();
    try {
      const payload = {
        categories: this.categories,
        menuItems: this.menuItems,
        branches: this.branches,
        tables: this.tables,
        orders: this.orders,
        inventoryItems: this.inventoryItems,
        staffShifts: this.staffShifts,
        users: this.users,
        reservations: this.reservations,
        giftCards: this.giftCards,
        coupons: this.coupons,
        subscriptions: this.subscriptions,
        auditLogs: this.auditLogs,
        reviews: this.reviews,
      };
      fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
    } catch (err) {
      this.logger.error(`Error saving mock database to disk: ${err.message}`);
    }
  }

  private seedAll() {
    this.logger.log('Seeding Mock In-Memory Database with 100+ items...');

    // Seed Branches
    this.branches = [
      { id: 'br-1', name: 'Downtown flagship', address: '456 Luxury Blvd', city: 'Mumbai', phone: '+919999999001', active: true },
      { id: 'br-2', name: 'Uptown Mall', address: 'Galleria Mall Floor 3', city: 'Delhi NCR', phone: '+919999999002', active: true },
      { id: 'br-3', name: 'Airport T3 Express', address: 'Departure Terminal 3 Food Court', city: 'Delhi', phone: '+919999999003', active: true },
      { id: 'br-4', name: 'CloudKitchen East', address: 'Sector 5 Business Park', city: 'Bengaluru', phone: '+919999999004', active: true },
    ];

    // Seed Categories
    this.categories = [
      { id: 'cat-breakfast', name: 'Breakfast Specials', description: 'Morning dosas, premium chole bhature, fluffy pancakes, and light starters', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&auto=format&fit=crop&q=80', sortOrder: 1 },
      { id: 'cat-italian', name: 'European & Pastas', description: 'Wood-fired pizzas, pan-seared salmon, and artisanal pastas', image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500&auto=format&fit=crop&q=80', sortOrder: 2 },
      { id: 'cat-grill', name: 'Gourmet Burgers & Grills', description: 'A5 Miyazaki Wagyu sliders, smoked chicken wings, and steaks', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80', sortOrder: 3 },
      { id: 'cat-meals', name: 'Executive Indian Meals', description: 'Gourmet curry platters, rajma chawal, tikkas, and butter naan combo meals', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80', sortOrder: 4 },
      { id: 'cat-chaat', name: 'Artisan Indian Chaat', description: 'Tangy golgappas, crispy aloo tikki, vada pav, and classic street style bhel puri', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&auto=format&fit=crop&q=80', sortOrder: 5 },
      { id: 'cat-chinese', name: 'Indo-Chinese Fusions', description: 'Fiery Hakka noodles, crispy spring rolls, and veg manchurian', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=80', sortOrder: 6 },
      { id: 'cat-drinks', name: 'Beverages & Coolers', description: 'Masala cutting chai, mango lassi coolers, botanical mint mojitos, and badam kesari milk', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80', sortOrder: 7 },
      { id: 'cat-desserts', name: 'Sweet Endings', description: 'Espresso tiramisu, kulfi falooda, New York cheesecake, and saffron rabri rasmalai', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80', sortOrder: 8 },
    ];

    // Seed Menu Items (Hybrid Western-Indian Selection)
    const foodNames = {
      'cat-breakfast': [
        'Masala Dosa Combo with Podi', 'Chole Bhature Premium Outlets', 'Idli Sambar Ghee Roast Plate', 
        'Rava Upma Bowl with Cashews', 'Homestyle Stuffed Aloo Paratha', 'Fluffy Blueberry Pancakes', 'French Croissants and Jam'
      ],
      'cat-italian': [
        'Pan-Seared Salmon with Asparagus', 'Truffle Mushroom Fettuccine Alfredo', 'Wood-fired Margherita Pizza', 
        'Pesto Genovese Penne Pasta', 'Four-Cheese Gorgonzola Gnocchi', 'Spaghetti Carbonara Premium'
      ],
      'cat-grill': [
        'A5 Miyazaki Wagyu Sliders', 'Classic Caesar Salad with Chicken', 'Gourmet Cottage Cheese Steak', 'Smoked BBQ Chicken Wings',
        'Flame-broiled Ribeye Steak', 'DineOps Signature Chicken Club'
      ],
      'cat-meals': [
        'Rajma Chawal Executive Bowl', 'Shahi Paneer Butter Masala', 'Gourmet Butter Naan Basket (3pcs)', 
        'Classic Chicken Tikka Platter', 'Spiced Paneer Tikka Kebab', 'Hyderabadi Dum Chicken Biryani', 'Royal Rajasthani Thali'
      ],
      'cat-chaat': [
        'Mumbai Special Vada Pav (2pcs)', 'Delhi Dahi Papdi Chaat Deluxe', 'Spicy Pani Puri Golgappa Plate', 
        'Samosa Chaat Mint Chutney', 'Crispy Aloo Tikki Chaat', 'Bhel Puri Street Style', 'Sev Puri Classic'
      ],
      'cat-chinese': [
        'Hakka Noodles', 'Veg Manchurian', 'Crispy Spring Rolls'
      ],
      'cat-drinks': [
        'Saffron Cardamom Cappuccino', 'DineOps Masala Cutting Chai', 'Mango Lassi Cardamom Cooler', 
        'Nimbu Masala Botanical Fizz', 'DineOps Signature Cold Brew', 'Sweet Badam Kesari Milk', 'Classic Mint Mojito'
      ],
      'cat-desserts': [
        'Classic Espresso Tiramisu', 'Saffron Rabri Rasmalai Deluxe', 'Warm Chocolate Lava Cake with Gelato', 
        'Kesar Kulfi Falooda Bowl', 'Hot Jalebi with Saffron Rabri', 'Creamy New York Cheesecake'
      ]
    };

    const foodDescriptions = [
      'Gourmet preparation using finest handpicked ingredients',
      'Artisan crafted for premium luxury dining and rich texture',
      'A perfect balance of organic flavors, calories, and visual charm',
      'A customer favorite, freshly prepared by our specialty chef',
      'High protein, keto-friendly option crafted for health conscious patrons',
      'Delicately seasoned, rich in taste, and beautifully presented',
      'Infused with fresh herbs, organic oils, and house-made spices',
      'Slow cooked to perfection to lock in natural moisture and juice',
      'Exquisite taste profile that brings Toast/Petpooja luxury to your plate',
      'A luxurious blend of seasonal delights that leaves you wanting more'
    ];

    let counter = 1;
    for (const catId of Object.keys(foodNames)) {
      const items = foodNames[catId];
      items.forEach((name, index) => {
        let isVeg = true;
        // Non-veg keywords check for hybrid selection
        const nonVegKeywords = ['chicken', 'mutton', 'rogan josh', 'korma', 'salmon', 'bolognese', 'carbonara', 'wagyu', 'ribeye'];
        const lowerName = name.toLowerCase();
        if (nonVegKeywords.some(k => lowerName.includes(k))) {
          isVeg = false;
        }
        const isVegan = isVeg && index % 3 === 0;
        const isGlutenFree = index % 4 === 0;
        const isKeto = index % 5 === 0;
        const price = Math.round(150 + Math.random() * 800);
        
        this.menuItems.push({
          id: `item-${counter++}`,
          categoryId: catId,
          name,
          description: foodDescriptions[index % foodDescriptions.length],
          price,
          image: this.getMenuImage(catId, name),
          isVeg,
          isVegan,
          isGlutenFree,
          isKeto,
          calories: 120 + Math.round(Math.random() * 600),
          protein: 5 + Math.round(Math.random() * 40),
          carbohydrates: 10 + Math.round(Math.random() * 80),
          fat: 2 + Math.round(Math.random() * 30),
          allergens: this.getAllergens(index),
          isPopular: index < 3,
          isTrending: index >= 3 && index < 6,
          active: true,
          customizations: [
            {
              id: `custom-gp-1-${counter}`,
              name: 'Select Portion Size',
              minSelect: 1,
              maxSelect: 1,
              options: [
                { id: `opt-1-${counter}`, name: 'Regular Size', price: 0, isDefault: true },
                { id: `opt-2-${counter}`, name: 'Grande / Large Size', price: Math.round(price * 0.3), isDefault: false }
              ]
            },
            {
              id: `custom-gp-2-${counter}`,
              name: 'Add Extra Toppings',
              minSelect: 0,
              maxSelect: 4,
              options: [
                { id: `opt-3-${counter}`, name: 'Truffle Drizzle', price: 80, isDefault: false },
                { id: `opt-4-${counter}`, name: 'Extra Cheddar Cheese', price: 50, isDefault: false },
                { id: `opt-5-${counter}`, name: 'Gourmet Mushrooms', price: 70, isDefault: false }
              ]
            }
          ]
        });
      });
    }

    // Seed Tables for Downtown (br-1)
    for (let i = 1; i <= 15; i++) {
      let status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' = 'AVAILABLE';
      if (i % 3 === 0) status = 'OCCUPIED';
      else if (i % 5 === 0) status = 'RESERVED';

      this.tables.push({
        id: `tab-1-${i}`,
        branchId: 'br-1',
        tableNumber: `${100 + i}`,
        capacity: i % 2 === 0 ? 4 : 2,
        status,
        waiterNeeded: i === 3,
        billRequested: i === 6,
        qrCode: `TABLE-1-${100 + i}-VERIFICATION-PAYLOAD`
      });
    }

    // Seed Inventory Items
    const ingredients = [
      { name: 'Organic Sourdough Bread Flour', sku: 'INV-FLR-001', unit: 'kg', min: 20 },
      { name: 'A5 Miyazaki Wagyu Beef', sku: 'INV-BEEF-002', unit: 'kg', min: 5 },
      { name: 'Premium Arabica Coffee Beans', sku: 'INV-COF-003', unit: 'kg', min: 15 },
      { name: 'Aged Truffle Infused Olive Oil', sku: 'INV-OIL-004', unit: 'liters', min: 2 },
      { name: 'Fresh Norwegian Salmon Fillets', sku: 'INV-FISH-005', unit: 'kg', min: 8 },
      { name: 'Belgian Dark Chocolate Chips', sku: 'INV-CHO-006', unit: 'kg', min: 10 },
      { name: 'Fresh Hass Avocados', sku: 'INV-AVO-007', unit: 'units', min: 50 },
      { name: 'Organic Baby Spinach & Greens', sku: 'INV-VEG-008', unit: 'kg', min: 12 },
      { name: 'Gourmet Oyster Mushrooms', sku: 'INV-MUSH-009', unit: 'kg', min: 5 },
      { name: 'Farm Fresh Organic Eggs', sku: 'INV-EGGS-010', unit: 'units', min: 200 },
    ];

    ingredients.forEach((ing, index) => {
      this.inventoryItems.push({
        id: `inv-${index + 1}`,
        branchId: 'br-1',
        name: ing.name,
        sku: ing.sku,
        quantity: Math.round(ing.min * (1.1 + Math.random() * 2)),
        unit: ing.unit,
        minStockLevel: ing.min,
        supplierName: 'Hindustan Fresh Foods Ltd',
        supplierEmail: 'deliveries@hffoods.in',
        expiryDate: new Date(Date.now() + (10 + index * 5) * 24 * 60 * 60 * 1000)
      });
    });

    // Seed Staff Users (with wallet/profile fields)
    this.users = [
      { id: 'user-superadmin', email: 'admin@admin', name: 'Vishal Soni', role: 'SUPER_ADMIN', password: 'admin',
        cashbackBalance: 0, loyaltyPoints: 5000, loyaltyTier: 'PLATINUM', allergies: [], addresses: [
          { id: 'addr-1', label: 'Home', address: '', city: '', isDefault: true },
          { id: 'addr-2', label: 'Office', address: '', city: '', isDefault: false }
        ], birthDate: null, anniversaryDate: null },
      { id: 'user-admin', email: 'admin@dineops.com', name: 'Rajesh Sharma', role: 'ADMIN', password: 'password123',
        cashbackBalance: 0, loyaltyPoints: 200, loyaltyTier: 'SILVER', allergies: [], addresses: [
          { id: 'addr-1', label: 'Home', address: '', city: '', isDefault: true },
          { id: 'addr-2', label: 'Office', address: '', city: '', isDefault: false }
        ], birthDate: null, anniversaryDate: null },
      { id: 'user-manager', email: 'manager@dineops.com', name: 'Simran Kaur', role: 'BRANCH_MANAGER', password: 'password123',
        cashbackBalance: 0, loyaltyPoints: 150, loyaltyTier: 'BRONZE', allergies: [], addresses: [], birthDate: null, anniversaryDate: null },
      { id: 'user-chef', email: 'chef@dineops.com', name: 'Chef Marco D\'Souza', role: 'CHEF', password: 'password123',
        cashbackBalance: 0, loyaltyPoints: 300, loyaltyTier: 'SILVER', allergies: [], addresses: [], birthDate: null, anniversaryDate: null },
      { id: 'user-staff', email: 'staff@dineops.com', name: 'Amit Verma', role: 'KITCHEN_STAFF', password: 'password123',
        cashbackBalance: 0, loyaltyPoints: 100, loyaltyTier: 'BRONZE', allergies: [], addresses: [], birthDate: null, anniversaryDate: null },
      { id: 'user-cashier', email: 'cashier@dineops.com', name: 'Sneha Gupta', role: 'CASHIER', password: 'password123',
        cashbackBalance: 0, loyaltyPoints: 100, loyaltyTier: 'BRONZE', allergies: [], addresses: [], birthDate: null, anniversaryDate: null },
      { id: 'user-delivery', email: 'delivery@dineops.com', name: 'Rahul Yadav', role: 'DELIVERY_STAFF', password: 'password123',
        cashbackBalance: 0, loyaltyPoints: 100, loyaltyTier: 'BRONZE', allergies: [], addresses: [], birthDate: null, anniversaryDate: null },
      { id: 'user-support', email: 'support@dineops.com', name: 'Divya Rao', role: 'SUPPORT_STAFF', password: 'password123',
        cashbackBalance: 0, loyaltyPoints: 100, loyaltyTier: 'BRONZE', allergies: [], addresses: [], birthDate: null, anniversaryDate: null },
      { id: 'user-customer', email: 'customer@dineops.com', name: 'Vishaal Kumar', role: 'CUSTOMER', password: 'password123',
        cashbackBalance: 0, loyaltyPoints: 180, loyaltyTier: 'SILVER', allergies: ['nuts'], addresses: [
          { id: 'addr-1', label: 'Home', address: '45/B West End Road, Bandra West', city: 'Mumbai', isDefault: true },
          { id: 'addr-2', label: 'Office', address: 'Building 4, Naman Chambers, BKC', city: 'Mumbai', isDefault: false }
        ], birthDate: '1995-08-15', anniversaryDate: '2022-04-18' },
    ];

    // Seed Profiles
    this.users.forEach(u => {
      this.reservations.push({
        id: `res-1-${u.id}`,
        userId: u.id,
        tableId: 'tab-1-1',
        guestCount: 2,
        reservationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        timeSlot: '19:00-20:30',
        status: 'CONFIRMED',
        notes: 'Anniversary celebration. Prefer quiet spot.'
      });
    });

    // Seed Shifts
    const today = new Date();
    this.staffShifts = [
      { id: 'sh-1', userId: 'user-chef', branchId: 'br-1', startTime: new Date(today.setHours(9, 0)), endTime: new Date(today.setHours(17, 0)), checkIn: new Date(today.setHours(8, 55)), status: 'ACTIVE', hourlyRate: 450 },
      { id: 'sh-2', userId: 'user-staff', branchId: 'br-1', startTime: new Date(today.setHours(9, 0)), endTime: new Date(today.setHours(17, 0)), checkIn: new Date(today.setHours(9, 0)), status: 'ACTIVE', hourlyRate: 200 },
      { id: 'sh-3', userId: 'user-cashier', branchId: 'br-1', startTime: new Date(today.setHours(8, 30)), endTime: new Date(today.setHours(16, 30)), checkIn: new Date(today.setHours(8, 25)), status: 'ACTIVE', hourlyRate: 250 },
      { id: 'sh-4', userId: 'user-delivery', branchId: 'br-1', startTime: new Date(today.setHours(11, 0)), endTime: new Date(today.setHours(19, 0)), status: 'SCHEDULED', hourlyRate: 150 },
    ];

    // Seed sample Orders
    this.orders = [
      {
        id: 'ord-101',
        branchId: 'br-1',
        customerId: 'user-customer',
        orderNumber: 'BH-2026-9042',
        status: 'PREPARING',
        type: 'DINE_IN',
        subtotal: 780,
        tax: 39,
        deliveryFee: 0,
        discount: 50,
        total: 769,
        paymentMethod: 'UPI',
        paymentStatus: 'PAID',
        paymentTransactionId: 'TXN-UPI-87429184',
        cookingNotes: 'Less spicy, medium rare sliders please.',
        tableId: 'tab-1-3',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        otpVerified: false,
        items: [
          { menuItemId: 'item-1', name: 'DineOps Signature Cold Brew', quantity: 2, price: 180, subtotal: 360 },
          { menuItemId: 'item-11', name: 'A5 Miyazaki Wagyu Sliders', quantity: 1, price: 420, subtotal: 420 }
        ]
      },
      {
        id: 'ord-102',
        branchId: 'br-1',
        customerId: 'user-customer',
        deliveryStaffId: 'user-delivery',
        orderNumber: 'BH-2026-9043',
        status: 'READY',
        type: 'DELIVERY',
        subtotal: 1040,
        tax: 52,
        deliveryFee: 60,
        discount: 100,
        total: 1052,
        paymentMethod: 'CARD',
        paymentStatus: 'PAID',
        paymentTransactionId: 'TXN-CRD-10928420',
        deliveryAddress: 'Apt 4B, Signature Residency, Lane 7, Powai, Mumbai',
        deliveryNotes: 'Leave at lobby reception desk.',
        otp: '4820',
        otpVerified: false,
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
        items: [
          { menuItemId: 'item-2', name: 'Avocado Rose Sourdough Toast', quantity: 2, price: 340, subtotal: 680 },
          { menuItemId: 'item-31', name: 'Warm Sourdough Loaf (Whole)', quantity: 1, price: 360, subtotal: 360 }
        ]
      },
      {
        id: 'ord-103',
        branchId: 'br-1',
        customerId: 'user-customer',
        orderNumber: 'BH-2026-9044',
        status: 'DELIVERED',
        type: 'DELIVERY',
        subtotal: 450,
        tax: 22.5,
        deliveryFee: 40,
        discount: 0,
        total: 512.5,
        paymentMethod: 'UPI',
        paymentStatus: 'PAID',
        paymentTransactionId: 'TXN-UPI-98427104',
        deliveryAddress: '9th Floor, Tech Hub Tower B, Hitec City',
        otp: '1159',
        otpVerified: true,
        createdAt: new Date(Date.now() - 120 * 60 * 1000),
        items: [
          { menuItemId: 'item-61', name: 'Signature Lava Cake with Gelato', quantity: 1, price: 450, subtotal: 450 }
        ]
      }
    ];

    // Seed Coupons
    this.coupons = [
      { id: 'cp-1', code: 'BREWFIRST', discountType: 'PERCENTAGE', value: 20, minOrderValue: 300, maxDiscount: 150, expiresAt: new Date('2027-12-31'), active: true },
      { id: 'cp-2', code: 'LUXURY50', discountType: 'FIXED', value: 50, minOrderValue: 200, expiresAt: new Date('2027-12-31'), active: true },
      { id: 'cp-3', code: 'CHEFSPECIAL', discountType: 'PERCENTAGE', value: 15, minOrderValue: 500, maxDiscount: 200, expiresAt: new Date('2027-12-31'), active: true }
    ];

    // Seed Gift Cards
    this.giftCards = [
      { id: 'gc-1', code: 'BH-GIFT-8942-LUX', userId: 'user-customer', initialBalance: 2000, currentBalance: 1450, active: true, message: 'Exclusive Gift Card!', expiresAt: new Date('2027-06-03') }
    ];

    // Seed Subscriptions
    this.subscriptions = [
      { id: 'sub-1', userId: 'user-customer', planName: 'Monthly Student Meal Plan', active: true, startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), mealsTotal: 30, mealsUsed: 4, pricePaid: 4500 }
    ];
  }

  private getMenuImage(catId: string, name: string): string {
    const lookup: Record<string, string> = {
      // Breakfast Specials
      'Masala Dosa Combo with Podi': '/menu/masala-dosa.png',
      'Chole Bhature Premium Outlets': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80',
      'Idli Sambar Ghee Roast Plate': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80',
      'Rava Upma Bowl with Cashews': '/menu/rava-upma.png',
      'Homestyle Stuffed Aloo Paratha': '/menu/aloo-paratha.png',
      'Fluffy Blueberry Pancakes': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&auto=format&fit=crop&q=80',
      'French Croissants and Jam': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80',

      // European & Pastas
      'Pan-Seared Salmon with Asparagus': 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=500&auto=format&fit=crop&q=80',
      'Truffle Mushroom Fettuccine Alfredo': 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500&auto=format&fit=crop&q=80',
      'Wood-fired Margherita Pizza': '/menu/margherita-pizza.png',
      'Pesto Genovese Penne Pasta': '/menu/pesto-penne.png',
      'Four-Cheese Gorgonzola Gnocchi': '/menu/gnocchi.png',
      'Spaghetti Carbonara Premium': 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&auto=format&fit=crop&q=80',

      // Gourmet Burgers & Grills
      'A5 Miyazaki Wagyu Sliders': '/menu/wagyu-sliders.png',
      'Classic Caesar Salad with Chicken': 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&auto=format&fit=crop&q=80',
      'Gourmet Cottage Cheese Steak': '/menu/paneer-steak.png',
      'Smoked BBQ Chicken Wings': 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80',
      'Flame-broiled Ribeye Steak': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',
      'DineOps Signature Chicken Club': '/menu/chicken-club.png',

      // Executive Indian Meals
      'Rajma Chawal Executive Bowl': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
      'Shahi Paneer Butter Masala': '/menu/paneer-butter-masala.png',
      'Gourmet Butter Naan Basket (3pcs)': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=80',
      'Classic Chicken Tikka Platter': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&auto=format&fit=crop&q=80',
      'Spiced Paneer Tikka Kebab': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=80',
      'Hyderabadi Dum Chicken Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
      'Royal Rajasthani Thali': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80',

      // Artisan Indian Chaat
      'Mumbai Special Vada Pav (2pcs)': 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&auto=format&fit=crop&q=80',
      'Delhi Dahi Papdi Chaat Deluxe': '/menu/papdi-chaat.png',
      'Spicy Pani Puri Golgappa Plate': 'https://images.unsplash.com/photo-1605333396915-47ed6b68a00e?w=500&auto=format&fit=crop&q=80',
      'Samosa Chaat Mint Chutney': '/menu/samosa-chaat.png',
      'Crispy Aloo Tikki Chaat': '/menu/papdi-chaat.png',
      'Bhel Puri Street Style': '/menu/samosa-chaat.png',
      'Sev Puri Classic': '/menu/papdi-chaat.png',

      // Indo-Chinese Fusions
      'Hakka Noodles': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=80',
      'Veg Manchurian': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=80',
      'Crispy Spring Rolls': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80',

      // Beverages & Coolers
      'Saffron Cardamom Cappuccino': 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80',
      'DineOps Masala Cutting Chai': '/menu/cutting-chai.png',
      'Mango Lassi Cardamom Cooler': 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=80',
      'Nimbu Masala Botanical Fizz': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
      'DineOps Signature Cold Brew': '/menu/cold-coffee.png',
      'Sweet Badam Kesari Milk': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80',
      'Classic Mint Mojito': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',

      // Sweet Endings
      'Classic Espresso Tiramisu': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80',
      'Saffron Rabri Rasmalai Deluxe': '/menu/rasmalai.png',
      'Warm Chocolate Lava Cake with Gelato': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
      'Kesar Kulfi Falooda Bowl': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&auto=format&fit=crop&q=80',
      'Hot Jalebi with Saffron Rabri': '/menu/jalebi.png',
      'Creamy New York Cheesecake': 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80'
    };
    // Make sure A5 Miyazaki Wagyu Sliders resolves correctly too
    lookup['A5 Miyazaki Wagyu Sliders'] = '/menu/wagyu-sliders.png';
    return lookup[name] || 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80';
  }

  private getAllergens(index: number): string[] {
    const list = [['dairy'], ['gluten'], ['nuts', 'dairy'], [], ['seafood'], ['soy'], []];
    return list[index % list.length];
  }
}
