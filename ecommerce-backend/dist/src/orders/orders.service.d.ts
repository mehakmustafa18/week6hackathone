import { Model, Types } from 'mongoose';
import { Connection } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './order.schema';
import { ProductDocument } from '../products/product.schema';
import { CreateOrderDto, UpdateOrderStatusDto } from './orders.dto';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ConfigService } from '@nestjs/config';
import { CartService } from '../cart/cart.service';
export declare class OrdersService {
    private orderModel;
    private productModel;
    private connection;
    private usersService;
    private notificationsService;
    private configService;
    private cartService;
    constructor(orderModel: Model<OrderDocument>, productModel: Model<ProductDocument>, connection: Connection, usersService: UsersService, notificationsService: NotificationsService, configService: ConfigService, cartService: CartService);
    createOrder(userId: string, dto: CreateOrderDto): Promise<OrderDocument>;
    getUserOrders(userId: string, page?: number, limit?: number): Promise<{
        orders: (import("mongoose").Document<unknown, {}, OrderDocument, {}, {}> & Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getOrderById(orderId: string, userId: string, userRole: string): Promise<import("mongoose").Document<unknown, {}, OrderDocument, {}, {}> & Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto): Promise<import("mongoose").Document<unknown, {}, OrderDocument, {}, {}> & Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getAllOrders(page?: number, limit?: number, status?: OrderStatus): Promise<{
        orders: (import("mongoose").Document<unknown, {}, OrderDocument, {}, {}> & Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getOrderStats(): Promise<{
        totalOrders: number;
        totalRevenue: any;
        pendingOrders: number;
        deliveredOrders: number;
    }>;
}
