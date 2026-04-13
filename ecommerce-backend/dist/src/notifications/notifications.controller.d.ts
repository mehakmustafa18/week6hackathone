import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(userId: string, page: number, limit: number): Promise<{
        notifications: (import("mongoose").Document<unknown, {}, import("./notification.schema").NotificationDocument, {}, {}> & import("./notification.schema").Notification & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        unreadCount: number;
        page: number;
        totalPages: number;
    }>;
    markAsRead(id: string, userId: string): Promise<import("mongoose").Document<unknown, {}, import("./notification.schema").NotificationDocument, {}, {}> & import("./notification.schema").Notification & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    markAllAsRead(userId: string): Promise<{
        message: string;
    }>;
}
