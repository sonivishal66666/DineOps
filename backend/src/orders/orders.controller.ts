import { Controller, Post, Get, Put, Param, Body, Req, UseGuards, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('place')
  async placeOrder(@Body() dto: any, @Req() req: any) {
    // If authorization header is present, we extract user
    const authHeader = req.headers.authorization;
    let userId: string | undefined;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        // Decode manually to allow order placement even if token validation is skipped
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = payload.id;
      } catch (err) {}
    }

    return this.ordersService.placeOrder(dto, userId);
  }

  @Get()
  async getOrders(
    @Query('role') role?: string,
    @Query('userId') userId?: string,
  ) {
    return this.ordersService.getOrders(userId, role);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('deliveryStaffId') deliveryStaffId?: string,
  ) {
    return this.ordersService.updateStatus(id, status, deliveryStaffId);
  }

  @Post(':id/otp-verify')
  async verifyOtp(@Param('id') id: string, @Body('otp') otp: string) {
    return this.ordersService.verifyOtp(id, otp);
  }

  @Get(':id/split-bill')
  async splitBill(@Param('id') id: string, @Query('guests') guests: string) {
    const guestsCount = guests ? parseInt(guests, 10) : 2;
    return this.ordersService.splitBill(id, guestsCount);
  }
}
