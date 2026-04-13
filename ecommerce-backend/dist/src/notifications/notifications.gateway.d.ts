import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export declare class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private configService;
    server: Server;
    private readonly logger;
    private userSocketMap;
    constructor(jwtService: JwtService, configService: ConfigService);
    afterInit(): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handlePing(client: Socket): void;
    broadcastToAll(event: string, data: any): void;
    sendToUser(userId: string, event: string, data: any): void;
    sendToRole(role: string, event: string, data: any): void;
    sendToAdmins(event: string, data: any): void;
    getConnectedUsers(): number;
}
