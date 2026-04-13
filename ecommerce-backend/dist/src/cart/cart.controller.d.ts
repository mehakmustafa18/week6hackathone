import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './cart.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(userId: string): Promise<import("mongoose").Document<unknown, {}, import("./cart.schema").CartDocument, {}, {}> & import("./cart.schema").Cart & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    addItem(userId: string, dto: AddToCartDto): Promise<Omit<import("mongoose").Document<unknown, {}, import("./cart.schema").CartDocument, {}, {}> & import("./cart.schema").Cart & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
    updateItem(userId: string, productId: string, dto: UpdateCartItemDto): Promise<Omit<import("mongoose").Document<unknown, {}, import("./cart.schema").CartDocument, {}, {}> & import("./cart.schema").Cart & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
    removeItem(userId: string, productId: string): Promise<Omit<import("mongoose").Document<unknown, {}, import("./cart.schema").CartDocument, {}, {}> & import("./cart.schema").Cart & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, never>>;
    clearCart(userId: string): Promise<{
        message: string;
        success: boolean;
    }>;
}
