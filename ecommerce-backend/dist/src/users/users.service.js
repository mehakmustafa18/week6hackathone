"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./user.schema");
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async findById(id) {
        const user = await this.userModel.findById(id).select('-password');
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async findAll(page = 1, limit = 20, role) {
        const query = {};
        if (role)
            query.role = role;
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
    async updateProfile(userId, dto) {
        const user = await this.userModel
            .findByIdAndUpdate(userId, { $set: dto }, { new: true, runValidators: true })
            .select('-password');
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async getLoyaltyPoints(userId) {
        const user = await this.findById(userId);
        return {
            loyaltyPoints: user.loyaltyPoints,
            userId: user._id,
            name: user.name,
        };
    }
    async addLoyaltyPoints(userId, points, session) {
        if (points <= 0)
            throw new common_1.BadRequestException('Points must be positive');
        const user = await this.userModel
            .findByIdAndUpdate(userId, { $inc: { loyaltyPoints: points } }, { new: true, session })
            .select('-password');
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async deductLoyaltyPoints(userId, points, session) {
        const user = await this.userModel.findById(userId).session(session);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.loyaltyPoints < points) {
            throw new common_1.BadRequestException('Insufficient loyalty points');
        }
        user.loyaltyPoints -= points;
        await user.save({ session });
        return user;
    }
    async adminUpdateUser(adminId, targetUserId, dto, adminRole) {
        const target = await this.userModel.findById(targetUserId);
        if (!target)
            throw new common_1.NotFoundException('User not found');
        if (adminRole === user_schema_1.UserRole.ADMIN &&
            (target.role === user_schema_1.UserRole.ADMIN || target.role === user_schema_1.UserRole.SUPER_ADMIN)) {
            throw new common_1.ForbiddenException('Admins cannot modify other admins');
        }
        if (dto.role === user_schema_1.UserRole.SUPER_ADMIN && adminRole !== user_schema_1.UserRole.SUPER_ADMIN) {
            throw new common_1.ForbiddenException('Only super admin can assign super admin role');
        }
        const updated = await this.userModel
            .findByIdAndUpdate(targetUserId, { $set: dto }, { new: true })
            .select('-password');
        return updated;
    }
    async getUserStats() {
        const [total, admins, activeUsers] = await Promise.all([
            this.userModel.countDocuments(),
            this.userModel.countDocuments({ role: { $in: [user_schema_1.UserRole.ADMIN, user_schema_1.UserRole.SUPER_ADMIN] } }),
            this.userModel.countDocuments({ isActive: true }),
        ]);
        return { total, admins, activeUsers };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map