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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const mongoose_3 = require("@nestjs/mongoose");
const mongoose_4 = require("mongoose");
const order_schema_1 = require("./order.schema");
const product_schema_1 = require("../products/product.schema");
const product_schema_2 = require("../products/product.schema");
const users_service_1 = require("../users/users.service");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_schema_1 = require("../notifications/notification.schema");
const config_1 = require("@nestjs/config");
const cart_service_1 = require("../cart/cart.service");
let OrdersService = class OrdersService {
    constructor(orderModel, productModel, connection, usersService, notificationsService, configService, cartService) {
        this.orderModel = orderModel;
        this.productModel = productModel;
        this.connection = connection;
        this.usersService = usersService;
        this.notificationsService = notificationsService;
        this.configService = configService;
        this.cartService = cartService;
    }
    async createOrder(userId, dto) {
        const session = await this.connection.startSession();
        session.startTransaction();
        try {
            const orderItems = [];
            let totalAmount = 0;
            let totalPointsUsed = 0;
            let totalPointsEarned = 0;
            let totalDiscount = 0;
            for (const item of dto.items) {
                const product = await this.productModel.findById(item.productId).session(session);
                if (!product || !product.isActive) {
                    throw new common_1.NotFoundException(`Product ${item.productId} not found`);
                }
                if (product.stock < item.quantity) {
                    throw new common_1.BadRequestException(`Insufficient stock for "${product.name}". Available: ${product.stock}`);
                }
                const usePoints = item.usePoints || false;
                const isPointsOnly = product.purchaseType === product_schema_2.PurchaseType.POINTS;
                const isHybrid = product.purchaseType === product_schema_2.PurchaseType.HYBRID;
                if (isPointsOnly && !usePoints) {
                    throw new common_1.BadRequestException(`"${product.name}" can only be purchased with loyalty points`);
                }
                if (!isHybrid && !isPointsOnly && usePoints) {
                    throw new common_1.BadRequestException(`"${product.name}" cannot be purchased with loyalty points`);
                }
                let itemPrice = 0;
                let itemPointsUsed = 0;
                let itemPointsEarned = 0;
                if (usePoints) {
                    if (!product.pointsPrice) {
                        throw new common_1.BadRequestException(`"${product.name}" has no points price set`);
                    }
                    itemPointsUsed = product.pointsPrice * item.quantity;
                    totalPointsUsed += itemPointsUsed;
                }
                else {
                    const now = new Date();
                    let effectivePrice = product.price;
                    if (product.isOnSale &&
                        product.salePrice > 0 &&
                        (!product.saleStartDate || product.saleStartDate <= now) &&
                        (!product.saleEndDate || product.saleEndDate >= now)) {
                        totalDiscount += (product.price - product.salePrice) * item.quantity;
                        effectivePrice = product.salePrice;
                    }
                    itemPrice = effectivePrice * item.quantity;
                    totalAmount += itemPrice;
                    const pointsRate = this.configService.get('POINTS_PER_DOLLAR', 10);
                    itemPointsEarned = Math.floor(effectivePrice * item.quantity * pointsRate);
                    totalPointsEarned += itemPointsEarned;
                }
                orderItems.push({
                    product: new mongoose_2.Types.ObjectId(item.productId),
                    productName: product.name,
                    productImage: product.images?.[0] || '',
                    quantity: item.quantity,
                    price: itemPrice / (item.quantity || 1),
                    paidWithPoints: usePoints,
                    pointsUsed: itemPointsUsed,
                    pointsEarned: itemPointsEarned,
                });
                product.stock -= item.quantity;
                await product.save({ session });
            }
            if (totalPointsUsed > 0) {
                await this.usersService.deductLoyaltyPoints(userId, totalPointsUsed, session);
            }
            const [order] = await this.orderModel.create([
                {
                    user: new mongoose_2.Types.ObjectId(userId),
                    items: orderItems,
                    totalAmount: Math.round(totalAmount * 100) / 100,
                    totalPointsUsed,
                    totalPointsEarned,
                    discount: Math.round(totalDiscount * 100) / 100,
                    paymentMethod: dto.paymentMethod,
                    paymentStatus: dto.paymentMethod === order_schema_1.PaymentMethod.CASH
                        ? order_schema_1.PaymentStatus.PENDING
                        : order_schema_1.PaymentStatus.PAID,
                    status: order_schema_1.OrderStatus.CONFIRMED,
                    shippingAddress: dto.shippingAddress,
                    notes: dto.notes,
                },
            ], { session });
            if (totalPointsEarned > 0) {
                await this.usersService.addLoyaltyPoints(userId, totalPointsEarned, session);
            }
            console.log(`[OrdersService] Attempting to clear cart for user: ${userId} within transaction`);
            await this.cartService.clearCart(userId, session);
            await session.commitTransaction();
            console.log('[OrdersService] Transaction committed successfully');
            console.log(`[OrdersService] Sending notification to buyer: ${userId}`);
            await this.notificationsService.createUserNotification(userId, '✅ Order Confirmed!', `Your order #${order.orderNumber} has been confirmed. You earned ${totalPointsEarned} loyalty points!`, notification_schema_1.NotificationType.ORDER, { orderId: order._id, orderNumber: order.orderNumber });
            console.log('[OrdersService] Notifying admins about new order');
            await this.notificationsService.notifyAdmins('🛍️ New Order Received!', `A new order #${order.orderNumber} has been placed for $${order.totalAmount}.`, notification_schema_1.NotificationType.ORDER, { orderId: order._id, userId });
            if (totalPointsEarned > 0) {
                await this.notificationsService.createUserNotification(userId, '🌟 Loyalty Points Earned!', `You earned ${totalPointsEarned} loyalty points from your recent purchase!`, notification_schema_1.NotificationType.POINTS, { pointsEarned: totalPointsEarned });
            }
            return order;
        }
        catch (err) {
            await session.abortTransaction();
            throw err;
        }
        finally {
            session.endSession();
        }
    }
    async getUserOrders(userId, page = 1, limit = 10) {
        console.log(`[OrdersService] Fetching orders for user: ${userId}`);
        const [orders, total] = await Promise.all([
            this.orderModel
                .find({ user: new mongoose_2.Types.ObjectId(userId) })
                .populate('items.product', 'name images price')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .exec(),
            this.orderModel.countDocuments({ user: new mongoose_2.Types.ObjectId(userId) }).exec(),
        ]);
        return { orders, total, page, totalPages: Math.ceil(total / limit) };
    }
    async getOrderById(orderId, userId, userRole) {
        const order = await this.orderModel
            .findById(orderId)
            .populate('items.product', 'name images price category')
            .populate('user', 'name email')
            .exec();
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const isOwner = order.user?._id?.toString() === userId;
        const isAdmin = ['admin', 'super_admin'].includes(userRole);
        if (!isOwner && !isAdmin) {
            throw new common_1.ForbiddenException('You cannot access this order');
        }
        return order;
    }
    async updateOrderStatus(orderId, dto) {
        const order = await this.orderModel.findByIdAndUpdate(orderId, { status: dto.status }, { new: true }).exec();
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        await this.notificationsService.createUserNotification(order.user.toString(), `📦 Order ${dto.status.charAt(0).toUpperCase() + dto.status.slice(1)}`, `Your order #${order.orderNumber} status has been updated to ${dto.status}.`, notification_schema_1.NotificationType.ORDER, { orderId: order._id, status: dto.status });
        return order;
    }
    async getAllOrders(page = 1, limit = 20, status) {
        console.log(`[OrdersService] Fetching all orders (Admin). Page: ${page}, Limit: ${limit}, Status: ${status || 'all'}`);
        const filter = {};
        if (status)
            filter.status = status;
        const [orders, total] = await Promise.all([
            this.orderModel
                .find(filter)
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .exec(),
            this.orderModel.countDocuments(filter).exec(),
        ]);
        return { orders, total, page, totalPages: Math.ceil(total / limit) };
    }
    async getOrderStats() {
        console.log('[OrdersService] Fetching admin dashboard stats');
        const [totalOrders, totalRevenue, pendingOrders, deliveredOrders] = await Promise.all([
            this.orderModel.countDocuments().exec(),
            this.orderModel.aggregate([
                { $match: { status: { $ne: order_schema_1.OrderStatus.CANCELLED } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ]).exec(),
            this.orderModel.countDocuments({ status: order_schema_1.OrderStatus.PENDING }).exec(),
            this.orderModel.countDocuments({ status: order_schema_1.OrderStatus.DELIVERED }).exec(),
        ]);
        return {
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            pendingOrders,
            deliveredOrders,
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(2, (0, mongoose_3.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_4.Connection,
        users_service_1.UsersService,
        notifications_service_1.NotificationsService,
        config_1.ConfigService,
        cart_service_1.CartService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map