import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole } from './user.schema';
import { UpdateProfileDto, AdminUpdateUserDto } from './users.dto';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async findById(id: string): Promise<UserDocument> {
        const user = await this.userModel.findById(id).select('-password');
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async findAll(page = 1, limit = 20, role?: UserRole) {
        const query: any = {};
        if (role) query.role = role;

        const [users, total] = await Promise.all([
            this.userModel
                .find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            this.userModel.countDocuments(query),
        ]);

        return {
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const user = await this.userModel
            .findByIdAndUpdate(userId, { $set: dto }, { new: true, runValidators: true })
            .select('-password');
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async getLoyaltyPoints(userId: string) {
        const user = await this.findById(userId);
        return {
            loyaltyPoints: user.loyaltyPoints,
            userId: user._id,
            name: user.name,
        };
    }

    async addLoyaltyPoints(userId: string, points: number, session?: any) {
        if (points <= 0) throw new BadRequestException('Points must be positive');
        const user = await this.userModel
            .findByIdAndUpdate(
                userId,
                { $inc: { loyaltyPoints: points } },
                { new: true, session },
            )
            .select('-password');
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async deductLoyaltyPoints(userId: string, points: number, session?: any) {
        const user = await this.userModel.findById(userId).session(session);
        if (!user) throw new NotFoundException('User not found');
        if (user.loyaltyPoints < points) {
            throw new BadRequestException('Insufficient loyalty points');
        }
        user.loyaltyPoints -= points;
        await user.save({ session });
        return user;
    }

    async adminUpdateUser(
        adminId: string,
        targetUserId: string,
        dto: AdminUpdateUserDto,
        adminRole: UserRole,
    ) {
        const target = await this.userModel.findById(targetUserId);
        if (!target) throw new NotFoundException('User not found');

        if (
            adminRole === UserRole.ADMIN &&
            (target.role === UserRole.ADMIN || target.role === UserRole.SUPER_ADMIN)
        ) {
            throw new ForbiddenException('Admins cannot modify other admins');
        }

        if (dto.role === UserRole.SUPER_ADMIN && adminRole !== UserRole.SUPER_ADMIN) {
            throw new ForbiddenException('Only super admin can assign super admin role');
        }

        const updated = await this.userModel
            .findByIdAndUpdate(targetUserId, { $set: dto }, { new: true })
            .select('-password');
        return updated;
    }

    async getUserStats() {
        const [total, admins, activeUsers] = await Promise.all([
            this.userModel.countDocuments(),
            this.userModel.countDocuments({ role: { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } }),
            this.userModel.countDocuments({ isActive: true }),
        ]);
        return { total, admins, activeUsers };
    }
}