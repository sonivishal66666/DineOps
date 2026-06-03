import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { MenuService } from './menu.service';

@Controller('api/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('categories')
  async getCategories() {
    return this.menuService.getCategories();
  }

  @Post('categories')
  async createCategory(@Body() dto: any) {
    return this.menuService.createCategory(dto);
  }

  @Get('items')
  async getItems(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('isVeg') isVeg?: string,
    @Query('isVegan') isVegan?: string,
    @Query('isGlutenFree') isGlutenFree?: string,
    @Query('isKeto') isKeto?: string,
    @Query('isPopular') isPopular?: string,
    @Query('isTrending') isTrending?: string,
  ) {
    return this.menuService.getItems({
      category,
      search,
      isVeg,
      isVegan,
      isGlutenFree,
      isKeto,
      isPopular,
      isTrending,
    });
  }

  @Post('items')
  async createItem(@Body() dto: any) {
    return this.menuService.createItem(dto);
  }

  @Put('items/:id')
  async updateItem(@Param('id') id: string, @Body() dto: any) {
    return this.menuService.updateItem(id, dto);
  }
}
