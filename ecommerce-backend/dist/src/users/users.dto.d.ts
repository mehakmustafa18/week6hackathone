import { UserRole } from './user.schema';
export declare class UpdateProfileDto {
    name?: string;
    phone?: string;
    avatar?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        zip: string;
    };
}
export declare class UpdateAddressDto {
    street: string;
    city: string;
    state: string;
    country: string;
    zip: string;
}
export declare class AdminUpdateUserDto {
    role?: UserRole;
    isActive?: boolean;
}
