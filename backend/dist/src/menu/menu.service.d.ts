import { PrismaService } from '../prisma/prisma.service';
import { MockDbService } from '../prisma/mock-db.service';
export declare class MenuService {
    private prisma;
    private mockDb;
    constructor(prisma: PrismaService, mockDb: MockDbService);
    getCategories(): Promise<{
        id: string;
        name: string;
        description: string | null;
        image: string | null;
        sortOrder: number;
    }[]>;
    createCategory(dto: any): Promise<{
        id: string;
        name: any;
        description: any;
        image: any;
        sortOrder: any;
    }>;
    getItems(filters: {
        category?: string;
        search?: string;
        isVeg?: string;
        isVegan?: string;
        isGlutenFree?: string;
        isKeto?: string;
        isPopular?: string;
        isTrending?: string;
    }): Promise<import("../prisma/mock-db.service").MockMenuItem[] | ({
        customizations: ({
            options: {
                id: string;
                name: string;
                price: import("@prisma/client/runtime/library").Decimal;
                isDefault: boolean;
                groupId: string;
            }[];
        } & {
            id: string;
            name: string;
            minSelect: number;
            maxSelect: number;
            menuItemId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        description: string | null;
        image: string | null;
        categoryId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        isVeg: boolean;
        isVegan: boolean;
        isGlutenFree: boolean;
        isKeto: boolean;
        calories: number | null;
        protein: number | null;
        carbohydrates: number | null;
        fat: number | null;
        allergens: string[];
        isPopular: boolean;
        isTrending: boolean;
    })[]>;
    createItem(dto: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        description: string | null;
        image: string | null;
        categoryId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        isVeg: boolean;
        isVegan: boolean;
        isGlutenFree: boolean;
        isKeto: boolean;
        calories: number | null;
        protein: number | null;
        carbohydrates: number | null;
        fat: number | null;
        allergens: string[];
        isPopular: boolean;
        isTrending: boolean;
    } | {
        id: string;
        categoryId: any;
        name: any;
        description: any;
        price: number;
        image: any;
        isVeg: any;
        isVegan: any;
        isGlutenFree: any;
        isKeto: any;
        calories: any;
        protein: any;
        carbohydrates: any;
        fat: any;
        allergens: any;
        isPopular: any;
        isTrending: any;
        active: boolean;
        customizations: never[];
    }>;
    updateItem(id: string, dto: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        description: string | null;
        image: string | null;
        categoryId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        isVeg: boolean;
        isVegan: boolean;
        isGlutenFree: boolean;
        isKeto: boolean;
        calories: number | null;
        protein: number | null;
        carbohydrates: number | null;
        fat: number | null;
        allergens: string[];
        isPopular: boolean;
        isTrending: boolean;
    } | import("../prisma/mock-db.service").MockMenuItem | null>;
}
