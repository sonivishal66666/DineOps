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
exports.MenuController = void 0;
const common_1 = require("@nestjs/common");
const menu_service_1 = require("./menu.service");
let MenuController = class MenuController {
    menuService;
    constructor(menuService) {
        this.menuService = menuService;
    }
    async getCategories() {
        return this.menuService.getCategories();
    }
    async createCategory(dto) {
        return this.menuService.createCategory(dto);
    }
    async getItems(category, search, isVeg, isVegan, isGlutenFree, isKeto, isPopular, isTrending) {
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
    async createItem(dto) {
        return this.menuService.createItem(dto);
    }
    async updateItem(id, dto) {
        return this.menuService.updateItem(id, dto);
    }
};
exports.MenuController = MenuController;
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Post)('categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)('items'),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('isVeg')),
    __param(3, (0, common_1.Query)('isVegan')),
    __param(4, (0, common_1.Query)('isGlutenFree')),
    __param(5, (0, common_1.Query)('isKeto')),
    __param(6, (0, common_1.Query)('isPopular')),
    __param(7, (0, common_1.Query)('isTrending')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "getItems", null);
__decorate([
    (0, common_1.Post)('items'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "createItem", null);
__decorate([
    (0, common_1.Put)('items/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "updateItem", null);
exports.MenuController = MenuController = __decorate([
    (0, common_1.Controller)('api/menu'),
    __metadata("design:paramtypes", [menu_service_1.MenuService])
], MenuController);
//# sourceMappingURL=menu.controller.js.map