import { PurchaseType } from './product.schema';
export declare class ColorVariantDto {
    name: string;
    hex: string;
    imageUrl: string;
}
export declare class CreateProductDto {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    images?: string[];
    colors?: ColorVariantDto[];
    sizes?: string[];
    purchaseType?: PurchaseType;
    pointsPrice?: number;
    pointsEarned?: number;
    isOnSale?: boolean;
    salePrice?: number;
    displaySection?: string;
}
export declare class UpdateProductDto {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    category?: string;
    images?: string[];
    colors?: {
        name: string;
        hex: string;
        imageUrl: string;
    }[];
    sizes?: string[];
    purchaseType?: PurchaseType;
    pointsPrice?: number;
    pointsEarned?: number;
    isActive?: boolean;
    displaySection?: string;
}
export declare class ApplySaleDto {
    salePrice: number;
    saleStartDate?: string;
    saleEndDate?: string;
}
export declare class AddReviewDto {
    rating: number;
    comment: string;
}
export declare class ReplyReviewDto {
    message: string;
}
export declare class ProductQueryDto {
    search?: string;
    category?: string;
    color?: string;
    purchaseType?: PurchaseType;
    onSale?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}
