import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare enum UserRole {
    USER = "user",
    ADMIN = "admin",
    SUPER_ADMIN = "super_admin"
}
export declare class User {
    name: string;
    email: string;
    googleId?: string;
    githubId?: string;
    discordId?: string;
    password?: string;
    role: UserRole;
    loyaltyPoints: number;
    isActive: boolean;
    avatar?: string;
    phone?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        zip: string;
    };
    notificationTokens: string[];
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
