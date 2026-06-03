import { Controller, Post, Get, Body, Req, UseGuards, Put, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: any) {
    return this.authService.signup(dto);
  }

  @Post('login')
  async login(@Body() dto: any) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Req() req: any, @Body() data: any) {
    return this.authService.updateProfile(req.user.id, data);
  }

  @Get('users')
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Put('users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body('role') role: string) {
    return this.authService.updateUserRole(id, role);
  }

  @UseGuards(JwtAuthGuard)
  @Get('notifications')
  async getNotifications(@Req() req: any) {
    return this.authService.getNotifications(req.user.id);
  }
}
