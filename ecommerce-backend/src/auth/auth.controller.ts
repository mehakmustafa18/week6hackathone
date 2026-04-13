import { Controller, Post, Body, Get, Patch, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ChangePasswordDto } from './auth.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Get('google')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Initiate Google login' })
    async googleAuth(@Req() req) {}

    @Public()
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Google auth callback' })
    async googleAuthRedirect(@Req() req, @Res() res: Response) {
        const result = await this.authService.socialLogin(req, 'google');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/auth-success?token=${result.token}`);
    }

    @Public()
    @Get('github')
    @UseGuards(AuthGuard('github'))
    @ApiOperation({ summary: 'Initiate GitHub login' })
    async githubAuth(@Req() req) {}

    @Public()
    @Get('github/callback')
    @UseGuards(AuthGuard('github'))
    @ApiOperation({ summary: 'GitHub auth callback' })
    async githubAuthRedirect(@Req() req, @Res() res: Response) {
        const result = await this.authService.socialLogin(req, 'github');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/auth-success?token=${result.token}`);
    }

    @Public()
    @Get('discord')
    @UseGuards(AuthGuard('discord'))
    @ApiOperation({ summary: 'Initiate Discord login' })
    async discordAuth(@Req() req) {}

    @Public()
    @Get('discord/callback')
    @UseGuards(AuthGuard('discord'))
    @ApiOperation({ summary: 'Discord auth callback' })
    async discordAuthRedirect(@Req() req, @Res() res: Response) {
        const result = await this.authService.socialLogin(req, 'discord');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/auth-success?token=${result.token}`);
    }

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Login with email and password' })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @ApiBearerAuth()
    @Get('me')
    @ApiOperation({ summary: 'Get current logged-in user' })
    getMe(@CurrentUser() user: any) {
        return user;
    }

    @ApiBearerAuth()
    @Patch('change-password')
    @ApiOperation({ summary: 'Change password' })
    changePassword(
        @CurrentUser('_id') userId: string,
        @Body() dto: ChangePasswordDto,
    ) {
        return this.authService.changePassword(String(userId), dto);
    }
}