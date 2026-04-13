import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import {
    CreateProductDto,
    UpdateProductDto,
    ApplySaleDto,
    AddReviewDto,
    ReplyReviewDto,
    ProductQueryDto,
} from './products.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.schema';

@Injectable()
export class ProductsService {
    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        private notificationsService: NotificationsService,
    ) { }

    async create(dto: CreateProductDto): Promise<ProductDocument> {
        const product = await this.productModel.create(dto);

        // If product is created with is on sale = true, notify everyone
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

    async findAll(query: ProductQueryDto) {
        const {
            search,
            category,
            color,
            purchaseType,
            onSale,
            minPrice,
            maxPrice,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 12,
        } = query;

        try {
            const filter: any = { isActive: true };

            if (search) {
                filter.$text = { $search: search };
            }
            if (category) filter.category = { $regex: category, $options: 'i' };
            if (color) filter['colors.name'] = { $regex: color, $options: 'i' };
            if (purchaseType) filter.purchaseType = purchaseType;
            if (onSale === true || String(onSale) === 'true') filter.isOnSale = true;
            if (minPrice !== undefined || maxPrice !== undefined) {
                filter.price = {};
                if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
                if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
            }

            const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
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
        } catch (error) {
            console.error('Error in findAll:', error);
            throw error;
        }
    }

    async findOne(id: string): Promise<ProductDocument> {
        const product = await this.productModel.findById(id).exec();
        if (!product || !product.isActive) throw new NotFoundException('Product not found');
        return product;
    }

    async update(id: string, dto: UpdateProductDto): Promise<ProductDocument> {
        const product = await this.productModel.findByIdAndUpdate(
            id,
            { $set: dto },
            { new: true, runValidators: true },
        ).exec();
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async delete(id: string) {
        const product = await this.productModel.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true },
        ).exec();
        if (!product) throw new NotFoundException('Product not found');
        return { message: 'Product deleted successfully' };
    }

    async applySale(id: string, dto: ApplySaleDto) {
        const product = await this.productModel.findById(id).exec();
        if (!product) throw new NotFoundException('Product not found');

        if (dto.salePrice >= product.price) {
            throw new BadRequestException('Sale price must be less than original price');
        }

        product.isOnSale = true;
        product.salePrice = dto.salePrice;
        if (dto.saleStartDate) product.saleStartDate = new Date(dto.saleStartDate);
        if (dto.saleEndDate) product.saleEndDate = new Date(dto.saleEndDate);
        await product.save();

        // Emit real-time notification
        await this.notificationsService.broadcastSaleNotification({
            productId: String(product._id),
            productName: product.name,
            originalPrice: product.price,
            salePrice: product.salePrice,
        });

        return product;
    }

    async removeSale(id: string) {
        const product = await this.productModel.findByIdAndUpdate(
            id,
            { isOnSale: false, salePrice: 0, saleStartDate: null, saleEndDate: null },
            { new: true },
        ).exec();
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async addReview(productId: string, userId: string, userName: string, dto: AddReviewDto) {
        const product = await this.productModel.findById(productId).exec();
        if (!product) throw new NotFoundException('Product not found');

        const existingReview = product.reviews.find((r) => r.userId === userId);
        if (existingReview) throw new BadRequestException('You already reviewed this product');

        const review = {
            userId,
            userName,
            rating: dto.rating,
            comment: dto.comment,
            date: new Date(),
        };

        product.reviews.push(review as any);

        const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
        product.rating = totalRating / product.reviews.length;
        product.reviewCount = product.reviews.length;
        await product.save();

        // Notify admins about the new review
        await this.notificationsService.notifyAdmins(
            '⭐ New Product Review!',
            `${userName} left a ${dto.rating}-star review on ${product.name}`,
            NotificationType.REVIEW as any || NotificationType.SYSTEM,
            { productId: product._id, productName: product.name }
        );

        return product;
    }

    async replyToReview(productId: string, reviewId: string, dto: ReplyReviewDto) {
        const product = await this.productModel.findById(productId).exec();
        if (!product) throw new NotFoundException('Product not found');

        const review = (product.reviews as any[]).find(r => r._id.toString() === reviewId);
        if (!review) throw new NotFoundException('Review not found');

        review.reply = {
            message: dto.message,
            date: new Date(),
        };

        await product.save();

        // Notify the user who left the review
        await this.notificationsService.createUserNotification(
            review.userId,
            '💬 Admin replied to your review',
            `An admin replied to your review on ${product.name}: "${dto.message}"`,
            NotificationType.SYSTEM,
            { productId: product._id, reviewId }
        );

        return product;
    }

    async getCategories() {
        const categories = await this.productModel.distinct('category', { isActive: true }).exec();
        return categories;
    }

    async updateStock(productId: string, quantity: number, session?: any) {
        const product = await this.productModel.findById(productId).session(session).exec();
        if (!product) throw new NotFoundException('Product not found');
        if (product.stock < quantity) {
            throw new BadRequestException(`Insufficient stock for "${product.name}"`);
        }
        product.stock -= quantity;
        await product.save({ session });
        return product;
    }

    async getEffectivePrice(product: ProductDocument): Promise<number> {
        if (product.isOnSale && product.salePrice > 0) {
            const now = new Date();
            const startOk = !product.saleStartDate || product.saleStartDate <= now;
            const endOk = !product.saleEndDate || product.saleEndDate >= now;
            if (startOk && endOk) return product.salePrice;
        }
        return product.price;
    }
}