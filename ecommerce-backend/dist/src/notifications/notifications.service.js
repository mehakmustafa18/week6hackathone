"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_schema_1 = require("./notification.schema");
const notifications_gateway_1 = require("./notifications.gateway");
let NotificationsService = class NotificationsService {
    constructor(notificationModel, gateway) {
        this.notificationModel = notificationModel;
        this.gateway = gateway;
    }
    async broadcastSaleNotification(data) {
        const discount = Math.round(((data.originalPrice - data.salePrice) / data.originalPrice) * 100);
        const notification = await this.notificationModel.create({
            isGlobal: true,
            title: '🔥 Flash Sale!',
            message: `${data.productName} is now ${discount}% off! Only $${data.salePrice} (was $${data.originalPrice})`,
            type: notification_schema_1.NotificationType.SALE,
            data,
        });
        this.gateway.broadcastToAll('saleStarted', {
            id: notification._id,
            title: notification.title,
            message: notification.message,
            data,
            timestamp: new Date().toISOString(),
        });
        return notification;
    }
    async notifyAdmins(title, message, type, data) {
        const notification = await this.notificationModel.create({
            isGlobal: true,
            title,
            message,
            type,
            data: { ...data, adminOnly: true },
        });
        const eventName = type === notification_schema_1.NotificationType.ORDER ? 'orderNotification' : 'notification';
        console.log(`[NotificationsService] Notifying admins. Event: ${eventName}, Title: ${title}`);
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
    async createUserNotification(userId, title, message, type, data) {
        const notification = await this.notificationModel.create({
            user: new mongoose_2.Types.ObjectId(userId),
            isGlobal: false,
            title,
            message,
            type,
            data,
        });
        let eventName = 'notification';
        if (type === notification_schema_1.NotificationType.ORDER)
            eventName = 'orderNotification';
        if (type === notification_schema_1.NotificationType.POINTS)
            eventName = 'pointsNotification';
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
    async getUserNotifications(userId, page = 1, limit = 20) {
        const filter = {
            $or: [
                { user: new mongoose_2.Types.ObjectId(userId) },
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
    async markAsRead(notificationId, userId) {
        const notification = await this.notificationModel.findOneAndUpdate({
            _id: notificationId,
            $or: [{ user: new mongoose_2.Types.ObjectId(userId) }, { isGlobal: true }],
        }, { isRead: true }, { new: true });
        return notification;
    }
    async markAllAsRead(userId) {
        await this.notificationModel.updateMany({
            $or: [{ user: new mongoose_2.Types.ObjectId(userId) }, { isGlobal: true }],
            isRead: false,
        }, { isRead: true });
        return { message: 'All notifications marked as read' };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        notifications_gateway_1.NotificationsGateway])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map