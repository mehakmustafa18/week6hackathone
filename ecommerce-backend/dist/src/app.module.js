"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const core_1 = require("@nestjs/core");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const products_module_1 = require("./products/products.module");
const cart_module_1 = require("./cart/cart.module");
const orders_module_1 = require("./orders/orders.module");
const notifications_module_1 = require("./notifications/notifications.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const seeder_service_1 = require("./seeder.service");
const user_schema_1 = require("./users/user.schema");
const product_schema_1 = require("./products/product.schema");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    uri: config.get('MONGODB_URI', 'mongodb://localhost:27017/ecommerce'),
                    autoIndex: true,
                    connectTimeoutMS: 10000,
                    socketTimeoutMS: 45000,
                }),
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: product_schema_1.Product.name, schema: product_schema_1.ProductSchema },
            ]),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            products_module_1.ProductsModule,
            cart_module_1.CartModule,
            orders_module_1.OrdersModule,
            notifications_module_1.NotificationsModule,
        ],
        providers: [
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
            { provide: core_1.APP_FILTER, useClass: all_exceptions_filter_1.AllExceptionsFilter },
            seeder_service_1.SeederService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map