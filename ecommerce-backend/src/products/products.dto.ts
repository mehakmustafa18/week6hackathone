import {
    IsString,
    IsNumber,
    IsOptional,
    IsEnum,
    IsBoolean,
    IsArray,
    Min,
    IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PurchaseType } from './product.schema';
import { Type } from 'class-transformer';

import { ValidateNested } from 'class-validator';

export class ColorVariantDto {
    @IsString()
    name: string;

    @IsString()
    hex: string;

    @IsString()
    imageUrl: string;
}

export class CreateProductDto {
    @ApiProperty({ example: 'Nike Air Max 270' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'Premium running shoes with Air Max cushioning' })
    @IsString()
    description: string;

    @ApiProperty({ example: 129.99 })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    price: number;

    @ApiProperty({ example: 50 })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    stock: number;

    @ApiProperty({ example: 'Footwear' })
    @IsString()
    category: string;

    @ApiProperty({ example: ['https://example.com/image1.jpg'], required: false })
    @IsOptional()
    @IsArray()
    images?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ColorVariantDto)
    colors?: ColorVariantDto[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsArray()
    sizes?: string[];

    @ApiProperty({ enum: PurchaseType, required: false })
    @IsOptional()
    @IsEnum(PurchaseType)
    purchaseType?: PurchaseType;

    @ApiProperty({ example: 500, required: false, description: 'Points price for points/hybrid products' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    pointsPrice?: number;

    @ApiProperty({ example: 10, required: false, description: 'Points earned when buying this product' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    pointsEarned?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isOnSale?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    salePrice?: number;

    @ApiProperty({ enum: ['none', 'new-arrivals', 'top-selling'], required: false })
    @IsOptional()
    @IsString()
    displaySection?: string;
}

export class UpdateProductDto {
    @IsOptional() @IsString() name?: string;
    @IsOptional() @IsString() description?: string;
    @IsOptional() @IsNumber() @Min(0) @Type(() => Number) price?: number;
    @IsOptional() @IsNumber() @Min(0) @Type(() => Number) stock?: number;
    @IsOptional() @IsString() category?: string;
    @IsOptional() @IsArray() images?: string[];
    @IsOptional() @IsArray() colors?: { name: string; hex: string; imageUrl: string }[];
    @IsOptional() @IsArray() sizes?: string[];
    @IsOptional() @IsEnum(PurchaseType) purchaseType?: PurchaseType;
    @IsOptional() @IsNumber() @Min(0) @Type(() => Number) pointsPrice?: number;
    @IsOptional() @IsNumber() @Min(0) @Type(() => Number) pointsEarned?: number;
    @IsOptional() @IsBoolean() isActive?: boolean;
    @IsOptional() @IsString() displaySection?: string;
}

export class ApplySaleDto {
    @ApiProperty({ example: 89.99, description: 'Discounted sale price' })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    salePrice: number;

    @ApiProperty({ required: false, example: '2025-06-01T00:00:00Z' })
    @IsOptional()
    @IsDateString()
    saleStartDate?: string;

    @ApiProperty({ required: false, example: '2025-06-30T23:59:59Z' })
    @IsOptional()
    @IsDateString()
    saleEndDate?: string;
}

export class AddReviewDto {
    @ApiProperty({ example: 4, description: 'Rating from 1 to 5' })
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    rating: number;

    @ApiProperty({ example: 'Great product!' })
    @IsString()
    comment: string;
}

export class ReplyReviewDto {
    @ApiProperty({ example: 'Thank you for your review!' })
    @IsString()
    message: string;
}

export class ProductQueryDto {
    @IsOptional() @IsString() search?: string;
    @IsOptional() @IsString() category?: string;
    @IsOptional() @IsString() color?: string;
    @IsOptional() @IsEnum(PurchaseType) purchaseType?: PurchaseType;
    @IsOptional() @IsBoolean() onSale?: boolean;
    @IsOptional() @IsNumber() @Min(0) @Type(() => Number) minPrice?: number;
    @IsOptional() @IsNumber() @Min(0) @Type(() => Number) maxPrice?: number;
    @IsOptional() @IsString() sortBy?: string;
    @IsOptional() @IsString() sortOrder?: 'asc' | 'desc';
    @IsOptional() @Type(() => Number) page?: number;
    @IsOptional() @Type(() => Number) limit?: number;
}