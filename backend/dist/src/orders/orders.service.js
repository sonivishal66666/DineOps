"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mock_db_service_1 = require("../prisma/mock-db.service");
let OrdersService = class OrdersService {
    prisma;
    mockDb;
    constructor(prisma, mockDb) {
        this.prisma = prisma;
        this.mockDb = mockDb;
    }
    async placeOrder(dto, userId) {
        const { items, type, branchId, couponCode, deliveryAddress, cookingNotes, deliveryNotes, paymentMethod, tableId } = dto;
        if (!items || items.length === 0) {
            throw new common_1.BadRequestException('Order items are required');
        }
        let subtotal = 0;
        const resolvedItems = [];
        for (const it of items) {
            let menuItem = null;
            if (this.prisma.isConnected) {
                menuItem = await this.prisma.menuItem.findUnique({ where: { id: it.menuItemId } });
            }
            else {
                menuItem = this.mockDb.menuItems.find(item => item.id === it.menuItemId);
            }
            if (!menuItem) {
                throw new common_1.NotFoundException(`Menu item ${it.menuItemId} not found`);
            }
            const itemPrice = Number(menuItem.price);
            let addOnsPrice = 0;
            if (it.customizations && it.customizations.length > 0) {
                it.customizations.forEach((custom) => {
                    if (custom.price)
                        addOnsPrice += Number(custom.price);
                });
            }
            const unitPrice = itemPrice + addOnsPrice;
            const itemSubtotal = unitPrice * it.quantity;
            subtotal += itemSubtotal;
            resolvedItems.push({
                menuItemId: menuItem.id,
                name: menuItem.name,
                quantity: it.quantity,
                price: unitPrice,
                subtotal: itemSubtotal,
                customizations: it.customizations || null,
            });
        }
        let discount = 0;
        if (couponCode) {
            let coupon = null;
            if (this.prisma.isConnected) {
                coupon = await this.prisma.coupon.findUnique({ where: { code: couponCode, active: true } });
            }
            else {
                coupon = this.mockDb.coupons.find(c => c.code === couponCode && c.active);
            }
            if (coupon) {
                const expiresAt = new Date(coupon.expiresAt);
                if (expiresAt > new Date() && subtotal >= Number(coupon.minOrderValue)) {
                    if (coupon.discountType === 'PERCENTAGE') {
                        discount = subtotal * (Number(coupon.value) / 100);
                        if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
                            discount = Number(coupon.maxDiscount);
                        }
                    }
                    else {
                        discount = Number(coupon.value);
                    }
                }
            }
        }
        const tax = Number((subtotal * 0.05).toFixed(2));
        const deliveryFee = type === 'DELIVERY' ? 40 : 0;
        const total = Number((subtotal + tax + deliveryFee - discount).toFixed(2));
        const rand = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `BH-2026-${rand}`;
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        try {
            await this.deductInventoryForItems(resolvedItems, branchId || 'br-1');
        }
        catch (err) {
            console.warn('Inventory auto-deduction failed or skipped:', err.message);
        }
        let finalPaymentStatus = paymentMethod === 'CASH' ? 'PENDING' : 'PAID';
        let finalTxnId = paymentMethod !== 'CASH' ? `TXN-SIM-${Date.now()}` : null;
        if (paymentMethod === 'WALLET' && (userId || dto.customerId)) {
            const activeUserId = userId || dto.customerId;
            const userIdx = this.mockDb.users.findIndex(u => u.id === activeUserId);
            if (userIdx === -1) {
                throw new common_1.BadRequestException('User account not found');
            }
            const balance = this.mockDb.users[userIdx].cashbackBalance || 0;
            if (balance < total) {
                throw new common_1.BadRequestException(`Insufficient wallet balance. Available: ₹${balance.toFixed(2)}, Required: ₹${total.toFixed(2)}`);
            }
            this.mockDb.users[userIdx].cashbackBalance = Number((balance - total).toFixed(2));
            finalPaymentStatus = 'PAID';
            finalTxnId = `TXN-WLT-${Date.now()}`;
        }
        const orderData = {
            branchId: branchId || 'br-1',
            customerId: userId || dto.customerId || null,
            customerEmail: dto.customerEmail || null,
            orderNumber,
            status: 'ORDER_PLACED',
            type,
            subtotal,
            tax,
            deliveryFee,
            discount,
            total,
            paymentMethod: paymentMethod || 'UPI',
            paymentStatus: finalPaymentStatus,
            paymentTransactionId: finalTxnId,
            cookingNotes: cookingNotes || null,
            deliveryNotes: deliveryNotes || null,
            deliveryAddress: deliveryAddress || null,
            tableId: tableId || null,
            otp,
            otpVerified: false,
        };
        if (this.prisma.isConnected) {
            const created = await this.prisma.order.create({
                data: {
                    ...orderData,
                    items: {
                        create: resolvedItems.map(ri => ({
                            menuItemId: ri.menuItemId,
                            quantity: ri.quantity,
                            price: ri.price,
                            customizations: ri.customizations,
                            subtotal: ri.subtotal,
                        })),
                    },
                },
                include: { items: { include: { menuItem: true } } },
            });
            return {
                ...created,
                items: created.items.map(ri => ({
                    ...ri,
                    name: ri.menuItem?.name || 'Unknown Item',
                })),
            };
        }
        else {
            const mockCreated = {
                id: `ord-${Date.now()}`,
                ...orderData,
                createdAt: new Date(),
                items: resolvedItems,
            };
            this.mockDb.orders.push(mockCreated);
            this.mockDb.saveToDisk();
            if (userId) {
                const profIdx = this.mockDb.reservations.findIndex(r => r.userId === userId);
                if (profIdx !== -1) {
                    const pointsEarned = Math.floor(total / 10);
                    this.mockDb.reservations[profIdx].loyaltyPoints = (this.mockDb.reservations[profIdx].loyaltyPoints || 0) + pointsEarned;
                    const points = this.mockDb.reservations[profIdx].loyaltyPoints;
                    if (points >= 1000)
                        this.mockDb.reservations[profIdx].loyaltyTier = 'PLATINUM';
                    else if (points >= 500)
                        this.mockDb.reservations[profIdx].loyaltyTier = 'GOLD';
                    else if (points >= 250)
                        this.mockDb.reservations[profIdx].loyaltyTier = 'SILVER';
                }
            }
            this.mockDb.auditLogs.push({
                id: `audit-${Date.now()}`,
                userId,
                action: 'ORDER_PLACED',
                resource: 'order',
                details: `Placed order ${orderNumber} for total ${total}`,
                createdAt: new Date(),
            });
            return mockCreated;
        }
    }
    async deductInventoryForItems(items, branchId) {
        for (const item of items) {
            let ingredientSku = 'INV-COF-003';
            let deductionQuantity = 0.05 * item.quantity;
            if (item.name.toLowerCase().includes('slider') || item.name.toLowerCase().includes('burger')) {
                ingredientSku = 'INV-BEEF-002';
                deductionQuantity = 0.15 * item.quantity;
            }
            else if (item.name.toLowerCase().includes('toast') || item.name.toLowerCase().includes('sourdough')) {
                ingredientSku = 'INV-FLR-001';
                deductionQuantity = 0.2 * item.quantity;
            }
            else if (item.name.toLowerCase().includes('avocado')) {
                ingredientSku = 'INV-AVO-007';
                deductionQuantity = 1 * item.quantity;
            }
            else if (item.name.toLowerCase().includes('salmon') || item.name.toLowerCase().includes('fish')) {
                ingredientSku = 'INV-FISH-005';
                deductionQuantity = 0.18 * item.quantity;
            }
            if (this.prisma.isConnected) {
                const invItem = await this.prisma.inventoryItem.findFirst({
                    where: { sku: ingredientSku, branchId },
                });
                if (invItem) {
                    await this.prisma.inventoryItem.update({
                        where: { id: invItem.id },
                        data: {
                            quantity: { decrement: deductionQuantity },
                            movements: {
                                create: {
                                    type: 'OUT',
                                    quantity: deductionQuantity,
                                    reason: 'ORDER_AUTO_DEDUCTION',
                                },
                            },
                        },
                    });
                }
            }
            else {
                const invItem = this.mockDb.inventoryItems.find(i => i.sku === ingredientSku && i.branchId === branchId);
                if (invItem) {
                    invItem.quantity = Math.max(0, invItem.quantity - deductionQuantity);
                    this.mockDb.inventoryItems.push({
                        id: `inv-move-${Date.now()}`,
                        branchId,
                        name: invItem.name,
                        sku: invItem.sku,
                        quantity: deductionQuantity,
                        unit: invItem.unit,
                        minStockLevel: invItem.minStockLevel,
                        supplierName: 'OUT',
                        supplierEmail: 'ORDER_AUTO_DEDUCTION',
                    });
                }
            }
        }
    }
    async getOrders(userId, role) {
        if (this.prisma.isConnected) {
            const where = {};
            if (role === 'CUSTOMER' && userId) {
                where.customerId = userId;
            }
            else if (role === 'CHEF' || role === 'KITCHEN_STAFF') {
                where.status = { in: ['ORDER_PLACED', 'PAYMENT_CONFIRMED', 'ACCEPTED', 'PREPARING', 'COOKING', 'PACKED', 'READY'] };
            }
            else if (role === 'DELIVERY_STAFF') {
                where.OR = [
                    { status: 'READY' },
                    { status: 'OUT_FOR_DELIVERY', deliveryStaffId: userId },
                ];
            }
            const dbOrders = await this.prisma.order.findMany({
                where,
                include: { items: { include: { menuItem: true } } },
                orderBy: { createdAt: 'desc' },
            });
            return dbOrders.map(o => ({
                ...o,
                items: o.items.map(it => ({
                    ...it,
                    name: it.menuItem?.name || 'Unknown Item',
                })),
            }));
        }
        else {
            let list = [...this.mockDb.orders];
            if (role === 'CUSTOMER' && userId) {
                list = list.filter(o => o.customerId === userId);
            }
            else if (role === 'CHEF' || role === 'KITCHEN_STAFF') {
                list = list.filter(o => ['ORDER_PLACED', 'PAYMENT_CONFIRMED', 'ACCEPTED', 'PREPARING', 'COOKING', 'PACKED', 'READY'].includes(o.status));
            }
            else if (role === 'DELIVERY_STAFF') {
                list = list.filter(o => o.status === 'READY' || (o.status === 'OUT_FOR_DELIVERY' && o.deliveryStaffId === userId));
            }
            return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }
    }
    async updateStatus(orderId, status, deliveryStaffId) {
        if (this.prisma.isConnected) {
            const data = { status };
            if (deliveryStaffId && status === 'OUT_FOR_DELIVERY') {
                data.deliveryStaffId = deliveryStaffId;
            }
            const updated = await this.prisma.order.update({
                where: { id: orderId },
                data,
            });
            if (status === 'DELIVERED' && updated.tableId) {
                await this.prisma.table.update({
                    where: { id: updated.tableId },
                    data: { status: 'AVAILABLE', waiterNeeded: false, billRequested: false },
                });
            }
            return updated;
        }
        else {
            const idx = this.mockDb.orders.findIndex(o => o.id === orderId);
            if (idx === -1)
                throw new common_1.NotFoundException('Order not found');
            this.mockDb.orders[idx].status = status;
            if (deliveryStaffId && status === 'OUT_FOR_DELIVERY') {
                this.mockDb.orders[idx].deliveryStaffId = deliveryStaffId;
            }
            if (status === 'DELIVERED' || status === 'COMPLETED') {
                const tableId = this.mockDb.orders[idx].tableId;
                if (tableId) {
                    const tIdx = this.mockDb.tables.findIndex(t => t.id === tableId);
                    if (tIdx !== -1) {
                        this.mockDb.tables[tIdx].status = 'AVAILABLE';
                        this.mockDb.tables[tIdx].waiterNeeded = false;
                        this.mockDb.tables[tIdx].billRequested = false;
                    }
                }
            }
            this.mockDb.saveToDisk();
            return this.mockDb.orders[idx];
        }
    }
    async verifyOtp(orderId, otp) {
        if (this.prisma.isConnected) {
            const order = await this.prisma.order.findUnique({ where: { id: orderId } });
            if (!order)
                throw new common_1.NotFoundException('Order not found');
            if (order.otp !== otp)
                throw new common_1.BadRequestException('Invalid verification OTP');
            return this.prisma.order.update({
                where: { id: orderId },
                data: { otpVerified: true, status: 'DELIVERED' },
            });
        }
        else {
            const idx = this.mockDb.orders.findIndex(o => o.id === orderId);
            if (idx === -1)
                throw new common_1.NotFoundException('Order not found');
            const order = this.mockDb.orders[idx];
            if (order.otp !== otp)
                throw new common_1.BadRequestException('Invalid verification OTP');
            this.mockDb.orders[idx].otpVerified = true;
            this.mockDb.orders[idx].status = 'DELIVERED';
            this.mockDb.saveToDisk();
            return this.mockDb.orders[idx];
        }
    }
    async splitBill(orderId, guestsCount) {
        let order = null;
        if (this.prisma.isConnected) {
            order = await this.prisma.order.findUnique({ where: { id: orderId } });
        }
        else {
            order = this.mockDb.orders.find(o => o.id === orderId);
        }
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const amountPerGuest = Number((Number(order.total) / guestsCount).toFixed(2));
        return {
            orderId,
            orderNumber: order.orderNumber,
            total: Number(order.total),
            guestsCount,
            amountPerGuest,
            splitDetails: Array.from({ length: guestsCount }).map((_, i) => ({
                guestNumber: i + 1,
                share: amountPerGuest,
                status: i === 0 ? 'PAID' : 'PENDING',
            })),
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mock_db_service_1.MockDbService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map