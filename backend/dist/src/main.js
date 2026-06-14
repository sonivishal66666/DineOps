"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
const logger = new common_1.Logger('Bootstrap');
const expressApp = (0, express_1.default)();
let nestApp;
async function bootstrap() {
    if (!nestApp) {
        nestApp = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressApp));
        nestApp.enableCors({
            origin: '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            credentials: true,
        });
        await nestApp.init();
    }
    return expressApp;
}
if (!process.env.VERCEL) {
    bootstrap().then(async () => {
        const port = process.env.PORT || 5000;
        await nestApp.listen(port);
        logger.log(`DineOps backend running locally on: http://localhost:${port}`);
    });
}
exports.default = async (req, res) => {
    const server = await bootstrap();
    return server(req, res);
};
//# sourceMappingURL=main.js.map