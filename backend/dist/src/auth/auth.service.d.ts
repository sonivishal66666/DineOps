import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MockDbService } from '../prisma/mock-db.service';
export declare class AuthService {
    private prisma;
    private mockDb;
    private jwtService;
    constructor(prisma: PrismaService, mockDb: MockDbService, jwtService: JwtService);
    signup(dto: any): Promise<{
        token: string;
        user: {
            id: string;
            email: any;
            name: any;
            role: any;
        };
    }>;
    login(dto: any): Promise<{
        token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
        };
    }>;
    getProfile(userId: string): Promise<({
        profile: {
            id: string;
            updatedAt: Date;
            addresses: import("@prisma/client/runtime/library").JsonValue | null;
            allergies: string[];
            loyaltyPoints: number;
            loyaltyTier: import("@prisma/client").$Enums.LoyaltyTier;
            cashbackBalance: import("@prisma/client/runtime/library").Decimal;
            birthDate: Date | null;
            anniversaryDate: Date | null;
            userId: string;
        } | null;
    } & {
        id: string;
        email: string;
        password: string;
        name: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }) | {
        id: any;
        email: any;
        name: any;
        role: any;
        profile: {
            userId: any;
            addresses: any;
            allergies: any;
            loyaltyPoints: any;
            loyaltyTier: any;
            cashbackBalance: any;
            birthDate: any;
            anniversaryDate: any;
        };
        reservations: any[];
        subscriptions: any[];
    } | null>;
    updateProfile(userId: string, data: any): Promise<{
        id: string;
        updatedAt: Date;
        addresses: import("@prisma/client/runtime/library").JsonValue | null;
        allergies: string[];
        loyaltyPoints: number;
        loyaltyTier: import("@prisma/client").$Enums.LoyaltyTier;
        cashbackBalance: import("@prisma/client/runtime/library").Decimal;
        birthDate: Date | null;
        anniversaryDate: Date | null;
        userId: string;
    } | {
        success: boolean;
        data: any;
    }>;
    getAllUsers(): Promise<{
        id: any;
        email: any;
        name: any;
        role: any;
        createdAt: any;
    }[]>;
    updateUserRole(userId: string, role: string): Promise<{
        id: any;
        email: any;
        name: any;
        role: any;
    }>;
    getNotifications(userId: string): Promise<any>;
}
