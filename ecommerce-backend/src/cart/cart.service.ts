import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './cart.schema';
import { Product, ProductDocument } from '../products/product.schema';
import { PurchaseType } from '../products/product.schema';
import { User, UserDocument } from '../users/user.schema';
import { AddToCartDto, UpdateCartItemDto } from './cart.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
    constructor(
        @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private productsService: ProductsService,
    ) { }

    async getCart(userId: string) {
        let cart = await this.cartModel
            .findOne({ user: new Types.ObjectId(userId) })
            .populate('items.product');

        if (!cart) {
            cart = await this.cartModel.create({ user: new Types.ObjectId(userId), items: [] });
        }
        return cart;
    }

    async addItem(userId: string, dto: AddToCartDto) {
        const product = await this.productModel.findById(dto.productId);
        if (!product || !product.isActive) throw new NotFoundException('Product not found');
        if (product.stock < dto.quantity) {
            throw new BadRequestException(`Only ${product.stock} items left in stock`);
        }

        // Validate purchase type
        const isPointsOnly = product.purchaseType === PurchaseType.POINTS;
        const isHybrid = product.purchaseType === PurchaseType.HYBRID;

        if (isPointsOnly && !dto.usePoints) {
            throw new BadRequestException('This product can only be purchased with loyalty points');
        }

        if (dto.usePoints) {
            if (!product.pointsPrice || product.pointsPrice <= 0) {
                throw new BadRequestException('This product does not have a points price');
            }
            
            // Check if user has enough points
            const user = await this.userModel.findById(userId).exec();
            if (!user) throw new NotFoundException('User not found');

            const totalPointsNeeded = product.pointsPrice * dto.quantity;
            if (user.loyaltyPoints < totalPointsNeeded) {
                throw new BadRequestException(`Insufficient loyalty points. You need ${totalPointsNeeded} pts, but you have ${user.loyaltyPoints} pts.`);
            }
        }

        if (!isPointsOnly && !isHybrid && dto.usePoints) {
            throw new BadRequestException('This product cannot be purchased with loyalty points');
        }

        const effectivePrice = await this.productsService.getEffectivePrice(product);

        let cart = await this.cartModel.findOne({ user: new Types.ObjectId(userId) });
        if (!cart) {
            cart = new this.cartModel({ user: new Types.ObjectId(userId), items: [] });
        }

        const existingIndex = cart.items.findIndex(
            (item) => item.product.toString() === dto.productId,
        );

        if (existingIndex >= 0) {
            cart.items[existingIndex].quantity += dto.quantity;
            if (dto.usePoints !== undefined) {
                cart.items[existingIndex].usePoints = dto.usePoints;
            }
        } else {
            cart.items.push({
                product: new Types.ObjectId(dto.productId),
                quantity: dto.quantity,
                priceAtTime: effectivePrice,
                usePoints: dto.usePoints || false,
                pointsPriceAtTime: product.pointsPrice || 0,
            });
        }

        await this.recalculate(cart);
        await cart.save();
        return cart.populate('items.product');
    }

    async updateItem(userId: string, productId: string, dto: UpdateCartItemDto) {
        const cart = await this.cartModel.findOne({ user: new Types.ObjectId(userId) });
        if (!cart) throw new NotFoundException('Cart not found');

        const idx = cart.items.findIndex((i) => i.product.toString() === productId);
        if (idx === -1) throw new NotFoundException('Item not in cart');

        if (dto.quantity === 0) {
            cart.items.splice(idx, 1);
        } else {
            const product = await this.productModel.findById(productId);
            if (product && product.stock < dto.quantity) {
                throw new BadRequestException(`Only ${product.stock} items available`);
            }
            cart.items[idx].quantity = dto.quantity;
            if (dto.usePoints !== undefined) {
                cart.items[idx].usePoints = dto.usePoints;
            }
        }

        await this.recalculate(cart);
        await cart.save();
        return cart.populate('items.product');
    }

    async removeItem(userId: string, productId: string) {
        const cart = await this.cartModel.findOne({ user: new Types.ObjectId(userId) });
        if (!cart) throw new NotFoundException('Cart not found');

        cart.items = cart.items.filter((i) => i.product.toString() !== productId);
        await this.recalculate(cart);
        await cart.save();
        return cart.populate('items.product');
    }

    async clearCart(userId: string, session?: any) {
        console.log(`[CartService] --- CLEARING CART FOR USER: ${userId} ---`);
        const result = await this.cartModel.findOneAndUpdate(
            { user: new Types.ObjectId(userId) },
            { 
                $set: { 
                    items: [], 
                    totalAmount: 0, 
                    totalPoints: 0 
                } 
            },
            { new: true, session }
        ).exec();
        
        if (!result) {
            console.log(`[CartService] No cart found to clear for user: ${userId}`);
        } else {
            console.log(`[CartService] Cart successfully cleared for user: ${userId}`);
        }
        
        return { message: 'Cart cleared', success: !!result };
    }

    private async recalculate(cart: CartDocument) {
        let totalAmount = 0;
        let totalPoints = 0;

        for (const item of cart.items) {
            if (item.usePoints) {
                totalPoints += item.pointsPriceAtTime * item.quantity;
            } else {
                totalAmount += item.priceAtTime * item.quantity;
            }
        }

        cart.totalAmount = Math.round(totalAmount * 100) / 100;
        cart.totalPoints = totalPoints;
    }
}