import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CartDocument = Cart & Document;

@Schema({ timestamps: true })
export class CartItem {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    product: Types.ObjectId;

    @Prop({ required: true, min: 1 })
    quantity: number;

    @Prop({ required: true })
    priceAtTime: number;

    @Prop({ default: false })
    usePoints: boolean;

    @Prop({ default: 0 })
    pointsPriceAtTime: number;
}

@Schema({ timestamps: true })
export class Cart {
    @ApiProperty()
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    user: Types.ObjectId;

    @ApiProperty()
    @Prop([CartItem])
    items: CartItem[];

    @ApiProperty()
    @Prop({ default: 0 })
    totalAmount: number;

    @ApiProperty()
    @Prop({ default: 0 })
    totalPoints: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);