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
exports.OperationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mock_db_service_1 = require("../prisma/mock-db.service");
let OperationsService = class OperationsService {
    prisma;
    mockDb;
    constructor(prisma, mockDb) {
        this.prisma = prisma;
        this.mockDb = mockDb;
    }
    async getTables(branchId) {
        const brId = branchId || 'br-1';
        if (this.prisma.isConnected) {
            return this.prisma.table.findMany({
                where: { branchId: brId },
                orderBy: { tableNumber: 'asc' },
            });
        }
        else {
            return this.mockDb.tables.filter(t => t.branchId === brId);
        }
    }
    async reserveTable(dto, userId) {
        const { tableId, guestCount, reservationDate, timeSlot, notes } = dto;
        if (this.prisma.isConnected) {
            return this.prisma.tableReservation.create({
                data: {
                    tableId,
                    userId,
                    guestCount,
                    reservationDate: new Date(reservationDate),
                    timeSlot,
                    status: 'CONFIRMED',
                    notes,
                },
            });
        }
        else {
            const newRes = {
                id: `res-${Date.now()}`,
                tableId,
                userId,
                guestCount,
                reservationDate: new Date(reservationDate),
                timeSlot,
                status: 'CONFIRMED',
                notes,
            };
            this.mockDb.reservations.push(newRes);
            if (tableId) {
                const tableIdx = this.mockDb.tables.findIndex(t => t.id === tableId);
                if (tableIdx !== -1) {
                    this.mockDb.tables[tableIdx].status = 'RESERVED';
                }
            }
            return newRes;
        }
    }
    async updateTableQR(tableId, actions) {
        if (this.prisma.isConnected) {
            return this.prisma.table.update({
                where: { id: tableId },
                data: actions,
            });
        }
        else {
            const idx = this.mockDb.tables.findIndex(t => t.id === tableId);
            if (idx === -1)
                throw new common_1.NotFoundException('Table not found');
            if (actions.status !== undefined)
                this.mockDb.tables[idx].status = actions.status;
            if (actions.waiterNeeded !== undefined)
                this.mockDb.tables[idx].waiterNeeded = actions.waiterNeeded;
            if (actions.billRequested !== undefined)
                this.mockDb.tables[idx].billRequested = actions.billRequested;
            this.mockDb.saveToDisk();
            return this.mockDb.tables[idx];
        }
    }
    async getInventory(branchId) {
        const brId = branchId || 'br-1';
        if (this.prisma.isConnected) {
            return this.prisma.inventoryItem.findMany({
                where: { branchId: brId },
                include: { movements: true },
            });
        }
        else {
            const items = this.mockDb.inventoryItems.filter(i => i.branchId === brId);
            return items.filter(i => !i.supplierEmail || i.supplierEmail !== 'ORDER_AUTO_DEDUCTION');
        }
    }
    async addInventoryMovement(dto) {
        const { itemId, type, quantity, reason } = dto;
        if (this.prisma.isConnected) {
            return this.prisma.inventoryMovement.create({
                data: {
                    inventoryItemId: itemId,
                    type,
                    quantity,
                    reason,
                },
            });
        }
        else {
            const itemIdx = this.mockDb.inventoryItems.findIndex(i => i.id === itemId);
            if (itemIdx === -1)
                throw new common_1.NotFoundException('Inventory item not found');
            const qty = Number(quantity);
            if (type === 'IN') {
                this.mockDb.inventoryItems[itemIdx].quantity += qty;
            }
            else {
                this.mockDb.inventoryItems[itemIdx].quantity = Math.max(0, this.mockDb.inventoryItems[itemIdx].quantity - qty);
            }
            return { success: true, updatedStock: this.mockDb.inventoryItems[itemIdx].quantity };
        }
    }
    async getShifts(branchId) {
        const brId = branchId || 'br-1';
        if (this.prisma.isConnected) {
            return this.prisma.staffShift.findMany({
                where: { branchId: brId },
                include: { user: true },
            });
        }
        else {
            const staffUsers = this.mockDb.users.filter(u => u.role !== 'CUSTOMER');
            const today = new Date();
            staffUsers.forEach(u => {
                const hasShift = this.mockDb.staffShifts.some(s => s.userId === u.id);
                if (!hasShift) {
                    this.mockDb.staffShifts.push({
                        id: `sh-${Date.now()}-${u.id}`,
                        userId: u.id,
                        branchId: brId,
                        startTime: new Date(new Date(today).setHours(9, 0, 0, 0)),
                        endTime: new Date(new Date(today).setHours(17, 0, 0, 0)),
                        status: 'SCHEDULED',
                        hourlyRate: u.role === 'CHEF' ? 450 : u.role === 'ADMIN' ? 350 : 200,
                    });
                }
            });
            this.mockDb.saveToDisk();
            return this.mockDb.staffShifts.filter(s => s.branchId === brId).map(s => {
                const u = this.mockDb.users.find(usr => usr.id === s.userId);
                return { ...s, user: u };
            });
        }
    }
    async clockShift(shiftId, type) {
        const now = new Date();
        if (this.prisma.isConnected) {
            const updateData = {};
            if (type === 'IN') {
                updateData.checkIn = now;
                updateData.status = 'ACTIVE';
            }
            else {
                updateData.checkOut = now;
                updateData.status = 'COMPLETED';
            }
            return this.prisma.staffShift.update({
                where: { id: shiftId },
                data: updateData,
            });
        }
        else {
            const idx = this.mockDb.staffShifts.findIndex(s => s.id === shiftId);
            if (idx === -1)
                throw new common_1.NotFoundException('Shift not found');
            if (type === 'IN') {
                this.mockDb.staffShifts[idx].checkIn = now;
                this.mockDb.staffShifts[idx].status = 'ACTIVE';
            }
            else {
                this.mockDb.staffShifts[idx].checkOut = now;
                this.mockDb.staffShifts[idx].status = 'COMPLETED';
            }
            return this.mockDb.staffShifts[idx];
        }
    }
    async getAiRecommendations(userId) {
        let items = [...this.mockDb.menuItems];
        const recommendations = items.filter(i => i.isPopular || i.isTrending).slice(0, 5);
        return {
            recommendations,
            smartUpselling: [
                { item: items.find(i => i.id === 'item-1'), pairing: 'Butter Flaky Croissant', discount: '10% Combo discount applied' },
                { item: items.find(i => i.id === 'item-21'), pairing: 'Smoked Rosemary Lemonade', discount: 'Extra 50 Cashback' }
            ]
        };
    }
    async getAiForecasts() {
        const today = new Date();
        return {
            peakHours: [
                { day: 'Friday', peakTime: '19:00 - 22:00', confidence: '94%', reason: 'Weekend dinner traffic spike' },
                { day: 'Saturday', peakTime: '13:00 - 16:00', confidence: '97%', reason: 'Brunch and family sharing platter demands' },
                { day: 'Sunday', peakTime: '18:00 - 21:00', confidence: '92%', reason: 'Sunday evening delivery rush' }
            ],
            demandForecasting: [
                { ingredient: 'Organic Sourdough Bread Flour', forecastedWeeklyNeed: '150 kg', currentStock: '64 kg', actionRequired: 'Auto-refill triggered. ETA Friday.' },
                { ingredient: 'Premium Arabica Coffee Beans', forecastedWeeklyNeed: '80 kg', currentStock: '42 kg', actionRequired: 'Stock sufficient' },
                { ingredient: 'A5 Miyazaki Wagyu Beef', forecastedWeeklyNeed: '25 kg', currentStock: '18 kg', actionRequired: 'Stock sufficient' }
            ],
            revenueForecast: [
                { month: 'June 2026', actual: 485000, projected: 520000, growth: '+7.2%' },
                { month: 'July 2026', projected: 565000, growth: '+8.6%' }
            ],
            marketingSuggestions: [
                { title: 'Monsoon Chai & Pastry Push', trigger: 'Rain forecast in Mumbai on Friday', promoCode: 'RAINYBREW', channel: 'WhatsApp / Push Notification' }
            ]
        };
    }
    async analyzeReviewSentiment(menuItemId, comment) {
        const lowercase = comment.toLowerCase();
        let sentiment = 'NEUTRAL';
        if (lowercase.includes('best') || lowercase.includes('great') || lowercase.includes('amazing') || lowercase.includes('delicious') || lowercase.includes('love')) {
            sentiment = 'POSITIVE';
        }
        else if (lowercase.includes('bad') || lowercase.includes('worst') || lowercase.includes('stale') || lowercase.includes('cold') || lowercase.includes('poor')) {
            sentiment = 'NEGATIVE';
        }
        const review = {
            id: `rev-${Date.now()}`,
            menuItemId,
            rating: sentiment === 'POSITIVE' ? 5 : sentiment === 'NEGATIVE' ? 2 : 4,
            comment,
            sentiment,
            createdAt: new Date()
        };
        this.mockDb.reviews.push(review);
        return review;
    }
    async triggerAiChat(message) {
        const q = message.toLowerCase();
        let response = "Welcome to DineOps's AI Concierge. I can help you recommend a meal, book a table, or track orders. How can I delight you today?";
        if (q.includes('recommend') || q.includes('eat') || q.includes('hungry')) {
            response = "I highly recommend our signature Miyazaki Wagyu Sliders paired with the Rosemary Smoked Cappuccino. For health conscious diners, our Keto Salmon Avocado Bowl is trending today!";
        }
        else if (q.includes('table') || q.includes('book') || q.includes('reserve')) {
            response = "Sure, I can assist with reservations. Head over to our Table Booking section, select table 104 or 105 for premium floor views, and confirm your slot instantly.";
        }
        else if (q.includes('order') || q.includes('track')) {
            response = "You can view your active orders under the Realtime tracking screen. Currently, your order BH-2026-9042 is being prepared by Chef Marco.";
        }
        return { response };
    }
    async createPaymentSession(orderId, amount) {
        const transactionId = `TXN-CF-${Date.now()}`;
        return {
            success: true,
            paymentSessionId: `session_cf_98142${Date.now()}`,
            cfOrderId: `cf_order_${Date.now()}`,
            orderId,
            amount,
            currency: 'INR',
            paymentLink: `https://test.cashfree.com/billpay/checkout/sim-${transactionId}`,
        };
    }
    async verifyPayment(orderId, transactionId) {
        if (this.prisma.isConnected) {
            await this.prisma.order.update({
                where: { id: orderId },
                data: { paymentStatus: 'PAID', paymentTransactionId: transactionId, status: 'PAYMENT_CONFIRMED' },
            });
        }
        else {
            const idx = this.mockDb.orders.findIndex(o => o.id === orderId);
            if (idx !== -1) {
                this.mockDb.orders[idx].paymentStatus = 'PAID';
                this.mockDb.orders[idx].paymentTransactionId = transactionId;
                this.mockDb.orders[idx].status = 'PAYMENT_CONFIRMED';
            }
        }
        return { success: true, message: 'Payment verified and status updated to CONFIRMED.' };
    }
    async getReservations() {
        if (this.prisma.isConnected) {
            return this.prisma.tableReservation.findMany({
                include: { user: true, table: true },
            });
        }
        else {
            return this.mockDb.reservations.map(r => {
                const u = this.mockDb.users.find(usr => usr.id === r.userId);
                const t = this.mockDb.tables.find(tbl => tbl.id === r.tableId);
                return {
                    ...r,
                    user: u ? { name: u.name, email: u.email } : null,
                    table: t ? { tableNumber: t.tableNumber, capacity: t.capacity } : null,
                };
            });
        }
    }
    async updateReservation(id, dto) {
        if (this.prisma.isConnected) {
            return this.prisma.tableReservation.update({
                where: { id },
                data: {
                    guestCount: Number(dto.guestCount),
                    reservationDate: new Date(dto.reservationDate),
                    timeSlot: dto.timeSlot,
                    status: dto.status,
                    tableId: dto.tableId,
                    notes: dto.notes,
                },
            });
        }
        else {
            const idx = this.mockDb.reservations.findIndex(r => r.id === id);
            if (idx === -1)
                throw new common_1.NotFoundException('Reservation not found');
            const oldTableId = this.mockDb.reservations[idx].tableId;
            const newTableId = dto.tableId;
            this.mockDb.reservations[idx] = {
                ...this.mockDb.reservations[idx],
                guestCount: Number(dto.guestCount),
                reservationDate: new Date(dto.reservationDate),
                timeSlot: dto.timeSlot,
                status: dto.status,
                tableId: dto.tableId,
                notes: dto.notes,
            };
            if (oldTableId !== newTableId) {
                const oldTableIdx = this.mockDb.tables.findIndex(t => t.id === oldTableId);
                if (oldTableIdx !== -1) {
                    this.mockDb.tables[oldTableIdx].status = 'AVAILABLE';
                }
                const newTableIdx = this.mockDb.tables.findIndex(t => t.id === newTableId);
                if (newTableIdx !== -1) {
                    this.mockDb.tables[newTableIdx].status = 'RESERVED';
                }
            }
            this.mockDb.saveToDisk();
            return this.mockDb.reservations[idx];
        }
    }
    async deleteReservation(id) {
        if (this.prisma.isConnected) {
            return this.prisma.tableReservation.delete({
                where: { id },
            });
        }
        else {
            const idx = this.mockDb.reservations.findIndex(r => r.id === id);
            if (idx === -1)
                throw new common_1.NotFoundException('Reservation not found');
            const tableId = this.mockDb.reservations[idx].tableId;
            this.mockDb.reservations.splice(idx, 1);
            const tableIdx = this.mockDb.tables.findIndex(t => t.id === tableId);
            if (tableIdx !== -1) {
                this.mockDb.tables[tableIdx].status = 'AVAILABLE';
            }
            this.mockDb.saveToDisk();
            return { success: true };
        }
    }
    async addReview(dto) {
        const { orderId, orderNumber, rating, comment, customerName, customerEmail } = dto;
        const lowercase = (comment || '').toLowerCase();
        let sentiment = 'NEUTRAL';
        if (lowercase.includes('best') || lowercase.includes('great') || lowercase.includes('amazing') || lowercase.includes('delicious') || lowercase.includes('love') || lowercase.includes('good') || lowercase.includes('nice')) {
            sentiment = 'POSITIVE';
        }
        else if (lowercase.includes('bad') || lowercase.includes('worst') || lowercase.includes('stale') || lowercase.includes('cold') || lowercase.includes('poor')) {
            sentiment = 'NEGATIVE';
        }
        const review = {
            id: `rev-${Date.now()}`,
            orderId,
            orderNumber,
            rating: Number(rating) || 5,
            comment,
            sentiment,
            customerName: customerName || 'Valued Guest',
            customerEmail: customerEmail || 'guest@example.com',
            createdAt: new Date()
        };
        this.mockDb.reviews.push(review);
        this.mockDb.saveToDisk();
        return review;
    }
    async getReviews() {
        return this.mockDb.reviews;
    }
    async purchaseGiftVoucher(dto) {
        const { amount, recipientEmail, senderId } = dto;
        const senderIdx = this.mockDb.users.findIndex(u => u.id === senderId);
        const senderName = senderIdx !== -1 ? this.mockDb.users[senderIdx].name : 'A friend';
        const recipientIdx = this.mockDb.users.findIndex(u => u.email.toLowerCase() === recipientEmail.toLowerCase());
        if (recipientIdx === -1) {
            throw new common_1.NotFoundException(`No registered account found with email ${recipientEmail}.`);
        }
        const recipient = this.mockDb.users[recipientIdx];
        this.mockDb.users[recipientIdx].cashbackBalance =
            (this.mockDb.users[recipientIdx].cashbackBalance || 0) + Number(amount);
        if (!this.mockDb.users[recipientIdx].loyaltyPoints) {
            this.mockDb.users[recipientIdx].loyaltyPoints = 100;
            this.mockDb.users[recipientIdx].loyaltyTier = 'BRONZE';
        }
        this.mockDb.giftCards.push({
            id: `gc-${Date.now()}`,
            code: `BH-GIFT-${Math.floor(Math.random() * 9000) + 1000}`,
            senderId,
            recipientId: recipient.id,
            recipientEmail,
            amount: Number(amount),
            active: true,
            createdAt: new Date(),
        });
        this.mockDb.triggerNotification(recipient.id, '🎁 Gift Wallet Credit Received!', `${senderName} sent you a ₹${amount} gift voucher! ₹${amount} has been credited to your DineOps Wallet.`);
        this.mockDb.saveToDisk();
        return {
            success: true,
            message: `Gift voucher of ₹${amount} successfully sent to ${recipient.name}. Their wallet has been credited.`,
            recipientName: recipient.name,
        };
    }
    async getCoupons() {
        return this.mockDb.coupons;
    }
    async createCoupon(dto) {
        const { code, discountType, value, minOrderValue, maxDiscount, expiresAt } = dto;
        const newCoupon = {
            id: `cp-${Date.now()}`,
            code: code.toUpperCase(),
            discountType: discountType || 'PERCENTAGE',
            value: Number(value),
            minOrderValue: Number(minOrderValue || 0),
            maxDiscount: maxDiscount ? Number(maxDiscount) : null,
            expiresAt: expiresAt ? new Date(expiresAt) : new Date('2027-12-31'),
            active: true,
        };
        this.mockDb.coupons.push(newCoupon);
        this.mockDb.saveToDisk();
        return newCoupon;
    }
    async toggleCoupon(id) {
        const idx = this.mockDb.coupons.findIndex(c => c.id === id);
        if (idx === -1) {
            throw new common_1.NotFoundException(`Coupon with ID ${id} not found.`);
        }
        this.mockDb.coupons[idx].active = !this.mockDb.coupons[idx].active;
        this.mockDb.saveToDisk();
        return this.mockDb.coupons[idx];
    }
    async deleteCoupon(id) {
        const idx = this.mockDb.coupons.findIndex(c => c.id === id);
        if (idx === -1) {
            throw new common_1.NotFoundException(`Coupon with ID ${id} not found.`);
        }
        const deleted = this.mockDb.coupons.splice(idx, 1);
        this.mockDb.saveToDisk();
        return { success: true, deleted: deleted[0] };
    }
};
exports.OperationsService = OperationsService;
exports.OperationsService = OperationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mock_db_service_1.MockDbService])
], OperationsService);
//# sourceMappingURL=operations.service.js.map