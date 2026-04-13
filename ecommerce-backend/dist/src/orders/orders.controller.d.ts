import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './orders.dto';
import { OrderStatus } from './order.schema';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(userId: string, dto: CreateOrderDto): Promise<import("./order.schema").OrderDocument>;
    getUserOrders(userId: string, page: number, limit: number): Promise<{
        orders: (import("mongoose").Document<unknown, {}, import("./order.schema").OrderDocument, {}, {}> & import("./order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getAllOrders(page: number, limit: number, status?: OrderStatus): Promise<{
        orders: (import("mongoose").Document<unknown, {}, import("./order.schema").OrderDocument, {}, {}> & import("./order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getStats(): Promise<{
        totalOrders: number;
        totalRevenue: any;
        pendingOrders: number;
        deliveredOrders: number;
    }>;
    getOrder(id: string, userId: string, role: string): Promise<import("mongoose").Document<unknown, {}, import("./order.schema").OrderDocument, {}, {}> & import("./order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<import("mongoose").Document<unknown, {}, import("./order.schema").OrderDocument, {}, {}> & import("./order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
