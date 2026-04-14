import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Order, OrderDocument, OrderStatus, PaymentMethod, PaymentStatus } from './order.schema';
import { Product, ProductDocument } from '../products/product.schema';
import { PurchaseType } from '../products/product.schema';
import { CreateOrderDto, UpdateOrderStatusDto } from './orders.dto';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.schema';
import { ConfigService } from '@nestjs/config';
import { CartService } from '../cart/cart.service';
import { StripeService } from './stripe.service';

@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectConnection() private connection: Connection,
        private usersService: UsersService,
        private notificationsService: NotificationsService,
        private configService: ConfigService,
        private cartService: CartService,
        private stripeService: StripeService,
    ) { }

    async createOrder(userId: string, dto: CreateOrderDto): Promise<OrderDocument> {
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
                    throw new NotFoundException(`Product ${item.productId} not found`);
                }
                if (product.stock < item.quantity) {
                    throw new BadRequestException(
                        `Insufficient stock for "${product.name}". Available: ${product.stock}`,
                    );
                }

                const usePoints = item.usePoints || false;
                const isPointsOnly = product.purchaseType === PurchaseType.POINTS;
                const isHybrid = product.purchaseType === PurchaseType.HYBRID;

                // Validate purchase type
                if (isPointsOnly && !usePoints) {
                    throw new BadRequestException(
                        `"${product.name}" can only be purchased with loyalty points`,
                    );
                }
                if (!isHybrid && !isPointsOnly && usePoints) {
                    throw new BadRequestException(
                        `"${product.name}" cannot be purchased with loyalty points`,
                    );
                }

                let itemPrice = 0;
                let itemPointsUsed = 0;
                let itemPointsEarned = 0;

                if (usePoints) {
                    if (!product.pointsPrice) {
                        throw new BadRequestException(`"${product.name}" has no points price set`);
                    }
                    itemPointsUsed = product.pointsPrice * item.quantity;
                    totalPointsUsed += itemPointsUsed;
                } else {
                    // Apply sale price if active
                    const now = new Date();
                    let effectivePrice = product.price;
                    if (
                        product.isOnSale &&
                        product.salePrice > 0 &&
                        (!product.saleStartDate || product.saleStartDate <= now) &&
                        (!product.saleEndDate || product.saleEndDate >= now)
                    ) {
                        totalDiscount += (product.price - product.salePrice) * item.quantity;
                        effectivePrice = product.salePrice;
                    }
                    itemPrice = effectivePrice * item.quantity;
                    totalAmount += itemPrice;

                    // Calculate points earned on money purchase
                    const pointsRate = this.configService.get<number>('POINTS_PER_DOLLAR', 10);
                    itemPointsEarned = Math.floor(effectivePrice * item.quantity * pointsRate);
                    totalPointsEarned += itemPointsEarned;
                }

                orderItems.push({
                    product: new Types.ObjectId(item.productId),
                    productName: product.name,
                    productImage: product.images?.[0] || '',
                    quantity: item.quantity,
                    price: itemPrice / (item.quantity || 1),
                    paidWithPoints: usePoints,
                    pointsUsed: itemPointsUsed,
                    pointsEarned: itemPointsEarned,
                } as any);

                // Deduct stock
                product.stock -= item.quantity;
                await product.save({ session });
            }

            // Handle loyalty points deduction
            if (totalPointsUsed > 0) {
                await this.usersService.deductLoyaltyPoints(userId, totalPointsUsed, session);
            }

            // Create order
            const [order] = await this.orderModel.create(
                [
                    {
                        user: new Types.ObjectId(userId),
                        items: orderItems,
                        totalAmount: Math.round(totalAmount * 100) / 100,
                        totalPointsUsed,
                        totalPointsEarned,
                        discount: Math.round(totalDiscount * 100) / 100,
                        paymentMethod: dto.paymentMethod,
                        paymentStatus:
                            dto.paymentMethod === PaymentMethod.STRIPE && totalAmount > 0
                                ? PaymentStatus.PENDING
                                : dto.paymentMethod === PaymentMethod.CASH && totalAmount > 0
                                ? PaymentStatus.PENDING
                                : PaymentStatus.PAID,
                        status: (dto.paymentMethod === PaymentMethod.STRIPE || dto.paymentMethod === PaymentMethod.CASH) && totalAmount > 0 
                            ? OrderStatus.PENDING 
                            : OrderStatus.CONFIRMED,
                        shippingAddress: dto.shippingAddress,
                        notes: dto.notes,
                    },
                ],
                { session },
            );

            // If Stripe and total > 0, create checkout session and return it
            if (dto.paymentMethod === PaymentMethod.STRIPE && totalAmount > 0) {
                const user = await this.usersService.findById(userId);
                const stripeSession = await this.stripeService.createCheckoutSession(order, user.email);
                
                order.stripeSessionId = stripeSession.id;
                await order.save({ session });

                await session.commitTransaction();
                session.endSession();

                // Clear cart immediately since order is created
                await this.cartService.clearCart(userId);

                return { ...order.toObject(), checkoutUrl: stripeSession.url } as any;
            }

            // Award loyalty points earned (Only for non-stripe payments)
            if (totalPointsEarned > 0) {
                await this.usersService.addLoyaltyPoints(userId, totalPointsEarned, session);
            }

            // Clear user's cart as part of the transaction
            console.log(`[OrdersService] Attempting to clear cart for user: ${userId} within transaction`);
            await this.cartService.clearCart(userId, session);

            await session.commitTransaction();
            console.log('[OrdersService] Transaction committed successfully');

            // Send notification to the buyer
            console.log(`[OrdersService] Sending notification to buyer: ${userId}`);
            await this.notificationsService.createUserNotification(
                userId,
                '✅ Order Confirmed!',
                `Your order #${order.orderNumber} has been confirmed. You earned ${totalPointsEarned} loyalty points!`,
                NotificationType.ORDER,
                { orderId: order._id, orderNumber: order.orderNumber },
            );

            // Notify admins about the new order
            console.log('[OrdersService] Notifying admins about new order');
            await this.notificationsService.notifyAdmins(
                '🛍️ New Order Received!',
                `A new order #${order.orderNumber} has been placed for $${order.totalAmount}.`,
                NotificationType.ORDER,
                { orderId: order._id, userId },
            );

            if (totalPointsEarned > 0) {
                await this.notificationsService.createUserNotification(
                    userId,
                    '🌟 Loyalty Points Earned!',
                    `You earned ${totalPointsEarned} loyalty points from your recent purchase!`,
                    NotificationType.POINTS,
                    { pointsEarned: totalPointsEarned },
                );
            }

            return order;
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    }

    async getUserOrders(userId: string, page = 1, limit = 10) {
        console.log(`[OrdersService] Fetching orders for user: ${userId}`);
        const [orders, total] = await Promise.all([
            this.orderModel
                .find({ user: new Types.ObjectId(userId) })
                .populate('items.product', 'name images price')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .exec(),
            this.orderModel.countDocuments({ user: new Types.ObjectId(userId) }).exec(),
        ]);

        return { orders, total, page, totalPages: Math.ceil(total / limit) };
    }

    async getOrderById(orderId: string, userId: string, userRole: string) {
        const order = await this.orderModel
            .findById(orderId)
            .populate('items.product', 'name images price category')
            .populate('user', 'name email')
            .exec();

        if (!order) throw new NotFoundException('Order not found');

        // Extract the owner ID safely whether populated or not
        const orderOwnerId = (order.user as any)?._id || order.user;
        
        console.log(`[OrdersService] Checking access for order: ${orderId}`);
        console.log(`[OrdersService] Order Owner: ${orderOwnerId}`);
        console.log(`[OrdersService] Requesting User: ${userId}`);

        const isOwner = orderOwnerId.toString() === userId.toString();
        const isAdmin = ['admin', 'super_admin'].includes(userRole?.toLowerCase());

        if (!isOwner && !isAdmin) {
            console.warn(`[OrdersService] Access DENIED for user ${userId} to order ${orderId}`);
            throw new ForbiddenException('You cannot access this order');
        }

        return order;
    }

    async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto) {
        const order = await this.orderModel.findByIdAndUpdate(
            orderId,
            { status: dto.status },
            { new: true },
        ).exec();
        if (!order) throw new NotFoundException('Order not found');

        await this.notificationsService.createUserNotification(
            order.user.toString(),
            `📦 Order ${dto.status.charAt(0).toUpperCase() + dto.status.slice(1)}`,
            `Your order #${order.orderNumber} status has been updated to ${dto.status}.`,
            NotificationType.ORDER,
            { orderId: order._id, status: dto.status },
        );

        return order;
    }

    async getAllOrders(page = 1, limit = 20, status?: OrderStatus) {
        console.log(`[OrdersService] Fetching all orders (Admin). Page: ${page}, Limit: ${limit}, Status: ${status || 'all'}`);
        const filter: any = {};
        if (status) filter.status = status;

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
                { $match: { status: { $ne: OrderStatus.CANCELLED } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ]).exec(),
            this.orderModel.countDocuments({ status: OrderStatus.PENDING }).exec(),
            this.orderModel.countDocuments({ status: OrderStatus.DELIVERED }).exec(),
        ]);

        return {
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            pendingOrders,
            deliveredOrders,
        };
    }

    async finalizeStripeOrder(sessionId: string, paymentIntentId: string) {
        const order = await this.orderModel.findOne({ stripeSessionId: sessionId });
        if (!order) throw new NotFoundException('Order not found for session');

        if (order.paymentStatus === PaymentStatus.PAID) return order;

        order.paymentStatus = PaymentStatus.PAID;
        order.status = OrderStatus.CONFIRMED;
        order.stripePaymentIntentId = paymentIntentId;
        await order.save();

        // Award loyalty points
        if (order.totalPointsEarned > 0) {
            const updatedUser = await this.usersService.addLoyaltyPoints(order.user.toString(), order.totalPointsEarned);
            console.log(`[OrdersService] Points awarded to user ${order.user.toString()}. New balance: ${updatedUser.loyaltyPoints}`);
            
            await this.notificationsService.createUserNotification(
                order.user.toString(),
                '🌟 Loyalty Points Earned!',
                `You earned ${order.totalPointsEarned} loyalty points from your recent purchase!`,
                NotificationType.POINTS,
                { pointsEarned: order.totalPointsEarned },
            );
        }

        // Send confirmation notification
        await this.notificationsService.createUserNotification(
            order.user.toString(),
            '✅ Payment Successful!',
            `Your payment for order #${order.orderNumber} was successful. Your order is now being processed.`,
            NotificationType.ORDER,
            { orderId: order._id, orderNumber: order.orderNumber },
        );

        // Notify admins
        await this.notificationsService.notifyAdmins(
            '💰 New Stripe Payment!',
            `Order #${order.orderNumber} has been paid via Stripe ($${order.totalAmount}).`,
            NotificationType.ORDER,
            { orderId: order._id },
        );

        return order;
    }

    async failStripeOrder(sessionId: string) {
        const order = await this.orderModel.findOne({ stripeSessionId: sessionId });
        if (!order || order.paymentStatus === PaymentStatus.PAID) return;

        order.paymentStatus = PaymentStatus.FAILED;
        order.status = OrderStatus.CANCELLED;
        await order.save();

        // Restore stock
        for (const item of order.items) {
            await this.productModel.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        // Return loyalty points used
        if (order.totalPointsUsed > 0) {
            await this.usersService.addLoyaltyPoints(order.user.toString(), order.totalPointsUsed);
        }

        await this.notificationsService.createUserNotification(
            order.user.toString(),
            '❌ Payment Failed',
            `Your payment for order #${order.orderNumber} failed or was cancelled. Your items have been returned to stock.`,
            NotificationType.ORDER,
            { orderId: order._id },
        );
    }
}