import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ChangePasswordDto } from './auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    googleAuth(req: any): Promise<void>;
    googleAuthRedirect(req: any, res: Response): Promise<void>;
    githubAuth(req: any): Promise<void>;
    githubAuthRedirect(req: any, res: Response): Promise<void>;
    discordAuth(req: any): Promise<void>;
    discordAuthRedirect(req: any, res: Response): Promise<void>;
    register(dto: RegisterDto): Promise<{
        user: any;
        token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: any;
        token: string;
    }>;
    getMe(user: any): any;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
