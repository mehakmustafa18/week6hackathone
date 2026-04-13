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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const user_schema_1 = require("../users/user.schema");
let AuthService = class AuthService {
    constructor(userModel, jwtService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        const hashedPassword = await bcrypt.hash(dto.password, 12);
        const user = await this.userModel.create({
            ...dto,
            password: hashedPassword,
            role: user_schema_1.UserRole.USER,
        });
        const token = this.generateToken(user);
        return { user: this.sanitizeUser(user), token };
    }
    async login(dto) {
        const user = await this.userModel
            .findOne({ email: dto.email.toLowerCase() })
            .select('+password');
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const token = this.generateToken(user);
        return { user: this.sanitizeUser(user), token };
    }
    async changePassword(userId, dto) {
        const user = await this.userModel.findById(userId).select('+password');
        if (!user)
            throw new common_1.UnauthorizedException();
        const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isMatch)
            throw new common_1.BadRequestException('Current password is incorrect');
        user.password = await bcrypt.hash(dto.newPassword, 12);
        await user.save();
        return { message: 'Password changed successfully' };
    }
    async socialLogin(req, provider) {
        if (!req.user) {
            throw new common_1.BadRequestException('Unauthenticated');
        }
        const { email, googleId, githubId, discordId, firstName, lastName, username, picture } = req.user;
        const providerIdField = `${provider}Id`;
        const providerId = googleId || githubId || discordId;
        let user = await this.userModel.findOne({ [providerIdField]: providerId });
        if (!user && email) {
            user = await this.userModel.findOne({ email: email.toLowerCase() });
        }
        if (!user) {
            user = await this.userModel.create({
                name: firstName && lastName ? `${firstName} ${lastName}` : username || email.split('@')[0],
                email: email ? email.toLowerCase() : `${providerId}@${provider}.com`,
                [providerIdField]: providerId,
                avatar: picture,
                role: user_schema_1.UserRole.USER,
            });
        }
        else {
            if (!user[providerIdField]) {
                user[providerIdField] = providerId;
                if (!user.avatar && picture)
                    user.avatar = picture;
                await user.save();
            }
        }
        const token = this.generateToken(user);
        return { user: this.sanitizeUser(user), token };
    }
    async validateToken(token) {
        try {
            return this.jwtService.verify(token);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    generateToken(user) {
        return this.jwtService.sign({
            sub: user._id,
            email: user.email,
            role: user.role,
        });
    }
    sanitizeUser(user) {
        const obj = user.toObject();
        delete obj.password;
        return obj;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map