import { Strategy } from 'passport-discord';
import { ConfigService } from '@nestjs/config';
declare const DiscordStrategy_base: new (...args: any[]) => Strategy;
export declare class DiscordStrategy extends DiscordStrategy_base {
    private configService;
    constructor(configService: ConfigService);
    validate(accessToken: string, refreshToken: string, profile: any, done: (err: any, user: any) => void): Promise<any>;
}
export {};
