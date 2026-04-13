import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ApplySaleDto, AddReviewDto, ReplyReviewDto, ProductQueryDto } from './products.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(query: ProductQueryDto): Promise<{
        products: (import("mongoose").Document<unknown, {}, import("./product.schema").ProductDocument, {}, {}> & import("./product.schema").Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
        limit: number;
    }>;
    getCategories(): Promise<string[]>;
    findOne(id: string): Promise<import("./product.schema").ProductDocument>;
    create(dto: CreateProductDto): Promise<import("./product.schema").ProductDocument>;
    update(id: string, dto: UpdateProductDto): Promise<import("./product.schema").ProductDocument>;
    delete(id: string): Promise<{
        message: string;
    }>;
    applySale(id: string, dto: ApplySaleDto): Promise<import("mongoose").Document<unknown, {}, import("./product.schema").ProductDocument, {}, {}> & import("./product.schema").Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    removeSale(id: string): Promise<import("mongoose").Document<unknown, {}, import("./product.schema").ProductDocument, {}, {}> & import("./product.schema").Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    addReview(id: string, userId: string, userName: string, dto: AddReviewDto): Promise<import("mongoose").Document<unknown, {}, import("./product.schema").ProductDocument, {}, {}> & import("./product.schema").Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    replyToReview(id: string, reviewId: string, dto: ReplyReviewDto): Promise<import("mongoose").Document<unknown, {}, import("./product.schema").ProductDocument, {}, {}> & import("./product.schema").Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
