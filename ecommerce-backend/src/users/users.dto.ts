import { IsString, IsOptional, IsEmail, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from './user.schema';

export class UpdateProfileDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    avatar?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsObject()
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        zip: string;
    };
}

export class UpdateAddressDto {
    @ApiProperty()
    @IsString()
    street: string;

    @ApiProperty()
    @IsString()
    city: string;

    @ApiProperty()
    @IsString()
    state: string;

    @ApiProperty()
    @IsString()
    country: string;

    @ApiProperty()
    @IsString()
    zip: string;
}

export class AdminUpdateUserDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiProperty({ required: false })
    @IsOptional()
    isActive?: boolean;
}