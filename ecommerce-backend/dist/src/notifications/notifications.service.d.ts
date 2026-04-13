import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './notification.schema';
import { NotificationsGateway } from './notifications.gateway';
export declare class NotificationsService {
    private notificationModel;
    private gateway;
    constructor(notificationModel: Model<NotificationDocument>, gateway: NotificationsGateway);
    broadcastSaleNotification(data: {
        productId: string;
        productName: string;
        originalPrice: number;
        salePrice: number;
    }): Promise<import("mongoose").Document<unknown, {}, NotificationDocument, {}, {}> & Notification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    notifyAdmins(title: string, message: string, type: NotificationType, data?: Record<string, any>): Promise<import("mongoose").Document<unknown, {}, NotificationDocument, {}, {}> & Notification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    createUserNotification(userId: string, title: string, message: string, type: NotificationType, data?: Record<string, any>): Promise<import("mongoose").Document<unknown, {}, NotificationDocument, {}, {}> & Notification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getUserNotifications(userId: string, page?: number, limit?: number): Promise<{
        notifications: (import("mongoose").Document<unknown, {}, NotificationDocument, {}, {}> & Notification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        unreadCount: number;
        page: number;
        totalPages: number;
    }>;
    markAsRead(notificationId: string, userId: string): Promise<import("mongoose").Document<unknown, {}, NotificationDocument, {}, {}> & Notification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    markAllAsRead(userId: string): Promise<{
        message: string;
    }>;
}
