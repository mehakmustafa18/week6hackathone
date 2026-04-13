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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const cart_schema_1 = require("./cart.schema");
const product_schema_1 = require("../products/product.schema");
const product_schema_2 = require("../products/product.schema");
const user_schema_1 = require("../users/user.schema");
const products_service_1 = require("../products/products.service");
let CartService = class CartService {
    constructor(cartModel, productModel, userModel, productsService) {
        this.cartModel = cartModel;
        this.productModel = productModel;
        this.userModel = userModel;
        this.productsService = productsService;
    }
    async getCart(userId) {
        let cart = await this.cartModel
            .findOne({ user: new mongoose_2.Types.ObjectId(userId) })
            .populate('items.product');
        if (!cart) {
            cart = await this.cartModel.create({ user: new mongoose_2.Types.ObjectId(userId), items: [] });
        }
        return cart;
    }
    async addItem(userId, dto) {
        const product = await this.productModel.findById(dto.productId);
        if (!product || !product.isActive)
            throw new common_1.NotFoundException('Product not found');
        if (product.stock < dto.quantity) {
            throw new common_1.BadRequestException(`Only ${product.stock} items left in stock`);
        }
        const isPointsOnly = product.purchaseType === product_schema_2.PurchaseType.POINTS;
        const isHybrid = product.purchaseType === product_schema_2.PurchaseType.HYBRID;
        if (isPointsOnly && !dto.usePoints) {
            throw new common_1.BadRequestException('This product can only be purchased with loyalty points');
        }
        if (dto.usePoints) {
            if (!product.pointsPrice || product.pointsPrice <= 0) {
                throw new common_1.BadRequestException('This product does not have a points price');
            }
            const user = await this.userModel.findById(userId).exec();
            if (!user)
                throw new common_1.NotFoundException('User not found');
            const totalPointsNeeded = product.pointsPrice * dto.quantity;
            if (user.loyaltyPoints < totalPointsNeeded) {
                throw new common_1.BadRequestException(`Insufficient loyalty points. You need ${totalPointsNeeded} pts, but you have ${user.loyaltyPoints} pts.`);
            }
        }
        if (!isPointsOnly && !isHybrid && dto.usePoints) {
            throw new common_1.BadRequestException('This product cannot be purchased with loyalty points');
        }
        const effectivePrice = await this.productsService.getEffectivePrice(product);
        let cart = await this.cartModel.findOne({ user: new mongoose_2.Types.ObjectId(userId) });
        if (!cart) {
            cart = new this.cartModel({ user: new mongoose_2.Types.ObjectId(userId), items: [] });
        }
        const existingIndex = cart.items.findIndex((item) => item.product.toString() === dto.productId);
        if (existingIndex >= 0) {
            cart.items[existingIndex].quantity += dto.quantity;
            if (dto.usePoints !== undefined) {
                cart.items[existingIndex].usePoints = dto.usePoints;
            }
        }
        else {
            cart.items.push({
                product: new mongoose_2.Types.ObjectId(dto.productId),
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
    async updateItem(userId, productId, dto) {
        const cart = await this.cartModel.findOne({ user: new mongoose_2.Types.ObjectId(userId) });
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        const idx = cart.items.findIndex((i) => i.product.toString() === productId);
        if (idx === -1)
            throw new common_1.NotFoundException('Item not in cart');
        if (dto.quantity === 0) {
            cart.items.splice(idx, 1);
        }
        else {
            const product = await this.productModel.findById(productId);
            if (product && product.stock < dto.quantity) {
                throw new common_1.BadRequestException(`Only ${product.stock} items available`);
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
    async removeItem(userId, productId) {
        const cart = await this.cartModel.findOne({ user: new mongoose_2.Types.ObjectId(userId) });
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        cart.items = cart.items.filter((i) => i.product.toString() !== productId);
        await this.recalculate(cart);
        await cart.save();
        return cart.populate('items.product');
    }
    async clearCart(userId, session) {
        console.log(`[CartService] --- CLEARING CART FOR USER: ${userId} ---`);
        const result = await this.cartModel.findOneAndUpdate({ user: new mongoose_2.Types.ObjectId(userId) }, {
            $set: {
                items: [],
                totalAmount: 0,
                totalPoints: 0
            }
        }, { new: true, session }).exec();
        if (!result) {
            console.log(`[CartService] No cart found to clear for user: ${userId}`);
        }
        else {
            console.log(`[CartService] Cart successfully cleared for user: ${userId}`);
        }
        return { message: 'Cart cleared', success: !!result };
    }
    async recalculate(cart) {
        let totalAmount = 0;
        let totalPoints = 0;
        for (const item of cart.items) {
            if (item.usePoints) {
                totalPoints += item.pointsPriceAtTime * item.quantity;
            }
            else {
                totalAmount += item.priceAtTime * item.quantity;
            }
        }
        cart.totalAmount = Math.round(totalAmount * 100) / 100;
        cart.totalPoints = totalPoints;
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(cart_schema_1.Cart.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        products_service_1.ProductsService])
], CartService);
//# sourceMappingURL=cart.service.js.map