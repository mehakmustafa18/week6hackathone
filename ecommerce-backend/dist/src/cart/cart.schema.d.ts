import { Document, Types } from 'mongoose';
export type CartDocument = Cart & Document;
export declare class CartItem {
    product: Types.ObjectId;
    quantity: number;
    priceAtTime: number;
    usePoints: boolean;
    pointsPriceAtTime: number;
}
export declare class Cart {
    user: Types.ObjectId;
    items: CartItem[];
    totalAmount: number;
    totalPoints: number;
}
export declare const CartSchema: import("mongoose").Schema<Cart, import("mongoose").Model<Cart, any, any, any, Document<unknown, any, Cart, any, {}> & Cart & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Cart, Document<unknown, {}, import("mongoose").FlatRecord<Cart>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Cart> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
