import { Model } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { CreateProductDto, UpdateProductDto, ApplySaleDto, AddReviewDto, ReplyReviewDto, ProductQueryDto } from './products.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ProductsService {
    private productModel;
    private notificationsService;
    constructor(productModel: Model<ProductDocument>, notificationsService: NotificationsService);
    create(dto: CreateProductDto): Promise<ProductDocument>;
    findAll(query: ProductQueryDto): Promise<{
        products: (import("mongoose").Document<unknown, {}, ProductDocument, {}, {}> & Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
        limit: number;
    }>;
    findOne(id: string): Promise<ProductDocument>;
    update(id: string, dto: UpdateProductDto): Promise<ProductDocument>;
    delete(id: string): Promise<{
        message: string;
    }>;
    applySale(id: string, dto: ApplySaleDto): Promise<import("mongoose").Document<unknown, {}, ProductDocument, {}, {}> & Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    removeSale(id: string): Promise<import("mongoose").Document<unknown, {}, ProductDocument, {}, {}> & Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    addReview(productId: string, userId: string, userName: string, dto: AddReviewDto): Promise<import("mongoose").Document<unknown, {}, ProductDocument, {}, {}> & Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    replyToReview(productId: string, reviewId: string, dto: ReplyReviewDto): Promise<import("mongoose").Document<unknown, {}, ProductDocument, {}, {}> & Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getCategories(): Promise<string[]>;
    updateStock(productId: string, quantity: number, session?: any): Promise<import("mongoose").Document<unknown, {}, ProductDocument, {}, {}> & Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getEffectivePrice(product: ProductDocument): Promise<number>;
}
