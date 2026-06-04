import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockDbService } from '../prisma/mock-db.service';

@Injectable()
export class OperationsService {
  constructor(
    private prisma: PrismaService,
    private mockDb: MockDbService,
  ) {}

  // ==================== TABLE MANAGEMENT & CONTACTLESS ====================

  async getTables(branchId?: string) {
    const brId = branchId || 'br-1';
    if (this.prisma.isConnected) {
      return this.prisma.table.findMany({
        where: { branchId: brId },
        orderBy: { tableNumber: 'asc' },
      });
    } else {
      return this.mockDb.tables.filter(t => t.branchId === brId);
    }
  }

  async reserveTable(dto: any, userId: string) {
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
    } else {
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
      
      // Update table status
      if (tableId) {
        const tableIdx = this.mockDb.tables.findIndex(t => t.id === tableId);
        if (tableIdx !== -1) {
          this.mockDb.tables[tableIdx].status = 'RESERVED';
        }
      }
      return newRes;
    }
  }

  async updateTableQR(tableId: string, actions: { status?: any; waiterNeeded?: boolean; billRequested?: boolean }) {
    if (this.prisma.isConnected) {
      return this.prisma.table.update({
        where: { id: tableId },
        data: actions,
      });
    } else {
      const idx = this.mockDb.tables.findIndex(t => t.id === tableId);
      if (idx === -1) throw new NotFoundException('Table not found');
      if (actions.status !== undefined) this.mockDb.tables[idx].status = actions.status as any;
      if (actions.waiterNeeded !== undefined) this.mockDb.tables[idx].waiterNeeded = actions.waiterNeeded;
      if (actions.billRequested !== undefined) this.mockDb.tables[idx].billRequested = actions.billRequested;
      this.mockDb.saveToDisk();
      return this.mockDb.tables[idx];
    }
  }

  // ==================== INVENTORY MANAGEMENT ====================

  async getInventory(branchId?: string) {
    const brId = branchId || 'br-1';
    if (this.prisma.isConnected) {
      return this.prisma.inventoryItem.findMany({
        where: { branchId: brId },
        include: { movements: true },
      });
    } else {
      const items = this.mockDb.inventoryItems.filter(i => i.branchId === brId);
      // Filter out raw movements stored as items
      return items.filter(i => !i.supplierEmail || i.supplierEmail !== 'ORDER_AUTO_DEDUCTION');
    }
  }

  async addInventoryMovement(dto: any) {
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
    } else {
      const itemIdx = this.mockDb.inventoryItems.findIndex(i => i.id === itemId);
      if (itemIdx === -1) throw new NotFoundException('Inventory item not found');
      
      const qty = Number(quantity);
      if (type === 'IN') {
        this.mockDb.inventoryItems[itemIdx].quantity += qty;
      } else {
        this.mockDb.inventoryItems[itemIdx].quantity = Math.max(0, this.mockDb.inventoryItems[itemIdx].quantity - qty);
      }
      
      return { success: true, updatedStock: this.mockDb.inventoryItems[itemIdx].quantity };
    }
  }

  // ==================== EMPLOYEE SHIFTS & SCHEDULES ====================

  async getShifts(branchId?: string) {
    const brId = branchId || 'br-1';
    if (this.prisma.isConnected) {
      return this.prisma.staffShift.findMany({
        where: { branchId: brId },
        include: { user: true },
      });
    } else {
      // Ensure all staff users have a shift entry for today
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

  async clockShift(shiftId: string, type: 'IN' | 'OUT') {
    const now = new Date();
    if (this.prisma.isConnected) {
      const updateData: any = {};
      if (type === 'IN') {
        updateData.checkIn = now;
        updateData.status = 'ACTIVE';
      } else {
        updateData.checkOut = now;
        updateData.status = 'COMPLETED';
      }
      return this.prisma.staffShift.update({
        where: { id: shiftId },
        data: updateData,
      });
    } else {
      const idx = this.mockDb.staffShifts.findIndex(s => s.id === shiftId);
      if (idx === -1) throw new NotFoundException('Shift not found');
      if (type === 'IN') {
        this.mockDb.staffShifts[idx].checkIn = now;
        this.mockDb.staffShifts[idx].status = 'ACTIVE';
      } else {
        this.mockDb.staffShifts[idx].checkOut = now;
        this.mockDb.staffShifts[idx].status = 'COMPLETED';
      }
      return this.mockDb.staffShifts[idx];
    }
  }

  // ==================== AI CUSTOMER ASSISTANT & PREDICTIONS ====================

  async getAiRecommendations(userId?: string) {
    // Recommend popular, trending or healthy choices
    let items = [...this.mockDb.menuItems];
    // Return top popular and trending items
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

  async analyzeReviewSentiment(menuItemId: string, comment: string) {
    const lowercase = comment.toLowerCase();
    let sentiment = 'NEUTRAL';
    if (lowercase.includes('best') || lowercase.includes('great') || lowercase.includes('amazing') || lowercase.includes('delicious') || lowercase.includes('love')) {
      sentiment = 'POSITIVE';
    } else if (lowercase.includes('bad') || lowercase.includes('worst') || lowercase.includes('stale') || lowercase.includes('cold') || lowercase.includes('poor')) {
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

  async triggerAiChat(message: string) {
    const q = message.toLowerCase();
    let response = "Welcome to DineOps's AI Concierge. I can help you recommend a meal, book a table, or track orders. How can I delight you today?";
    
    if (q.includes('recommend') || q.includes('eat') || q.includes('hungry')) {
      response = "I highly recommend our signature Miyazaki Wagyu Sliders paired with the Rosemary Smoked Cappuccino. For health conscious diners, our Keto Salmon Avocado Bowl is trending today!";
    } else if (q.includes('table') || q.includes('book') || q.includes('reserve')) {
      response = "Sure, I can assist with reservations. Head over to our Table Booking section, select table 104 or 105 for premium floor views, and confirm your slot instantly.";
    } else if (q.includes('order') || q.includes('track')) {
      response = "You can view your active orders under the Realtime tracking screen. Currently, your order BH-2026-9042 is being prepared by Chef Marco.";
    }
    
    return { response };
  }

  // ==================== CASHFREE PAYMENTS GATEWAY SIMULATION ====================

  async createPaymentSession(orderId: string, amount: number) {
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

  async verifyPayment(orderId: string, transactionId: string) {
    if (this.prisma.isConnected) {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID', paymentTransactionId: transactionId, status: 'PAYMENT_CONFIRMED' },
      });
    } else {
      const idx = this.mockDb.orders.findIndex(o => o.id === orderId);
      if (idx !== -1) {
        this.mockDb.orders[idx].paymentStatus = 'PAID';
        this.mockDb.orders[idx].paymentTransactionId = transactionId;
        this.mockDb.orders[idx].status = 'PAYMENT_CONFIRMED';
      }
    }
    return { success: true, message: 'Payment verified and status updated to CONFIRMED.' };
  }

  // ==================== NEW TABLE RESERVATIONS SERVICES ====================

  async getReservations() {
    if (this.prisma.isConnected) {
      return this.prisma.tableReservation.findMany({
        include: { user: true, table: true },
      });
    } else {
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

  async updateReservation(id: string, dto: any) {
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
    } else {
      const idx = this.mockDb.reservations.findIndex(r => r.id === id);
      if (idx === -1) throw new NotFoundException('Reservation not found');
      
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

      // Handle table status update
      if (oldTableId !== newTableId) {
        // Free old table
        const oldTableIdx = this.mockDb.tables.findIndex(t => t.id === oldTableId);
        if (oldTableIdx !== -1) {
          this.mockDb.tables[oldTableIdx].status = 'AVAILABLE';
        }
        // Reserve new table
        const newTableIdx = this.mockDb.tables.findIndex(t => t.id === newTableId);
        if (newTableIdx !== -1) {
          this.mockDb.tables[newTableIdx].status = 'RESERVED';
        }
      }
      
      this.mockDb.saveToDisk();
      return this.mockDb.reservations[idx];
    }
  }

  async deleteReservation(id: string) {
    if (this.prisma.isConnected) {
      return this.prisma.tableReservation.delete({
        where: { id },
      });
    } else {
      const idx = this.mockDb.reservations.findIndex(r => r.id === id);
      if (idx === -1) throw new NotFoundException('Reservation not found');
      
      const tableId = this.mockDb.reservations[idx].tableId;
      this.mockDb.reservations.splice(idx, 1);
      
      // Free old table
      const tableIdx = this.mockDb.tables.findIndex(t => t.id === tableId);
      if (tableIdx !== -1) {
        this.mockDb.tables[tableIdx].status = 'AVAILABLE';
      }

      this.mockDb.saveToDisk();
      return { success: true };
    }
  }

  // ==================== NEW CUSTOMER REVIEWS SERVICES ====================

  async addReview(dto: any) {
    const { orderId, orderNumber, rating, comment, customerName, customerEmail } = dto;
    const lowercase = (comment || '').toLowerCase();
    let sentiment = 'NEUTRAL';
    if (lowercase.includes('best') || lowercase.includes('great') || lowercase.includes('amazing') || lowercase.includes('delicious') || lowercase.includes('love') || lowercase.includes('good') || lowercase.includes('nice')) {
      sentiment = 'POSITIVE';
    } else if (lowercase.includes('bad') || lowercase.includes('worst') || lowercase.includes('stale') || lowercase.includes('cold') || lowercase.includes('poor')) {
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

  // ==================== NEW GIFT VOUCHER PURCHASING ====================

  async purchaseGiftVoucher(dto: any) {
    const { amount, recipientEmail, senderId } = dto;
    
    // Find sender
    const senderIdx = this.mockDb.users.findIndex(u => u.id === senderId);
    const senderName = senderIdx !== -1 ? this.mockDb.users[senderIdx].name : 'A friend';
    
    // Find recipient by email (case-insensitive)
    const recipientIdx = this.mockDb.users.findIndex(
      u => u.email.toLowerCase() === recipientEmail.toLowerCase()
    );
    if (recipientIdx === -1) {
      throw new NotFoundException(`No registered account found with email ${recipientEmail}.`);
    }
    
    const recipient = this.mockDb.users[recipientIdx];
    
    // Credit wallet DIRECTLY on the user record — reliable, no profile lookup confusion
    this.mockDb.users[recipientIdx].cashbackBalance =
      (this.mockDb.users[recipientIdx].cashbackBalance || 0) + Number(amount);

    // Also ensure loyaltyPoints/tier set on user record if missing
    if (!this.mockDb.users[recipientIdx].loyaltyPoints) {
      this.mockDb.users[recipientIdx].loyaltyPoints = 100;
      this.mockDb.users[recipientIdx].loyaltyTier = 'BRONZE';
    }

    // Store a gift card record for audit trail
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
    
    // Trigger notification to recipient
    this.mockDb.triggerNotification(
      recipient.id,
      '🎁 Gift Wallet Credit Received!',
      `${senderName} sent you a ₹${amount} gift voucher! ₹${amount} has been credited to your DineOps Wallet.`
    );
    
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

  async createCoupon(dto: any) {
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

  async toggleCoupon(id: string) {
    const idx = this.mockDb.coupons.findIndex(c => c.id === id);
    if (idx === -1) {
      throw new NotFoundException(`Coupon with ID ${id} not found.`);
    }
    this.mockDb.coupons[idx].active = !this.mockDb.coupons[idx].active;
    this.mockDb.saveToDisk();
    return this.mockDb.coupons[idx];
  }

  async deleteCoupon(id: string) {
    const idx = this.mockDb.coupons.findIndex(c => c.id === id);
    if (idx === -1) {
      throw new NotFoundException(`Coupon with ID ${id} not found.`);
    }
    const deleted = this.mockDb.coupons.splice(idx, 1);
    this.mockDb.saveToDisk();
    return { success: true, deleted: deleted[0] };
  }
}


