import { MenuService } from './menu.service';
export declare class MenuController {
    private readonly menuService;
    constructor(menuService: MenuService);
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
    getItems(category?: string, search?: string, isVeg?: string, isVegan?: string, isGlutenFree?: string, isKeto?: string, isPopular?: string, isTrending?: string): Promise<import("../prisma/mock-db.service").MockMenuItem[] | ({
        customizations: ({
            options: {
                id: string;
                name: string;
                price: import("@prisma/client/runtime/library").Decimal;
                groupId: string;
                isDefault: boolean;
            }[];
        } & {
            id: string;
            name: string;
            menuItemId: string;
            minSelect: number;
            maxSelect: number;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
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
        active: boolean;
    })[]>;
    createItem(dto: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
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
        active: boolean;
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
    updateItem(id: string, dto: any): Promise<import("../prisma/mock-db.service").MockMenuItem | {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
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
        active: boolean;
    } | null>;
}
