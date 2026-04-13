import { Document, Types } from 'mongoose';
export type OrderDocument = Order & Document;
export declare enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PROCESSING = "processing",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled",
    REFUNDED = "refunded"
}
export declare enum PaymentMethod {
    CASH = "cash",
    CARD = "card",
    POINTS = "points",
    HYBRID = "hybrid"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed",
    REFUNDED = "refunded"
}
export declare class OrderItem {
    product: Types.ObjectId;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
    paidWithPoints: boolean;
    pointsUsed: number;
    pointsEarned: number;
}
export declare const OrderItemSchema: import("mongoose").Schema<OrderItem, import("mongoose").Model<OrderItem, any, any, any, Document<unknown, any, OrderItem, any, {}> & OrderItem & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, OrderItem, Document<unknown, {}, import("mongoose").FlatRecord<OrderItem>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<OrderItem> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare class Order {
    user: Types.ObjectId;
    items: OrderItem[];
    totalAmount: number;
    totalPointsUsed: number;
    totalPointsEarned: number;
    discount: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    shippingAddress: {
        name: string;
        phone: string;
        street: string;
        city: string;
        state: string;
        country: string;
        zip: string;
    };
    notes?: string;
    orderNumber: string;
}
export declare const OrderSchema: import("mongoose").Schema<Order, import("mongoose").Model<Order, any, any, any, Document<unknown, any, Order, any, {}> & Order & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Order, Document<unknown, {}, import("mongoose").FlatRecord<Order>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Order> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
