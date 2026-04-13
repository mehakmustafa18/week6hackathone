import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart, CartSchema } from './cart.schema';
import { Product, ProductSchema } from '../products/product.schema';
import { User, UserSchema } from '../users/user.schema';
import { ProductsModule } from '../products/products.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Cart.name, schema: CartSchema },
            { name: Product.name, schema: ProductSchema },
            { name: User.name, schema: UserSchema },
        ]),
        ProductsModule,
    ],
    controllers: [CartController],
    providers: [CartService],
    exports: [CartService],
})
export class CartModule { }