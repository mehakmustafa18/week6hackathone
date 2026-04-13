import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole } from '../users/user.schema';
import { RegisterDto, LoginDto, ChangePasswordDto } from './auth.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
        if (existing) throw new ConflictException('Email already registered');

        const hashedPassword = await bcrypt.hash(dto.password, 12);
        const user = await this.userModel.create({
            ...dto,
            password: hashedPassword,
            role: UserRole.USER,
        });

        const token = this.generateToken(user);
        return { user: this.sanitizeUser(user), token };
    }

    async login(dto: LoginDto) {
        const user = await this.userModel
            .findOne({ email: dto.email.toLowerCase() })
            .select('+password');

        if (!user || !user.isActive) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        const token = this.generateToken(user);
        return { user: this.sanitizeUser(user), token };
    }

    async changePassword(userId: string, dto: ChangePasswordDto) {
        const user = await this.userModel.findById(userId).select('+password');
        if (!user) throw new UnauthorizedException();

        const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isMatch) throw new BadRequestException('Current password is incorrect');

        user.password = await bcrypt.hash(dto.newPassword, 12);
        await user.save();
        return { message: 'Password changed successfully' };
    }

    async socialLogin(req: any, provider: 'google' | 'github' | 'discord') {
        if (!req.user) {
            throw new BadRequestException('Unauthenticated');
        }

        const { email, googleId, githubId, discordId, firstName, lastName, username, picture } = req.user;
        const providerIdField = `${provider}Id`;
        const providerId = googleId || githubId || discordId;

        // Try to find user by provider ID first
        let user = await this.userModel.findOne({ [providerIdField]: providerId });

        // If not found, try to find by email
        if (!user && email) {
            user = await this.userModel.findOne({ email: email.toLowerCase() });
        }

        if (!user) {
            // Create new user
            user = await this.userModel.create({
                name: firstName && lastName ? `${firstName} ${lastName}` : username || email.split('@')[0],
                email: email ? email.toLowerCase() : `${providerId}@${provider}.com`, // Fallback for no email
                [providerIdField]: providerId,
                avatar: picture,
                role: UserRole.USER,
            });
        } else {
            // Link provider ID to existing account if not already linked
            if (!user[providerIdField]) {
                user[providerIdField] = providerId;
                if (!user.avatar && picture) user.avatar = picture;
                await user.save();
            }
        }

        const token = this.generateToken(user);
        return { user: this.sanitizeUser(user), token };
    }

    async validateToken(token: string) {
        try {
            return this.jwtService.verify(token);
        } catch {
            throw new UnauthorizedException('Invalid token');
        }
    }

    private generateToken(user: UserDocument) {
        return this.jwtService.sign({
            sub: user._id,
            email: user.email,
            role: user.role,
        });
    }

    private sanitizeUser(user: UserDocument) {
        const obj = user.toObject();
        delete obj.password;
        return obj;
    }
}