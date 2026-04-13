import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole } from './user.schema';
import { UpdateProfileDto, AdminUpdateUserDto } from './users.dto';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    findById(id: string): Promise<UserDocument>;
    findAll(page?: number, limit?: number, role?: UserRole): Promise<{
        users: (import("mongoose").Document<unknown, {}, UserDocument, {}, {}> & User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<import("mongoose").Document<unknown, {}, UserDocument, {}, {}> & User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getLoyaltyPoints(userId: string): Promise<{
        loyaltyPoints: number;
        userId: Types.ObjectId;
        name: string;
    }>;
    addLoyaltyPoints(userId: string, points: number, session?: any): Promise<import("mongoose").Document<unknown, {}, UserDocument, {}, {}> & User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deductLoyaltyPoints(userId: string, points: number, session?: any): Promise<import("mongoose").Document<unknown, {}, UserDocument, {}, {}> & User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    adminUpdateUser(adminId: string, targetUserId: string, dto: AdminUpdateUserDto, adminRole: UserRole): Promise<import("mongoose").Document<unknown, {}, UserDocument, {}, {}> & User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getUserStats(): Promise<{
        total: number;
        admins: number;
        activeUsers: number;
    }>;
}
