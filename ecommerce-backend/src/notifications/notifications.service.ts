import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './notification.schema';
import { NotificationsGateway } from './notifications.gateway';
import { UserRole } from '../users/user.schema';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel(Notification.name)
        private notificationModel: Model<NotificationDocument>,
        private gateway: NotificationsGateway,
    ) { }

    async broadcastSaleNotification(data: {
        productId: string;
        productName: string;
        originalPrice: number;
        salePrice: number;
    }) {
        const discount = Math.round(
            ((data.originalPrice - data.salePrice) / data.originalPrice) * 100,
        );

        const notification = await this.notificationModel.create({
            isGlobal: true,
            title: '🔥 Flash Sale!',
            message: `${data.productName} is now ${discount}% off! Only $${data.salePrice} (was $${data.originalPrice})`,
            type: NotificationType.SALE,
            data,
        });

        // Real-time broadcast to ALL connected clients
        this.gateway.broadcastToAll('saleStarted', {
            id: notification._id,
            title: notification.title,
            message: notification.message,
            data,
            timestamp: new Date().toISOString(),
        });

        return notification;
    }

    async notifyAdmins(title: string, message: string, type: NotificationType, data?: Record<string, any>) {
        // Create a global notification or target specific admins?
        // For simplicity and audit, we can create individual notifications for each admin if needed,
        // but often global with role-based visibility is better.
        // However, the current schema uses 'user' field for private ones.
        
        // We will create a global notification but specifically tagged for admins in the 'data' or a new field?
        // Actually, let's just broadcast real-time for now, and handle persistence if they want notifications history.
        // If we want history, we should create a global notification marked 'isAdminOnly' or similar.
        
        const notification = await this.notificationModel.create({
            isGlobal: true, // Making it global so any admin can see it
            title,
            message,
            type,
            data: { ...data, adminOnly: true },
        });

        const eventName = type === NotificationType.ORDER ? 'orderNotification' : 'notification';
        console.log(`[NotificationsService] Notifying admins. Event: ${eventName}, Title: ${title}`);

        // Real-time to all admin roles
        this.gateway.sendToAdmins(eventName, {
            id: notification._id,
            title,
            message,
            type,
            data,
            timestamp: new Date().toISOString(),
        });

        return notification;
    }

    async createUserNotification(
        userId: string,
        title: string,
        message: string,
        type: NotificationType,
        data?: Record<string, any>,
    ) {
        const notification = await this.notificationModel.create({
            user: new Types.ObjectId(userId),
            isGlobal: false,
            title,
            message,
            type,
            data,
        });

        // Determine event name for frontend SocketProvider
        let eventName = 'notification';
        if (type === NotificationType.ORDER) eventName = 'orderNotification';
        if (type === NotificationType.POINTS) eventName = 'pointsNotification';

        // Real-time to specific user
        this.gateway.sendToUser(userId, eventName, {
            id: notification._id,
            title,
            message,
            type,
            data,
            timestamp: new Date().toISOString(),
        });

        return notification;
    }

    async getUserNotifications(userId: string, page = 1, limit = 20) {
        const filter = {
            $or: [
                { user: new Types.ObjectId(userId) },
                { isGlobal: true },
            ],
        };

        const [notifications, total, unreadCount] = await Promise.all([
            this.notificationModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            this.notificationModel.countDocuments(filter),
            this.notificationModel.countDocuments({ ...filter, isRead: false }),
        ]);

        return { notifications, total, unreadCount, page, totalPages: Math.ceil(total / limit) };
    }

    async markAsRead(notificationId: string, userId: string) {
        const notification = await this.notificationModel.findOneAndUpdate(
            {
                _id: notificationId,
                $or: [{ user: new Types.ObjectId(userId) }, { isGlobal: true }],
            },
            { isRead: true },
            { new: true },
        );
        return notification;
    }

    async markAllAsRead(userId: string) {
        await this.notificationModel.updateMany(
            {
                $or: [{ user: new Types.ObjectId(userId) }, { isGlobal: true }],
                isRead: false,
            },
            { isRead: true },
        );
        return { message: 'All notifications marked as read' };
    }
}