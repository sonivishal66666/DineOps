"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding Database with BrewHub Enterprise defaults...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.table.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.menuCategory.deleteMany();
    await prisma.branch.deleteMany();
    const superAdminHash = await bcrypt.hash('admin', 10);
    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@admin' },
        update: {},
        create: {
            email: 'admin@admin',
            password: superAdminHash,
            name: 'Vikram Aditya Singhania',
            role: client_1.Role.SUPER_ADMIN,
            profile: {
                create: {
                    loyaltyTier: client_1.LoyaltyTier.PLATINUM,
                    loyaltyPoints: 5000,
                }
            }
        }
    });
    const customer = await prisma.user.upsert({
        where: { email: 'customer@dineops.com' },
        update: {},
        create: {
            email: 'customer@dineops.com',
            password: await bcrypt.hash('password123', 10),
            name: 'Vishaal Kumar',
            role: client_1.Role.CUSTOMER,
            profile: {
                create: {
                    loyaltyTier: client_1.LoyaltyTier.SILVER,
                    loyaltyPoints: 180,
                    cashbackBalance: 75.00,
                }
            }
        }
    });
    console.log(`Users seeded: SuperAdmin (${superAdmin.email}), Customer (${customer.email})`);
    const mainBranch = await prisma.branch.create({
        data: {
            name: 'Downtown flagship',
            address: '456 Luxury Blvd',
            city: 'Mumbai',
            phone: '+919999999001',
            active: 'true',
        }
    });
    console.log(`Branch seeded: ${mainBranch.name}`);
    const categories = [
        { id: 'cat-breakfast', name: 'Breakfast Specials', description: 'Morning dosas, fluffy blueberry pancakes, and light starters', sortOrder: 1 },
        { id: 'cat-italian', name: 'Italian & Pastas', description: 'Wood-fired pizzas, slow-cooked lasagna, and creamy fettuccine', sortOrder: 2 },
        { id: 'cat-grill', name: 'Gourmet Burgers & Grills', description: 'A5 Miyazaki Wagyu sliders, chicken wings, and grilled steaks', sortOrder: 3 },
        { id: 'cat-chaat', name: 'Artisan Indian Chaat', description: 'Tangy golgappas, crispy samosa chaat, and pav bhaji platters', sortOrder: 4 },
        { id: 'cat-drinks', name: 'Hot Coffee & Beverages', description: 'Saffron cardamom cappuccino, cutting chai, and coolers', sortOrder: 5 },
        { id: 'cat-desserts', name: 'Sweet Endings', description: 'Classic tiramisu, saffron rabri rasmalai, and lava cakes', sortOrder: 6 }
    ];
    for (const cat of categories) {
        await prisma.menuCategory.upsert({
            where: { id: cat.id },
            update: {},
            create: cat
        });
    }
    console.log('Categories seeded.');
    const menuItems = [
        { id: 'item-1', categoryId: 'cat-breakfast', name: 'Masala Dosa Combo with Podi', price: 180, isVeg: true, calories: 340, image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop' },
        { id: 'item-2', categoryId: 'cat-breakfast', name: 'Fluffy Blueberry Pancakes', price: 220, isVeg: true, calories: 580, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&auto=format&fit=crop' },
        { id: 'item-3', categoryId: 'cat-breakfast', name: 'Idli Sambar Ghee Roast Plate', price: 150, isVeg: true, calories: 210, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop' },
        { id: 'item-4', categoryId: 'cat-italian', name: 'Truffle Mushroom Fettuccine Alfredo', price: 450, isVeg: true, calories: 890, image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500&auto=format&fit=crop' },
        { id: 'item-5', categoryId: 'cat-italian', name: 'Wood-fired Margherita Pizza', price: 320, isVeg: true, calories: 620, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop' },
        { id: 'item-6', categoryId: 'cat-italian', name: 'Slow-cooked Bolognese Lasagna', price: 390, isVeg: false, calories: 680, image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500&auto=format&fit=crop' },
        { id: 'item-7', categoryId: 'cat-grill', name: 'A5 Miyazaki Wagyu Sliders', price: 380, isVeg: false, calories: 720, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop' },
        { id: 'item-8', categoryId: 'cat-grill', name: 'Classic Caesar Salad with Chicken', price: 290, isVeg: false, calories: 340, image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&auto=format&fit=crop' },
        { id: 'item-9', categoryId: 'cat-chaat', name: 'Delhi Dahi Papdi Chaat Deluxe', price: 120, isVeg: true, calories: 280, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&auto=format&fit=crop' },
        { id: 'item-10', categoryId: 'cat-chaat', name: 'Mumbai Special Vada Pav (2pcs)', price: 90, isVeg: true, calories: 310, image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop' },
        { id: 'item-11', categoryId: 'cat-drinks', name: 'Saffron Cardamom Cappuccino', price: 140, isVeg: true, calories: 240, image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop' },
        { id: 'item-12', categoryId: 'cat-drinks', name: 'BrewHub Masala Cutting Chai', price: 80, isVeg: true, calories: 95, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop' },
        { id: 'item-13', categoryId: 'cat-desserts', name: 'Classic Espresso Tiramisu', price: 180, isVeg: true, calories: 320, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop' },
        { id: 'item-14', categoryId: 'cat-desserts', name: 'Warm Chocolate Lava Cake with Gelato', price: 150, isVeg: true, calories: 410, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop' }
    ];
    for (const item of menuItems) {
        const hasCustomization = item.name.toLowerCase().includes('pizza');
        await prisma.menuItem.upsert({
            where: { id: item.id },
            update: {},
            create: {
                id: item.id,
                categoryId: item.categoryId,
                name: item.name,
                price: item.price,
                isVeg: item.isVeg,
                calories: item.calories,
                image: item.image,
                active: true,
                customizations: hasCustomization ? {
                    create: {
                        name: 'Select Size',
                        minSelect: 1,
                        maxSelect: 1,
                        options: {
                            create: [
                                { name: 'Regular Size', price: 0, isDefault: true },
                                { name: 'Grande Size', price: 50, isDefault: false }
                            ]
                        }
                    }
                } : undefined
            }
        });
    }
    console.log('Sample customized dishes seeded.');
    for (let i = 1; i <= 5; i++) {
        const tableNum = (100 + i).toString();
        await prisma.table.create({
            data: {
                branchId: mainBranch.id,
                tableNumber: tableNum,
                capacity: i % 2 === 0 ? 4 : 2,
                status: i === 2 ? 'OCCUPIED' : 'AVAILABLE',
                qrCode: `TABLE-${mainBranch.id}-${tableNum}-QR`
            }
        });
    }
    console.log('Tables layout seeded.');
    await prisma.order.create({
        data: {
            branchId: mainBranch.id,
            customerId: customer.id,
            orderNumber: 'BH-2026-9042',
            status: 'PREPARING',
            type: 'DINE_IN',
            subtotal: 760,
            tax: 38.00,
            deliveryFee: 0,
            discount: 0,
            total: 798,
            paymentMethod: 'UPI',
            paymentStatus: 'PAID',
            paymentTransactionId: 'TXN-SEED-1',
            items: {
                create: [
                    { menuItemId: 'item-7', quantity: 2, price: 380, subtotal: 760 }
                ]
            }
        }
    });
    await prisma.order.create({
        data: {
            branchId: mainBranch.id,
            customerId: customer.id,
            orderNumber: 'BH-2026-9043',
            status: 'DELIVERED',
            type: 'DELIVERY',
            subtotal: 900,
            tax: 45.00,
            deliveryFee: 40,
            discount: 0,
            total: 985,
            paymentMethod: 'UPI',
            paymentStatus: 'PAID',
            paymentTransactionId: 'TXN-SEED-2',
            deliveryAddress: 'Apt 4B, Signature Residency, Bandra',
            items: {
                create: [
                    { menuItemId: 'item-4', quantity: 2, price: 450, subtotal: 900 }
                ]
            }
        }
    });
    await prisma.order.create({
        data: {
            branchId: mainBranch.id,
            customerId: superAdmin.id,
            orderNumber: 'BH-2026-9045',
            status: 'DELIVERED',
            type: 'DINE_IN',
            subtotal: 510,
            tax: 25.50,
            deliveryFee: 0,
            discount: 0,
            total: 535.50,
            paymentMethod: 'CARD',
            paymentStatus: 'PAID',
            paymentTransactionId: 'TXN-SEED-3',
            items: {
                create: [
                    { menuItemId: 'item-13', quantity: 1, price: 180, subtotal: 180 },
                    { menuItemId: 'item-10', quantity: 1, price: 330, subtotal: 330 }
                ]
            }
        }
    });
    console.log('Orders seeded.');
    console.log('Database seeding finished successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map