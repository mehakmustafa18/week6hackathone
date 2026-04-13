import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../users/user.schema';
import { RegisterDto, LoginDto, ChangePasswordDto } from './auth.dto';
export declare class AuthService {
    private userModel;
    private jwtService;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        user: any;
        token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: any;
        token: string;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    socialLogin(req: any, provider: 'google' | 'github' | 'discord'): Promise<{
        user: any;
        token: string;
    }>;
    validateToken(token: string): Promise<any>;
    private generateToken;
    private sanitizeUser;
}
