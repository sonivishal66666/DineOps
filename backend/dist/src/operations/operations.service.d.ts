import { PrismaService } from '../prisma/prisma.service';
import { MockDbService } from '../prisma/mock-db.service';
export declare class OperationsService {
    private prisma;
    private mockDb;
    constructor(prisma: PrismaService, mockDb: MockDbService);
    getTables(branchId?: string): Promise<{
        id: string;
        branchId: string;
        tableNumber: string;
        capacity: number;
        status: import("@prisma/client").$Enums.TableStatus;
        waiterNeeded: boolean;
        billRequested: boolean;
        qrCode: string | null;
    }[] | import("../prisma/mock-db.service").MockTable[]>;
    reserveTable(dto: any, userId: string): Promise<{
        id: string;
        tableId: any;
        userId: string;
        guestCount: any;
        reservationDate: Date;
        timeSlot: any;
        status: string;
        notes: any;
    }>;
    updateTableQR(tableId: string, actions: {
        status?: any;
        waiterNeeded?: boolean;
        billRequested?: boolean;
    }): Promise<{
        id: string;
        branchId: string;
        tableNumber: string;
        capacity: number;
        status: import("@prisma/client").$Enums.TableStatus;
        waiterNeeded: boolean;
        billRequested: boolean;
        qrCode: string | null;
    } | import("../prisma/mock-db.service").MockTable>;
    getInventory(branchId?: string): Promise<({
        movements: {
            id: string;
            createdAt: Date;
            quantity: import("@prisma/client/runtime/library").Decimal;
            inventoryItemId: string;
            type: import("@prisma/client").$Enums.MovementType;
            reason: string | null;
        }[];
    } & {
        id: string;
        branchId: string;
        name: string;
        createdAt: Date;
        sku: string;
        quantity: import("@prisma/client/runtime/library").Decimal;
        unit: string;
        minStockLevel: import("@prisma/client/runtime/library").Decimal;
        supplierName: string | null;
        supplierEmail: string | null;
        expiryDate: Date | null;
        updatedAt: Date;
    })[] | import("../prisma/mock-db.service").MockInventory[]>;
    addInventoryMovement(dto: any): Promise<{
        id: string;
        createdAt: Date;
        quantity: import("@prisma/client/runtime/library").Decimal;
        inventoryItemId: string;
        type: import("@prisma/client").$Enums.MovementType;
        reason: string | null;
    } | {
        success: boolean;
        updatedStock: number;
    }>;
    getShifts(branchId?: string): Promise<({
        user: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            phone: string | null;
            role: import("@prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        branchId: string;
        status: import("@prisma/client").$Enums.ShiftStatus;
        createdAt: Date;
        userId: string;
        startTime: Date;
        endTime: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        hourlyRate: import("@prisma/client/runtime/library").Decimal;
    })[] | {
        user: any;
        id: string;
        userId: string;
        branchId: string;
        startTime: Date;
        endTime: Date;
        checkIn?: Date;
        checkOut?: Date;
        status: "SCHEDULED" | "ACTIVE" | "COMPLETED" | "ABSENT";
        hourlyRate: number;
    }[]>;
    clockShift(shiftId: string, type: 'IN' | 'OUT'): Promise<import("../prisma/mock-db.service").MockShift | {
        id: string;
        branchId: string;
        status: import("@prisma/client").$Enums.ShiftStatus;
        createdAt: Date;
        userId: string;
        startTime: Date;
        endTime: Date;
        checkIn: Date | null;
        checkOut: Date | null;
        hourlyRate: import("@prisma/client/runtime/library").Decimal;
    }>;
    getAiRecommendations(userId?: string): Promise<{
        recommendations: import("../prisma/mock-db.service").MockMenuItem[];
        smartUpselling: {
            item: import("../prisma/mock-db.service").MockMenuItem | undefined;
            pairing: string;
            discount: string;
        }[];
    }>;
    getAiForecasts(): Promise<{
        peakHours: {
            day: string;
            peakTime: string;
            confidence: string;
            reason: string;
        }[];
        demandForecasting: {
            ingredient: string;
            forecastedWeeklyNeed: string;
            currentStock: string;
            actionRequired: string;
        }[];
        revenueForecast: ({
            month: string;
            actual: number;
            projected: number;
            growth: string;
        } | {
            month: string;
            projected: number;
            growth: string;
            actual?: undefined;
        })[];
        marketingSuggestions: {
            title: string;
            trigger: string;
            promoCode: string;
            channel: string;
        }[];
    }>;
    analyzeReviewSentiment(menuItemId: string, comment: string): Promise<{
        id: string;
        menuItemId: string;
        rating: number;
        comment: string;
        sentiment: string;
        createdAt: Date;
    }>;
    triggerAiChat(message: string): Promise<{
        response: string;
    }>;
    createPaymentSession(orderId: string, amount: number): Promise<{
        success: boolean;
        paymentSessionId: string;
        cfOrderId: string;
        orderId: string;
        amount: number;
        currency: string;
        paymentLink: string;
    }>;
    verifyPayment(orderId: string, transactionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getReservations(): Promise<any[]>;
    updateReservation(id: string, dto: any): Promise<any>;
    deleteReservation(id: string): Promise<{
        id: string;
        status: string;
        guestCount: number;
        reservationDate: Date;
        timeSlot: string;
        notes: string | null;
        createdAt: Date;
        tableId: string | null;
        userId: string;
    } | {
        success: boolean;
    }>;
    addReview(dto: any): Promise<{
        id: string;
        orderId: any;
        orderNumber: any;
        rating: number;
        comment: any;
        sentiment: string;
        customerName: any;
        customerEmail: any;
        createdAt: Date;
    }>;
    getReviews(): Promise<any[]>;
    purchaseGiftVoucher(dto: any): Promise<{
        success: boolean;
        message: string;
        recipientName: any;
    }>;
    getCoupons(): Promise<any[]>;
    createCoupon(dto: any): Promise<{
        id: string;
        code: any;
        discountType: any;
        value: number;
        minOrderValue: number;
        maxDiscount: number | null;
        expiresAt: Date;
        active: boolean;
    }>;
    toggleCoupon(id: string): Promise<any>;
    deleteCoupon(id: string): Promise<{
        success: boolean;
        deleted: any;
    }>;
}
