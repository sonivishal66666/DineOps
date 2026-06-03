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
    status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
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
export declare class MockDbService {
    private readonly logger;
    categories: MockCategory[];
    menuItems: MockMenuItem[];
    branches: MockBranch[];
    tables: MockTable[];
    orders: MockOrder[];
    inventoryItems: MockInventory[];
    staffShifts: MockShift[];
    users: any[];
    reservations: any[];
    giftCards: any[];
    coupons: any[];
    subscriptions: any[];
    auditLogs: any[];
    reviews: any[];
    constructor();
    triggerNotification(userId: string, title: string, body: string): void;
    private getPersistencePath;
    private loadFromDisk;
    saveToDisk(): void;
    private seedAll;
    private getMenuImage;
    private getAllergens;
}
