import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ProductDocument = Product & Document;

export enum PurchaseType {
    MONEY = 'money',
    POINTS = 'points',
    HYBRID = 'hybrid',
}

@Schema({ timestamps: true })
export class Product {
    @ApiProperty()
    @Prop({ required: true, trim: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true })
    description: string;

    @ApiProperty()
    @Prop({ required: true, min: 0 })
    price: number;

    @ApiProperty()
    @Prop({ default: 0, min: 0 })
    salePrice: number;

    @ApiProperty()
    @Prop({ default: false })
    isOnSale: boolean;

    @ApiProperty()
    @Prop()
    saleStartDate?: Date;

    @ApiProperty()
    @Prop()
    saleEndDate?: Date;

    @ApiProperty()
    @Prop({ required: true, min: 0 })
    stock: number;

    @ApiProperty()
    @Prop({ required: true })
    category: string;

    @ApiProperty()
    @Prop([String])
    images: string[];

    @ApiProperty()
    @Prop([{ name: String, hex: String, imageUrl: String }])
    colors: { name: string; hex: string; imageUrl: string }[];

    @ApiProperty()
    @Prop([String])
    sizes: string[];

    @ApiProperty({ enum: PurchaseType })
    @Prop({ type: String, enum: PurchaseType, default: PurchaseType.MONEY })
    purchaseType: PurchaseType;

    @ApiProperty()
    @Prop({ default: 0 })
    pointsPrice: number;

    @ApiProperty()
    @Prop({ default: 0 })
    pointsEarned: number;

    @ApiProperty()
    @Prop({ default: true })
    isActive: boolean;

    @ApiProperty()
    @Prop({ default: 0 })
    rating: number;

    @ApiProperty()
    @Prop({ default: 0 })
    reviewCount: number;

    @ApiProperty({ enum: ['none', 'new-arrivals', 'top-selling'] })
    @Prop({ type: String, enum: ['none', 'new-arrivals', 'top-selling'], default: 'none' })
    displaySection: string;

    @ApiProperty()
    @Prop([{
        userId: String,
        rating: Number,
        comment: String,
        date: { type: Date, default: Date.now },
    }])
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

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ isOnSale: 1 });
ProductSchema.index({ purchaseType: 1 });