import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type OrderDocument = Order & Document;

export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
}

export enum PaymentMethod {
    CASH = 'cash',
    CARD = 'card',
    POINTS = 'points',
    HYBRID = 'hybrid',
}

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    FAILED = 'failed',
    REFUNDED = 'refunded',
}

@Schema({ _id: false })
export class OrderItem {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    product: Types.ObjectId;

    @Prop({ required: true })
    productName: string;

    @Prop({ default: '' })
    productImage: string;

    @Prop({ required: true, min: 1 })
    quantity: number;

    @Prop({ required: true })
    price: number;

    @Prop({ default: false })
    paidWithPoints: boolean;

    @Prop({ default: 0 })
    pointsUsed: number;

    @Prop({ default: 0 })
    pointsEarned: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
    @ApiProperty()
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @ApiProperty()
    @Prop({ type: [OrderItemSchema] })
    items: OrderItem[];

    @ApiProperty()
    @Prop({ required: true })
    totalAmount: number;

    @ApiProperty()
    @Prop({ default: 0 })
    totalPointsUsed: number;

    @ApiProperty()
    @Prop({ default: 0 })
    totalPointsEarned: number;

    @ApiProperty()
    @Prop({ default: 0 })
    discount: number;

    @ApiProperty({ enum: OrderStatus })
    @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus;

    @ApiProperty({ enum: PaymentMethod })
    @Prop({ type: String, enum: PaymentMethod, required: true })
    paymentMethod: PaymentMethod;

    @ApiProperty({ enum: PaymentStatus })
    @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
    paymentStatus: PaymentStatus;

    @ApiProperty()
    @Prop({ required: true, type: Object })
    shippingAddress: {
        name: string;
        phone: string;
        street: string;
        city: string;
        state: string;
        country: string;
        zip: string;
    };

    @ApiProperty()
    @Prop()
    notes?: string;

    @ApiProperty()
    @Prop()
    orderNumber: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.pre('save', function (this: any, next: () => void) {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substring(2,7).toUpperCase();
  }
  next();
});