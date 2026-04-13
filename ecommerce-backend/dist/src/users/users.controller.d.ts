import { UsersService } from './users.service';
import { UpdateProfileDto, AdminUpdateUserDto } from './users.dto';
import { UserRole } from './user.schema';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: any): any;
    updateProfile(userId: any, dto: UpdateProfileDto): Promise<import("mongoose").Document<unknown, {}, import("./user.schema").UserDocument, {}, {}> & import("./user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getLoyaltyPoints(userId: any): Promise<{
        loyaltyPoints: number;
        userId: import("mongoose").Types.ObjectId;
        name: string;
    }>;
    findAll(page: number, limit: number, role?: UserRole): Promise<{
        users: (import("mongoose").Document<unknown, {}, import("./user.schema").UserDocument, {}, {}> & import("./user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getStats(): Promise<{
        total: number;
        admins: number;
        activeUsers: number;
    }>;
    findOne(id: string): Promise<import("./user.schema").UserDocument>;
    adminUpdate(adminId: any, adminRole: any, targetId: string, dto: AdminUpdateUserDto): Promise<import("mongoose").Document<unknown, {}, import("./user.schema").UserDocument, {}, {}> & import("./user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
