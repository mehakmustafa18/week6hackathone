import { Document, Types } from 'mongoose';
export type NotificationDocument = Notification & Document;
export declare enum NotificationType {
    SALE = "sale",
    ORDER = "order",
    POINTS = "points",
    SYSTEM = "system",
    REVIEW = "review"
}
export declare class Notification {
    user?: Types.ObjectId;
    isGlobal: boolean;
    title: string;
    message: string;
    type: NotificationType;
    data?: Record<string, any>;
    isRead: boolean;
}
export declare const NotificationSchema: import("mongoose").Schema<Notification, import("mongoose").Model<Notification, any, any, any, Document<unknown, any, Notification, any, {}> & Notification & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Notification, Document<unknown, {}, import("mongoose").FlatRecord<Notification>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Notification> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
