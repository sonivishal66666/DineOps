import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockDbService } from '../prisma/mock-db.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private mockDb: MockDbService,
  ) {}

  async placeOrder(dto: any, userId?: string) {
    const { items, type, branchId, couponCode, deliveryAddress, cookingNotes, deliveryNotes, paymentMethod, tableId } = dto;
    
    if (!items || items.length === 0) {
      throw new BadRequestException('Order items are required');
    }

    // Calc subtotal
    let subtotal = 0;
    const resolvedItems: any[] = [];

    for (const it of items) {
      let menuItem: any = null;
      if (this.prisma.isConnected) {
        menuItem = await this.prisma.menuItem.findUnique({ where: { id: it.menuItemId } });
      } else {
        menuItem = this.mockDb.menuItems.find(item => item.id === it.menuItemId);
      }

      if (!menuItem) {
        throw new NotFoundException(`Menu item ${it.menuItemId} not found`);
      }

      const itemPrice = Number(menuItem.price);
      let addOnsPrice = 0;
      
      // Calculate customizations price if any
      if (it.customizations && it.customizations.length > 0) {
        it.customizations.forEach((custom: any) => {
          if (custom.price) addOnsPrice += Number(custom.price);
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

    // Handle coupon
    let discount = 0;
    if (couponCode) {
      let coupon: any = null;
      if (this.prisma.isConnected) {
        coupon = await this.prisma.coupon.findUnique({ where: { code: couponCode, active: true } });
      } else {
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
          } else {
            discount = Number(coupon.value);
          }
        }
      }
    }

    const tax = Number((subtotal * 0.05).toFixed(2)); // 5% GST
    const deliveryFee = type === 'DELIVERY' ? 40 : 0;
    const total = Number((subtotal + tax + deliveryFee - discount).toFixed(2));
    
    // Generate Order Number & OTP
    const rand = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `BH-2026-${rand}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Auto-deduct inventory mock recipe system
    try {
      await this.deductInventoryForItems(resolvedItems, branchId || 'br-1');
    } catch (err) {
      // In enterprise systems we log warning but let the order go through if it's mock
      console.warn('Inventory auto-deduction failed or skipped:', err.message);
    }

    // Validate wallet balance if paying via WALLET
    let finalPaymentStatus = paymentMethod === 'CASH' ? 'PENDING' : 'PAID';
    let finalTxnId = paymentMethod !== 'CASH' ? `TXN-SIM-${Date.now()}` : null;

    if (paymentMethod === 'WALLET' && (userId || dto.customerId)) {
      const activeUserId = userId || dto.customerId;
      // Wallet stored directly on user record
      const userIdx = this.mockDb.users.findIndex(u => u.id === activeUserId);
      if (userIdx === -1) {
        throw new BadRequestException('User account not found');
      }
      const balance = this.mockDb.users[userIdx].cashbackBalance || 0;
      if (balance < total) {
        throw new BadRequestException(`Insufficient wallet balance. Available: ₹${balance.toFixed(2)}, Required: ₹${total.toFixed(2)}`);
      }
      this.mockDb.users[userIdx].cashbackBalance = Number((balance - total).toFixed(2));
      finalPaymentStatus = 'PAID';
      finalTxnId = `TXN-WLT-${Date.now()}`;
    }


    const orderData: any = {
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
    } else {
      const mockCreated: any = {
        id: `ord-${Date.now()}`,
        ...orderData,
        createdAt: new Date(),
        items: resolvedItems,
      };
      
      this.mockDb.orders.push(mockCreated);
      this.mockDb.saveToDisk();

      // Award loyalty points
      if (userId) {
        const profIdx = this.mockDb.reservations.findIndex(r => r.userId === userId);
        if (profIdx !== -1) {
          const pointsEarned = Math.floor(total / 10);
          this.mockDb.reservations[profIdx].loyaltyPoints = (this.mockDb.reservations[profIdx].loyaltyPoints || 0) + pointsEarned;
          // Upgrade tiers
          const points = this.mockDb.reservations[profIdx].loyaltyPoints;
          if (points >= 1000) this.mockDb.reservations[profIdx].loyaltyTier = 'PLATINUM';
          else if (points >= 500) this.mockDb.reservations[profIdx].loyaltyTier = 'GOLD';
          else if (points >= 250) this.mockDb.reservations[profIdx].loyaltyTier = 'SILVER';
        }
      }

      // Add audit log
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

  async deductInventoryForItems(items: any[], branchId: string) {
    // Standard mock mapping: cold brew uses coffee beans, burgers use wagyu beef, sourdough toasts use sourdough flour and avocados
    for (const item of items) {
      let ingredientSku = 'INV-COF-003'; // default coffee beans
      let deductionQuantity = 0.05 * item.quantity; // 50g per cup

      if (item.name.toLowerCase().includes('slider') || item.name.toLowerCase().includes('burger')) {
        ingredientSku = 'INV-BEEF-002';
        deductionQuantity = 0.15 * item.quantity; // 150g beef
      } else if (item.name.toLowerCase().includes('toast') || item.name.toLowerCase().includes('sourdough')) {
        ingredientSku = 'INV-FLR-001';
        deductionQuantity = 0.2 * item.quantity; // 200g flour
      } else if (item.name.toLowerCase().includes('avocado')) {
        ingredientSku = 'INV-AVO-007';
        deductionQuantity = 1 * item.quantity; // 1 avocado unit
      } else if (item.name.toLowerCase().includes('salmon') || item.name.toLowerCase().includes('fish')) {
        ingredientSku = 'INV-FISH-005';
        deductionQuantity = 0.18 * item.quantity; // 180g salmon
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
      } else {
        const invItem = this.mockDb.inventoryItems.find(
          i => i.sku === ingredientSku && i.branchId === branchId,
        );
        if (invItem) {
          invItem.quantity = Math.max(0, invItem.quantity - deductionQuantity);
          this.mockDb.inventoryItems.push({
            id: `inv-move-${Date.now()}`,
            branchId,
            name: invItem.name,
            sku: invItem.sku,
            quantity: deductionQuantity, // movement quantity track
            unit: invItem.unit,
            minStockLevel: invItem.minStockLevel,
            supplierName: 'OUT', // movement indicator
            supplierEmail: 'ORDER_AUTO_DEDUCTION',
          } as any);
        }
      }
    }
  }

  async getOrders(userId?: string, role?: string) {
    if (this.prisma.isConnected) {
      const where: any = {};
      if (role === 'CUSTOMER' && userId) {
        where.customerId = userId;
      } else if (role === 'CHEF' || role === 'KITCHEN_STAFF') {
        where.status = { in: ['ORDER_PLACED', 'PAYMENT_CONFIRMED', 'ACCEPTED', 'PREPARING', 'COOKING', 'PACKED', 'READY'] };
      } else if (role === 'DELIVERY_STAFF') {
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
    } else {
      let list = [...this.mockDb.orders];
      if (role === 'CUSTOMER' && userId) {
        list = list.filter(o => o.customerId === userId);
      } else if (role === 'CHEF' || role === 'KITCHEN_STAFF') {
        list = list.filter(o => ['ORDER_PLACED', 'PAYMENT_CONFIRMED', 'ACCEPTED', 'PREPARING', 'COOKING', 'PACKED', 'READY'].includes(o.status));
      } else if (role === 'DELIVERY_STAFF') {
        list = list.filter(o => o.status === 'READY' || (o.status === 'OUT_FOR_DELIVERY' && o.deliveryStaffId === userId));
      }
      return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  async updateStatus(orderId: string, status: string, deliveryStaffId?: string) {
    if (this.prisma.isConnected) {
      const data: any = { status };
      if (deliveryStaffId && status === 'OUT_FOR_DELIVERY') {
        data.deliveryStaffId = deliveryStaffId;
      }
      const updated = await this.prisma.order.update({
        where: { id: orderId },
        data,
      });

      // Handle custom triggers like table release on checkout
      if (status === 'DELIVERED' && updated.tableId) {
        await this.prisma.table.update({
          where: { id: updated.tableId },
          data: { status: 'AVAILABLE', waiterNeeded: false, billRequested: false },
        });
      }
      return updated;
    } else {
      const idx = this.mockDb.orders.findIndex(o => o.id === orderId);
      if (idx === -1) throw new NotFoundException('Order not found');
      
      this.mockDb.orders[idx].status = status;
      if (deliveryStaffId && status === 'OUT_FOR_DELIVERY') {
        this.mockDb.orders[idx].deliveryStaffId = deliveryStaffId;
      }

      // Handle table release on dine-in finish
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

  async verifyOtp(orderId: string, otp: string) {
    if (this.prisma.isConnected) {
      const order = await this.prisma.order.findUnique({ where: { id: orderId } });
      if (!order) throw new NotFoundException('Order not found');
      if (order.otp !== otp) throw new BadRequestException('Invalid verification OTP');

      return this.prisma.order.update({
        where: { id: orderId },
        data: { otpVerified: true, status: 'DELIVERED' },
      });
    } else {
      const idx = this.mockDb.orders.findIndex(o => o.id === orderId);
      if (idx === -1) throw new NotFoundException('Order not found');
      
      const order = this.mockDb.orders[idx];
      if (order.otp !== otp) throw new BadRequestException('Invalid verification OTP');

      this.mockDb.orders[idx].otpVerified = true;
      this.mockDb.orders[idx].status = 'DELIVERED';
      this.mockDb.saveToDisk();
      
      return this.mockDb.orders[idx];
    }
  }

  async splitBill(orderId: string, guestsCount: number) {
    let order: any = null;
    if (this.prisma.isConnected) {
      order = await this.prisma.order.findUnique({ where: { id: orderId } });
    } else {
      order = this.mockDb.orders.find(o => o.id === orderId);
    }

    if (!order) throw new NotFoundException('Order not found');

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
        status: i === 0 ? 'PAID' : 'PENDING', // Simulating first guest pays, others pending
      })),
    };
  }
}
