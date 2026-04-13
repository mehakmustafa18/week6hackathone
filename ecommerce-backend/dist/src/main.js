"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api/v1');
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3001',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('LoyalShop API')
        .setDescription('E-Commerce API with Loyalty Points System\n\n**Default Credentials:**\n- superadmin@shop.com / Admin@123\n- admin@shop.com / Admin@123\n- john@example.com / Admin@123')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('Auth')
        .addTag('Users')
        .addTag('Products')
        .addTag('Cart')
        .addTag('Orders')
        .addTag('Notifications')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Server running on http://localhost:${port}`);
    logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
    logger.log(`WebSocket at ws://localhost:${port}/notifications`);
}
bootstrap();
//# sourceMappingURL=main.js.map