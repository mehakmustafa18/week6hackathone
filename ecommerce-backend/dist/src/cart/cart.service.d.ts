import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './cart.schema';
import { ProductDocument } from '../products/product.schema';
import { UserDocument } from '../users/user.schema';
import { AddToCartDto, UpdateCartItemDto } from './cart.dto';
import { ProductsService } from '../products/products.service';
export declare class CartService {
    private cartModel;
    private productModel;
    private userModel;
    private productsService;
    constructor(cartModel: Model<CartDocument>, productModel: Model<ProductDocument>, userModel: Model<UserDocument>, productsService: ProductsService);
    getCart(userId: string): Promise<import("mongoose").Document<unknown, {}, CartDocument, {}, {}> & Cart & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    addItem(userId: string, dto: AddToCartDto): Promise<Omit<import("mongoose").Document<unknown, {}, CartDocument, {}, {}> & Cart & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
    updateItem(userId: string, productId: string, dto: UpdateCartItemDto): Promise<Omit<import("mongoose").Document<unknown, {}, CartDocument, {}, {}> & Cart & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
    removeItem(userId: string, productId: string): Promise<Omit<import("mongoose").Document<unknown, {}, CartDocument, {}, {}> & Cart & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
    clearCart(userId: string, session?: any): Promise<{
        message: string;
        success: boolean;
    }>;
    private recalculate;
}
