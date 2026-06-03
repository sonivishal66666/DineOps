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
exports.OperationsController = void 0;
const common_1 = require("@nestjs/common");
const operations_service_1 = require("./operations.service");
let OperationsController = class OperationsController {
    opsService;
    constructor(opsService) {
        this.opsService = opsService;
    }
    async getTables(branchId) {
        return this.opsService.getTables(branchId);
    }
    async reserveTable(dto) {
        const userId = dto.userId || 'user-customer';
        return this.opsService.reserveTable(dto, userId);
    }
    async updateTableStatus(id, waiterNeeded, billRequested) {
        return this.opsService.updateTableQR(id, { waiterNeeded, billRequested });
    }
    async getInventory(branchId) {
        return this.opsService.getInventory(branchId);
    }
    async addMovement(dto) {
        return this.opsService.addInventoryMovement(dto);
    }
    async getShifts(branchId) {
        return this.opsService.getShifts(branchId);
    }
    async clockShift(id, type) {
        return this.opsService.clockShift(id, type);
    }
    async getAiRecommendations(userId) {
        return this.opsService.getAiRecommendations(userId);
    }
    async getAiForecasts() {
        return this.opsService.getAiForecasts();
    }
    async triggerChat(message) {
        return this.opsService.triggerAiChat(message);
    }
    async analyzeReview(menuItemId, comment) {
        return this.opsService.analyzeReviewSentiment(menuItemId, comment);
    }
    async createPaymentSession(orderId, amount) {
        return this.opsService.createPaymentSession(orderId, amount);
    }
    async verifyPayment(orderId, transactionId) {
        return this.opsService.verifyPayment(orderId, transactionId);
    }
    async getReservations() {
        return this.opsService.getReservations();
    }
    async updateReservation(id, dto) {
        return this.opsService.updateReservation(id, dto);
    }
    async deleteReservation(id) {
        return this.opsService.deleteReservation(id);
    }
    async getReviews() {
        return this.opsService.getReviews();
    }
    async addReview(dto) {
        return this.opsService.addReview(dto);
    }
    async purchaseGiftVoucher(dto) {
        return this.opsService.purchaseGiftVoucher(dto);
    }
};
exports.OperationsController = OperationsController;
__decorate([
    (0, common_1.Get)('tables'),
    __param(0, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "getTables", null);
__decorate([
    (0, common_1.Post)('tables/reserve'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "reserveTable", null);
__decorate([
    (0, common_1.Put)('tables/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('waiterNeeded')),
    __param(2, (0, common_1.Body)('billRequested')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Boolean]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "updateTableStatus", null);
__decorate([
    (0, common_1.Get)('inventory'),
    __param(0, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "getInventory", null);
__decorate([
    (0, common_1.Post)('inventory/movement'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "addMovement", null);
__decorate([
    (0, common_1.Get)('shifts'),
    __param(0, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "getShifts", null);
__decorate([
    (0, common_1.Put)('shifts/:id/clock'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "clockShift", null);
__decorate([
    (0, common_1.Get)('ai/recommendations'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "getAiRecommendations", null);
__decorate([
    (0, common_1.Get)('ai/forecasts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "getAiForecasts", null);
__decorate([
    (0, common_1.Post)('ai/chat'),
    __param(0, (0, common_1.Body)('message')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "triggerChat", null);
__decorate([
    (0, common_1.Post)('ai/review-sentiment'),
    __param(0, (0, common_1.Body)('menuItemId')),
    __param(1, (0, common_1.Body)('comment')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "analyzeReview", null);
__decorate([
    (0, common_1.Post)('payments/session'),
    __param(0, (0, common_1.Body)('orderId')),
    __param(1, (0, common_1.Body)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "createPaymentSession", null);
__decorate([
    (0, common_1.Post)('payments/verify'),
    __param(0, (0, common_1.Body)('orderId')),
    __param(1, (0, common_1.Body)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Get)('reservations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "getReservations", null);
__decorate([
    (0, common_1.Put)('reservations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "updateReservation", null);
__decorate([
    (0, common_1.Delete)('reservations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "deleteReservation", null);
__decorate([
    (0, common_1.Get)('reviews'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "getReviews", null);
__decorate([
    (0, common_1.Post)('reviews'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "addReview", null);
__decorate([
    (0, common_1.Post)('gift-vouchers/purchase'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "purchaseGiftVoucher", null);
exports.OperationsController = OperationsController = __decorate([
    (0, common_1.Controller)('api/ops'),
    __metadata("design:paramtypes", [operations_service_1.OperationsService])
], OperationsController);
//# sourceMappingURL=operations.controller.js.map