import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(req: any): Promise<({
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
    updateProfile(req: any, data: any): Promise<{
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
    updateUserRole(id: string, role: string): Promise<{
        id: any;
        email: any;
        name: any;
        role: any;
    }>;
    getNotifications(req: any): Promise<any>;
}
