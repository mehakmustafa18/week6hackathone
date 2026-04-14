import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from './order.schema';
import { Product, ProductSchema } from '../products/product.schema';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CartModule } from '../cart/cart.module';

import { StripeService } from './stripe.service';
import { WebhookController } from './webhook.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema },
            { name: Product.name, schema: ProductSchema },
        ]),
        UsersModule,
        NotificationsModule,
        CartModule,
    ],
    controllers: [OrdersController, WebhookController],
    providers: [OrdersService, StripeService],
    exports: [OrdersService],
})
export class OrdersModule { }