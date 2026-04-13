import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
    SALE = 'sale',
    ORDER = 'order',
    POINTS = 'points',
    SYSTEM = 'system',
    REVIEW = 'review',
}

@Schema({ timestamps: true })
export class Notification {
    @Prop({ type: Types.ObjectId, ref: 'User' })
    user?: Types.ObjectId;

    @Prop({ default: false })
    isGlobal: boolean;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    message: string;

    @Prop({ type: String, enum: NotificationType, default: NotificationType.SYSTEM })
    type: NotificationType;

    @Prop({ type: Object })
    data?: Record<string, any>;

    @Prop({ default: false })
    isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);