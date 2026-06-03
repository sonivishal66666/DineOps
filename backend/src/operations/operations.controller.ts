import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { OperationsService } from './operations.service';

@Controller('api/ops')
export class OperationsController {
  constructor(private readonly opsService: OperationsService) {}

  // Tables
  @Get('tables')
  async getTables(@Query('branchId') branchId?: string) {
    return this.opsService.getTables(branchId);
  }

  @Post('tables/reserve')
  async reserveTable(@Body() dto: any) {
    const userId = dto.userId || 'user-customer';
    return this.opsService.reserveTable(dto, userId);
  }

  @Put('tables/:id/status')
  async updateTableStatus(
    @Param('id') id: string,
    @Body('waiterNeeded') waiterNeeded?: boolean,
    @Body('billRequested') billRequested?: boolean,
  ) {
    return this.opsService.updateTableQR(id, { waiterNeeded, billRequested });
  }

  // Inventory
  @Get('inventory')
  async getInventory(@Query('branchId') branchId?: string) {
    return this.opsService.getInventory(branchId);
  }

  @Post('inventory/movement')
  async addMovement(@Body() dto: any) {
    return this.opsService.addInventoryMovement(dto);
  }

  // Shifts
  @Get('shifts')
  async getShifts(@Query('branchId') branchId?: string) {
    return this.opsService.getShifts(branchId);
  }

  @Put('shifts/:id/clock')
  async clockShift(@Param('id') id: string, @Body('type') type: 'IN' | 'OUT') {
    return this.opsService.clockShift(id, type);
  }

  // AI recommendations & Chat
  @Get('ai/recommendations')
  async getAiRecommendations(@Query('userId') userId?: string) {
    return this.opsService.getAiRecommendations(userId);
  }

  @Get('ai/forecasts')
  async getAiForecasts() {
    return this.opsService.getAiForecasts();
  }

  @Post('ai/chat')
  async triggerChat(@Body('message') message: string) {
    return this.opsService.triggerAiChat(message);
  }

  @Post('ai/review-sentiment')
  async analyzeReview(
    @Body('menuItemId') menuItemId: string,
    @Body('comment') comment: string,
  ) {
    return this.opsService.analyzeReviewSentiment(menuItemId, comment);
  }

  // Payments
  @Post('payments/session')
  async createPaymentSession(
    @Body('orderId') orderId: string,
    @Body('amount') amount: number,
  ) {
    return this.opsService.createPaymentSession(orderId, amount);
  }

  @Post('payments/verify')
  async verifyPayment(
    @Body('orderId') orderId: string,
    @Body('transactionId') transactionId: string,
  ) {
    return this.opsService.verifyPayment(orderId, transactionId);
  }

  // Table Reservations Management
  @Get('reservations')
  async getReservations() {
    return this.opsService.getReservations();
  }

  @Put('reservations/:id')
  async updateReservation(@Param('id') id: string, @Body() dto: any) {
    return this.opsService.updateReservation(id, dto);
  }

  @Delete('reservations/:id')
  async deleteReservation(@Param('id') id: string) {
    return this.opsService.deleteReservation(id);
  }

  // Reviews Feedback
  @Get('reviews')
  async getReviews() {
    return this.opsService.getReviews();
  }

  @Post('reviews')
  async addReview(@Body() dto: any) {
    return this.opsService.addReview(dto);
  }

  // Gift Vouchers
  @Post('gift-vouchers/purchase')
  async purchaseGiftVoucher(@Body() dto: any) {
    return this.opsService.purchaseGiftVoucher(dto);
  }
}
