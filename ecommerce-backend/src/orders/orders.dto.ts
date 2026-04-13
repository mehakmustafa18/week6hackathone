import {
    IsString,
    IsEnum,
    IsOptional,
    IsObject,
    ValidateNested,
    IsArray,
    IsNumber,
    IsBoolean,
    Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethod, OrderStatus } from './order.schema';

export class ShippingAddressDto {
    @ApiProperty() @IsString() name: string;
    @ApiProperty() @IsString() phone: string;
    @ApiProperty() @IsString() street: string;
    @ApiProperty() @IsString() city: string;
    @ApiProperty() @IsString() state: string;
    @ApiProperty() @IsString() country: string;
    @ApiProperty() @IsString() zip: string;
}

export class OrderItemDto {
    @ApiProperty() @IsString() productId: string;
    @ApiProperty() @IsNumber() @Min(1) @Type(() => Number) quantity: number;
    @ApiProperty({ required: false }) @IsOptional() @IsBoolean() usePoints?: boolean;
}

export class CreateOrderDto {
    @ApiProperty({ type: [OrderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @ApiProperty({ type: ShippingAddressDto })
    @ValidateNested()
    @Type(() => ShippingAddressDto)
    shippingAddress: ShippingAddressDto;

    @ApiProperty({ enum: PaymentMethod })
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateOrderStatusDto {
    @ApiProperty({ enum: OrderStatus })
    @IsEnum(OrderStatus)
    status: OrderStatus;
}