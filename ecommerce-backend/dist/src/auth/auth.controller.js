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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./auth.dto");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async googleAuth(req) { }
    async googleAuthRedirect(req, res) {
        const result = await this.authService.socialLogin(req, 'google');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/auth-success?token=${result.token}`);
    }
    async githubAuth(req) { }
    async githubAuthRedirect(req, res) {
        const result = await this.authService.socialLogin(req, 'github');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/auth-success?token=${result.token}`);
    }
    async discordAuth(req) { }
    async discordAuthRedirect(req, res) {
        const result = await this.authService.socialLogin(req, 'discord');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/auth-success?token=${result.token}`);
    }
    register(dto) {
        return this.authService.register(dto);
    }
    login(dto) {
        return this.authService.login(dto);
    }
    getMe(user) {
        return user;
    }
    changePassword(userId, dto) {
        return this.authService.changePassword(String(userId), dto);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('google'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google')),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate Google login' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuth", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('google/callback'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google')),
    (0, swagger_1.ApiOperation)({ summary: 'Google auth callback' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuthRedirect", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('github'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('github')),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate GitHub login' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "githubAuth", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('github/callback'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('github')),
    (0, swagger_1.ApiOperation)({ summary: 'GitHub auth callback' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "githubAuthRedirect", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('discord'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('discord')),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate Discord login' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "discordAuth", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('discord/callback'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('discord')),
    (0, swagger_1.ApiOperation)({ summary: 'Discord auth callback' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "discordAuthRedirect", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login with email and password' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current logged-in user' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)('change-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Change password' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('_id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, auth_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "changePassword", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map