import { Document } from 'mongoose';
export type ProductDocument = Product & Document;
export declare enum PurchaseType {
    MONEY = "money",
    POINTS = "points",
    HYBRID = "hybrid"
}
export declare class Product {
    name: string;
    description: string;
    price: number;
    salePrice: number;
    isOnSale: boolean;
    saleStartDate?: Date;
    saleEndDate?: Date;
    stock: number;
    category: string;
    images: string[];
    colors: {
        name: string;
        hex: string;
        imageUrl: string;
    }[];
    sizes: string[];
    purchaseType: PurchaseType;
    pointsPrice: number;
    pointsEarned: number;
    isActive: boolean;
    rating: number;
    reviewCount: number;
    displaySection: string;
    reviews: {
        userId: string;
        userName: string;
        rating: number;
        comment: string;
        date: Date;
        reply?: {
            message: string;
            date: Date;
        };
    }[];
}
export declare const ProductSchema: import("mongoose").Schema<Product, import("mongoose").Model<Product, any, any, any, Document<unknown, any, Product, any, {}> & Product & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Product, Document<unknown, {}, import("mongoose").FlatRecord<Product>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Product> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
