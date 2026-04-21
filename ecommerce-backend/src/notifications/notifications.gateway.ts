import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../users/user.schema';

@WebSocketGateway({
    cors: {
        origin: (origin, callback) => {
            const allowed = [
                process.env.FRONTEND_URL || 'http://localhost:3000',
                'http://localhost:3001',
                'http://localhost:3000',
            ];
            if (!origin || allowed.includes(origin)) {
                callback(null, true);
            } else {
                callback(null, true); // allow all in production for socket
            }
        },
        credentials: true,
    },
    namespace: '/notifications',
    transports: ['polling', 'websocket'],
})
export class NotificationsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(NotificationsGateway.name);
    private userSocketMap = new Map<string, string[]>();

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    afterInit() {
        this.logger.log('Notifications WebSocket Gateway initialized');
    }

    async handleConnection(client: Socket) {
        try {
            const token =
                client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.split(' ')[1];

            if (!token) {
                this.logger.warn(`Client ${client.id} connected without token, joining public room`);
                client.join('public');
                return;
            }

            const payload = this.jwtService.verify(token, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });

            this.logger.log(`Connection payload: User=${payload.sub}, Role=${payload.role}`);

            client.data.userId = payload.sub;
            client.data.role = payload.role;

            // Join personal and role-based rooms
            await client.join(`user:${payload.sub}`);
            await client.join(`role:${payload.role}`);
            await client.join('authenticated');

            this.logger.log(`Client authenticated and joined rooms: ${client.id} (user: ${payload.sub}, role: ${payload.role})`);
        } catch (error) {
            client.join('public');
            this.logger.error(`Socket Auth Error for client ${client.id}: ${error.message}`);
            this.logger.warn(`Unauthenticated connection: ${client.id}`);
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data?.userId;
        if (userId) {
            const sockets = (this.userSocketMap.get(userId) || []).filter(
                (id) => id !== client.id,
            );
            if (sockets.length === 0) {
                this.userSocketMap.delete(userId);
            } else {
                this.userSocketMap.set(userId, sockets);
            }
        }
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('ping')
    handlePing(@ConnectedSocket() client: Socket) {
        client.emit('pong', { timestamp: new Date().toISOString() });
    }

    // Broadcast to ALL connected clients (e.g. sale alerts)
    broadcastToAll(event: string, data: any) {
        this.server.emit(event, data);
    }

    // Send to a specific user
    sendToUser(userId: string, event: string, data: any) {
        this.server.to(`user:${userId}`).emit(event, data);
    }

    // Send to a specific role
    sendToRole(role: string, event: string, data: any) {
        this.logger.log(`[Gateway] Sending event "${event}" to role room: role:${role}`);
        this.server.to(`role:${role}`).emit(event, data);
    }

    // Send to all admin roles
    sendToAdmins(event: string, data: any) {
        this.logger.log(`[Gateway] Broadcasting to all admins: ${event}`);
        this.server.to([`role:${UserRole.ADMIN}`, `role:${UserRole.SUPER_ADMIN}`]).emit(event, data);
    }

    getConnectedUsers(): number {
        return this.userSocketMap.size;
    }
}