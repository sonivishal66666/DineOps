"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async placeOrder(dto, req) {
        const authHeader = req.headers.authorization;
        let userId;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                userId = payload.id;
            }
            catch (err) { }
        }
        return this.ordersService.placeOrder(dto, userId);
    }
    async getOrders(role, userId) {
        return this.ordersService.getOrders(userId, role);
    }
    async updateStatus(id, status, deliveryStaffId) {
        return this.ordersService.updateStatus(id, status, deliveryStaffId);
    }
    async verifyOtp(id, otp) {
        return this.ordersService.verifyOtp(id, otp);
    }
    async splitBill(id, guests) {
        const guestsCount = guests ? parseInt(guests, 10) : 2;
        return this.ordersService.splitBill(id, guestsCount);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)('place'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "placeOrder", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('role')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('deliveryStaffId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/otp-verify'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('otp')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Get)(':id/split-bill'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('guests')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "splitBill", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('api/orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map