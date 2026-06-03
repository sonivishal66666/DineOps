import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MockDbService } from '../prisma/mock-db.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mockDb: MockDbService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: any) {
    const hashedPassword = await bcrypt.hash(dto.password || 'password123', 10);
    const email = dto.email.toLowerCase();

    if (this.prisma.isConnected) {
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing) throw new ConflictException('Email already registered');

      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: dto.name,
          role: dto.role || 'CUSTOMER',
          profile: {
            create: {
              loyaltyPoints: 100, // Welcome points
              loyaltyTier: 'BRONZE',
            },
          },
        },
      });

      const token = this.jwtService.sign({ id: user.id, email: user.email, role: user.role });
      return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
    } else {
      const existing = this.mockDb.users.find(u => u.email === email);
      if (existing) throw new ConflictException('Email already registered');

      const newUser = {
        id: `user-${Date.now()}`,
        email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role || 'CUSTOMER',
        createdAt: new Date(),
        // Wallet & loyalty stored directly on user record for reliable access
        cashbackBalance: 0,
        loyaltyPoints: 100,
        loyaltyTier: 'BRONZE',
        addresses: [
          { id: 'addr-1', label: 'Home', address: '', city: '', isDefault: true },
          { id: 'addr-2', label: 'Office', address: '', city: '', isDefault: false }
        ],
        allergies: [],
        birthDate: null,
        anniversaryDate: null,
      };
      this.mockDb.users.push(newUser);
      this.mockDb.saveToDisk();

      const token = this.jwtService.sign({ id: newUser.id, email: newUser.email, role: newUser.role });
      return { token, user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } };
    }
  }

  async login(dto: any) {
    const email = dto.email.toLowerCase();
    let user: any = null;

    if (this.prisma.isConnected) {
      user = await this.prisma.user.findUnique({ where: { email } });
    } else {
      user = this.mockDb.users.find(u => u.email === email);
    }

    if (!user) throw new UnauthorizedException('Invalid email or password');

    // For seeded mock users, password is plain 'password123' if not hashed
    let isMatch = false;
    if (user.password.startsWith('$2')) {
      isMatch = await bcrypt.compare(dto.password, user.password);
    } else {
      isMatch = user.password === dto.password;
    }

    if (!isMatch) throw new UnauthorizedException('Invalid email or password');

    const token = this.jwtService.sign({ id: user.id, email: user.email, role: user.role });
    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }

  async getProfile(userId: string) {
    if (this.prisma.isConnected) {
      return this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });
    } else {
      const user = this.mockDb.users.find(u => u.id === userId);
      if (!user) throw new UnauthorizedException('User not found');

      // Wallet/loyalty/addresses now stored directly on user record
      const userReservations = this.mockDb.reservations
        .filter(r => r.userId === userId && r.tableId)
        .map(r => {
          const tbl = this.mockDb.tables.find(t => t.id === r.tableId);
          return {
            ...r,
            tableNumber: tbl ? tbl.tableNumber : 'N/A'
          };
        });
      const userSubscriptions = this.mockDb.subscriptions.filter(s => s.userId === userId);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: {
          userId: user.id,
          addresses: user.addresses || [
            { id: 'addr-1', label: 'Home', address: '45/B West End Road, Bandra', city: 'Mumbai', isDefault: true },
            { id: 'addr-2', label: 'Office', address: '12th Floor, Trade Center, BKC', city: 'Mumbai', isDefault: false }
          ],
          allergies: user.allergies || [],
          loyaltyPoints: user.loyaltyPoints ?? 100,
          loyaltyTier: user.loyaltyTier || 'BRONZE',
          cashbackBalance: user.cashbackBalance ?? 0,
          birthDate: user.birthDate || null,
          anniversaryDate: user.anniversaryDate || null,
        },
        reservations: userReservations,
        subscriptions: userSubscriptions
      };
    }
  }

  async updateProfile(userId: string, data: any) {
    const cleanData: any = {};
    if (data.birthDate !== undefined) cleanData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
    if (data.anniversaryDate !== undefined) cleanData.anniversaryDate = data.anniversaryDate ? new Date(data.anniversaryDate) : null;
    if (data.allergies !== undefined) cleanData.allergies = Array.isArray(data.allergies) ? data.allergies : [];
    if (data.addresses !== undefined) cleanData.addresses = data.addresses;

    if (this.prisma.isConnected) {
      return this.prisma.profile.update({
        where: { userId },
        data: cleanData,
      });
    } else {
      // Update fields directly on the user record
      const idx = this.mockDb.users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        this.mockDb.users[idx] = { ...this.mockDb.users[idx], ...cleanData };
        this.mockDb.saveToDisk();
      }
      return { success: true, data };
    }
  }

  async getAllUsers() {
    if (this.prisma.isConnected) {
      return this.prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true, createdAt: true }
      });
    } else {
      return this.mockDb.users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        createdAt: u.createdAt || new Date()
      }));
    }
  }

  async updateUserRole(userId: string, role: string) {
    if (this.prisma.isConnected) {
      return this.prisma.user.update({
        where: { id: userId },
        data: { role: role as any },
        select: { id: true, email: true, name: true, role: true }
      });
    } else {
      const idx = this.mockDb.users.findIndex(u => u.id === userId);
      if (idx === -1) throw new UnauthorizedException('User not found');
      this.mockDb.users[idx].role = role;
      this.mockDb.saveToDisk();
      return {
        id: this.mockDb.users[idx].id,
        email: this.mockDb.users[idx].email,
        name: this.mockDb.users[idx].name,
        role: this.mockDb.users[idx].role
      };
    }
  }

  async getNotifications(userId: string) {
    const userIdx = this.mockDb.users.findIndex(u => u.id === userId);
    if (userIdx === -1) return [];
    
    // Retrieve pending notifications
    const notifs = this.mockDb.users[userIdx].notifications || [];
    // Clear pending notifications
    this.mockDb.users[userIdx].notifications = [];
    this.mockDb.saveToDisk();
    
    return notifs;
  }
}
