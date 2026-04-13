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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_schema_1 = require("./product.schema");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_schema_1 = require("../notifications/notification.schema");
let ProductsService = class ProductsService {
    constructor(productModel, notificationsService) {
        this.productModel = productModel;
        this.notificationsService = notificationsService;
    }
    async create(dto) {
        const product = await this.productModel.create(dto);
        if (product.isOnSale && product.salePrice > 0) {
            await this.notificationsService.broadcastSaleNotification({
                productId: String(product._id),
                productName: product.name,
                originalPrice: product.price,
                salePrice: product.salePrice,
            });
        }
        return product;
    }
    async findAll(query) {
        const { search, category, color, purchaseType, onSale, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 12, } = query;
        try {
            const filter = { isActive: true };
            if (search) {
                filter.$text = { $search: search };
            }
            if (category)
                filter.category = { $regex: category, $options: 'i' };
            if (color)
                filter['colors.name'] = { $regex: color, $options: 'i' };
            if (purchaseType)
                filter.purchaseType = purchaseType;
            if (onSale === true || String(onSale) === 'true')
                filter.isOnSale = true;
            if (minPrice !== undefined || maxPrice !== undefined) {
                filter.price = {};
                if (minPrice !== undefined)
                    filter.price.$gte = Number(minPrice);
                if (maxPrice !== undefined)
                    filter.price.$lte = Number(maxPrice);
            }
            const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
            const skipValue = (Number(page) - 1) * Number(limit);
            const limitValue = Number(limit);
            const [products, total] = await Promise.all([
                this.productModel
                    .find(filter)
                    .sort(sort)
                    .skip(skipValue)
                    .limit(limitValue)
                    .exec(),
                this.productModel.countDocuments(filter).exec(),
            ]);
            return {
                products,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / limitValue),
                limit: limitValue,
            };
        }
        catch (error) {
            console.error('Error in findAll:', error);
            throw error;
        }
    }
    async findOne(id) {
        const product = await this.productModel.findById(id).exec();
        if (!product || !product.isActive)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async update(id, dto) {
        const product = await this.productModel.findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true }).exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async delete(id) {
        const product = await this.productModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return { message: 'Product deleted successfully' };
    }
    async applySale(id, dto) {
        const product = await this.productModel.findById(id).exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (dto.salePrice >= product.price) {
            throw new common_1.BadRequestException('Sale price must be less than original price');
        }
        product.isOnSale = true;
        product.salePrice = dto.salePrice;
        if (dto.saleStartDate)
            product.saleStartDate = new Date(dto.saleStartDate);
        if (dto.saleEndDate)
            product.saleEndDate = new Date(dto.saleEndDate);
        await product.save();
        await this.notificationsService.broadcastSaleNotification({
            productId: String(product._id),
            productName: product.name,
            originalPrice: product.price,
            salePrice: product.salePrice,
        });
        return product;
    }
    async removeSale(id) {
        const product = await this.productModel.findByIdAndUpdate(id, { isOnSale: false, salePrice: 0, saleStartDate: null, saleEndDate: null }, { new: true }).exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async addReview(productId, userId, userName, dto) {
        const product = await this.productModel.findById(productId).exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const existingReview = product.reviews.find((r) => r.userId === userId);
        if (existingReview)
            throw new common_1.BadRequestException('You already reviewed this product');
        const review = {
            userId,
            userName,
            rating: dto.rating,
            comment: dto.comment,
            date: new Date(),
        };
        product.reviews.push(review);
        const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
        product.rating = totalRating / product.reviews.length;
        product.reviewCount = product.reviews.length;
        await product.save();
        await this.notificationsService.notifyAdmins('⭐ New Product Review!', `${userName} left a ${dto.rating}-star review on ${product.name}`, notification_schema_1.NotificationType.REVIEW || notification_schema_1.NotificationType.SYSTEM, { productId: product._id, productName: product.name });
        return product;
    }
    async replyToReview(productId, reviewId, dto) {
        const product = await this.productModel.findById(productId).exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const review = product.reviews.find(r => r._id.toString() === reviewId);
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        review.reply = {
            message: dto.message,
            date: new Date(),
        };
        await product.save();
        await this.notificationsService.createUserNotification(review.userId, '💬 Admin replied to your review', `An admin replied to your review on ${product.name}: "${dto.message}"`, notification_schema_1.NotificationType.SYSTEM, { productId: product._id, reviewId });
        return product;
    }
    async getCategories() {
        const categories = await this.productModel.distinct('category', { isActive: true }).exec();
        return categories;
    }
    async updateStock(productId, quantity, session) {
        const product = await this.productModel.findById(productId).session(session).exec();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.stock < quantity) {
            throw new common_1.BadRequestException(`Insufficient stock for "${product.name}"`);
        }
        product.stock -= quantity;
        await product.save({ session });
        return product;
    }
    async getEffectivePrice(product) {
        if (product.isOnSale && product.salePrice > 0) {
            const now = new Date();
            const startOk = !product.saleStartDate || product.saleStartDate <= now;
            const endOk = !product.saleEndDate || product.saleEndDate >= now;
            if (startOk && endOk)
                return product.salePrice;
        }
        return product.price;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        notifications_service_1.NotificationsService])
], ProductsService);
//# sourceMappingURL=products.service.js.map