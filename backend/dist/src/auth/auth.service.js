"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const mock_db_service_1 = require("../prisma/mock-db.service");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    prisma;
    mockDb;
    jwtService;
    constructor(prisma, mockDb, jwtService) {
        this.prisma = prisma;
        this.mockDb = mockDb;
        this.jwtService = jwtService;
    }
    async signup(dto) {
        const hashedPassword = await bcrypt.hash(dto.password || 'password123', 10);
        const email = dto.email.toLowerCase();
        if (this.prisma.isConnected) {
            const existing = await this.prisma.user.findUnique({ where: { email } });
            if (existing)
                throw new common_1.ConflictException('Email already registered');
            const user = await this.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: dto.name,
                    role: dto.role || 'CUSTOMER',
                    profile: {
                        create: {
                            loyaltyPoints: 100,
                            loyaltyTier: 'BRONZE',
                        },
                    },
                },
            });
            const token = this.jwtService.sign({ id: user.id, email: user.email, role: user.role });
            return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
        }
        else {
            const existing = this.mockDb.users.find(u => u.email === email);
            if (existing)
                throw new common_1.ConflictException('Email already registered');
            const newUser = {
                id: `user-${Date.now()}`,
                email,
                password: hashedPassword,
                name: dto.name,
                role: dto.role || 'CUSTOMER',
                createdAt: new Date(),
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
    async login(dto) {
        const email = dto.email.toLowerCase();
        let user = null;
        if (this.prisma.isConnected) {
            user = await this.prisma.user.findUnique({ where: { email } });
        }
        else {
            user = this.mockDb.users.find(u => u.email === email);
        }
        if (!user)
            throw new common_1.UnauthorizedException('Invalid email or password');
        let isMatch = false;
        if (user.password.startsWith('$2')) {
            isMatch = await bcrypt.compare(dto.password, user.password);
        }
        else {
            isMatch = user.password === dto.password;
        }
        if (!isMatch)
            throw new common_1.UnauthorizedException('Invalid email or password');
        const token = this.jwtService.sign({ id: user.id, email: user.email, role: user.role });
        return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
    }
    async getProfile(userId) {
        if (this.prisma.isConnected) {
            return this.prisma.user.findUnique({
                where: { id: userId },
                include: { profile: true },
            });
        }
        else {
            const user = this.mockDb.users.find(u => u.id === userId);
            if (!user)
                throw new common_1.UnauthorizedException('User not found');
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
    async updateProfile(userId, data) {
        const cleanData = {};
        if (data.birthDate !== undefined)
            cleanData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
        if (data.anniversaryDate !== undefined)
            cleanData.anniversaryDate = data.anniversaryDate ? new Date(data.anniversaryDate) : null;
        if (data.allergies !== undefined)
            cleanData.allergies = Array.isArray(data.allergies) ? data.allergies : [];
        if (data.addresses !== undefined)
            cleanData.addresses = data.addresses;
        if (this.prisma.isConnected) {
            return this.prisma.profile.update({
                where: { userId },
                data: cleanData,
            });
        }
        else {
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
        }
        else {
            return this.mockDb.users.map(u => ({
                id: u.id,
                email: u.email,
                name: u.name,
                role: u.role,
                createdAt: u.createdAt || new Date()
            }));
        }
    }
    async updateUserRole(userId, role) {
        if (this.prisma.isConnected) {
            return this.prisma.user.update({
                where: { id: userId },
                data: { role: role },
                select: { id: true, email: true, name: true, role: true }
            });
        }
        else {
            const idx = this.mockDb.users.findIndex(u => u.id === userId);
            if (idx === -1)
                throw new common_1.UnauthorizedException('User not found');
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
    async getNotifications(userId) {
        const userIdx = this.mockDb.users.findIndex(u => u.id === userId);
        if (userIdx === -1)
            return [];
        const notifs = this.mockDb.users[userIdx].notifications || [];
        this.mockDb.users[userIdx].notifications = [];
        this.mockDb.saveToDisk();
        return notifs;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mock_db_service_1.MockDbService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map