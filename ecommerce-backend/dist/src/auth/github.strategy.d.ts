import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
declare const GithubStrategy_base: new (...args: any[]) => Strategy;
export declare class GithubStrategy extends GithubStrategy_base {
    private configService;
    constructor(configService: ConfigService);
    validate(accessToken: string, refreshToken: string, profile: any, done: (err: any, user: any) => void): Promise<any>;
}
export {};
