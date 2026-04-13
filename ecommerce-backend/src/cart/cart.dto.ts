import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddToCartDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011' })
    @IsString()
    productId: string;

    @ApiProperty({ example: 2 })
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    quantity: number;

    @ApiProperty({ required: false, description: 'Pay with loyalty points (for points/hybrid products)' })
    @IsOptional()
    @IsBoolean()
    usePoints?: boolean;
}

export class UpdateCartItemDto {
    @ApiProperty({ example: 3 })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    quantity: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    usePoints?: boolean;
}