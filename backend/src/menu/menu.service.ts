import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockDbService } from '../prisma/mock-db.service';

@Injectable()
export class MenuService {
  constructor(
    private prisma: PrismaService,
    private mockDb: MockDbService,
  ) {}

  async getCategories() {
    if (this.prisma.isConnected) {
      return this.prisma.menuCategory.findMany({
        orderBy: { sortOrder: 'asc' },
      });
    } else {
      return this.mockDb.categories.sort((a, b) => a.sortOrder - b.sortOrder);
    }
  }

  async createCategory(dto: any) {
    if (this.prisma.isConnected) {
      return this.prisma.menuCategory.create({ data: dto });
    } else {
      const newCat = {
        id: `cat-${Date.now()}`,
        name: dto.name,
        description: dto.description || '',
        image: dto.image || '',
        sortOrder: dto.sortOrder || 0,
      };
      this.mockDb.categories.push(newCat);
      return newCat;
    }
  }

  async getItems(filters: {
    category?: string;
    search?: string;
    isVeg?: string;
    isVegan?: string;
    isGlutenFree?: string;
    isKeto?: string;
    isPopular?: string;
    isTrending?: string;
  }) {
    if (this.prisma.isConnected) {
      const where: any = { active: true };
      if (filters.category) where.categoryId = filters.category;
      if (filters.isVeg) where.isVeg = filters.isVeg === 'true';
      if (filters.isVegan) where.isVegan = filters.isVegan === 'true';
      if (filters.isGlutenFree) where.isGlutenFree = filters.isGlutenFree === 'true';
      if (filters.isKeto) where.isKeto = filters.isKeto === 'true';
      if (filters.isPopular) where.isPopular = filters.isPopular === 'true';
      if (filters.isTrending) where.isTrending = filters.isTrending === 'true';
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }
      return this.prisma.menuItem.findMany({
        where,
        include: { customizations: { include: { options: true } } },
      });
    } else {
      let list = [...this.mockDb.menuItems];
      if (filters.category) {
        list = list.filter(item => item.categoryId === filters.category);
      }
      if (filters.isVeg) {
        list = list.filter(item => item.isVeg === (filters.isVeg === 'true'));
      }
      if (filters.isVegan) {
        list = list.filter(item => item.isVegan === (filters.isVegan === 'true'));
      }
      if (filters.isGlutenFree) {
        list = list.filter(item => item.isGlutenFree === (filters.isGlutenFree === 'true'));
      }
      if (filters.isKeto) {
        list = list.filter(item => item.isKeto === (filters.isKeto === 'true'));
      }
      if (filters.isPopular) {
        list = list.filter(item => item.isPopular === (filters.isPopular === 'true'));
      }
      if (filters.isTrending) {
        list = list.filter(item => item.isTrending === (filters.isTrending === 'true'));
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          item => item.name.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q),
        );
      }
      return list;
    }
  }

  async createItem(dto: any) {
    if (this.prisma.isConnected) {
      return this.prisma.menuItem.create({
        data: dto,
      });
    } else {
      const newItem = {
        id: `item-${Date.now()}`,
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description || '',
        price: Number(dto.price),
        image: dto.image || '',
        isVeg: dto.isVeg ?? true,
        isVegan: dto.isVegan ?? false,
        isGlutenFree: dto.isGlutenFree ?? false,
        isKeto: dto.isKeto ?? false,
        calories: dto.calories || 300,
        protein: dto.protein || 10,
        carbohydrates: dto.carbohydrates || 35,
        fat: dto.fat || 12,
        allergens: dto.allergens || [],
        isPopular: dto.isPopular ?? false,
        isTrending: dto.isTrending ?? false,
        active: true,
        customizations: [],
      };
      this.mockDb.menuItems.push(newItem);
      return newItem;
    }
  }

  async updateItem(id: string, dto: any) {
    if (this.prisma.isConnected) {
      return this.prisma.menuItem.update({
        where: { id },
        data: dto,
      });
    } else {
      const idx = this.mockDb.menuItems.findIndex(i => i.id === id);
      if (idx !== -1) {
        this.mockDb.menuItems[idx] = {
          ...this.mockDb.menuItems[idx],
          ...dto,
          price: dto.price ? Number(dto.price) : this.mockDb.menuItems[idx].price,
        };
        return this.mockDb.menuItems[idx];
      }
      return null;
    }
  }
}
