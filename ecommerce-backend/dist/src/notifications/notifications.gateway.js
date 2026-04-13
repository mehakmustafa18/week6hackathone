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
var NotificationsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const user_schema_1 = require("../users/user.schema");
let NotificationsGateway = NotificationsGateway_1 = class NotificationsGateway {
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(NotificationsGateway_1.name);
        this.userSocketMap = new Map();
    }
    afterInit() {
        this.logger.log('Notifications WebSocket Gateway initialized');
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token ||
                client.handshake.headers?.authorization?.split(' ')[1];
            if (!token) {
                this.logger.warn(`Client ${client.id} connected without token, joining public room`);
                client.join('public');
                return;
            }
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('JWT_SECRET'),
            });
            this.logger.log(`Connection payload: User=${payload.sub}, Role=${payload.role}`);
            client.data.userId = payload.sub;
            client.data.role = payload.role;
            await client.join(`user:${payload.sub}`);
            await client.join(`role:${payload.role}`);
            await client.join('authenticated');
            this.logger.log(`Client authenticated and joined rooms: ${client.id} (user: ${payload.sub}, role: ${payload.role})`);
        }
        catch (error) {
            client.join('public');
            this.logger.error(`Socket Auth Error for client ${client.id}: ${error.message}`);
            this.logger.warn(`Unauthenticated connection: ${client.id}`);
        }
    }
    handleDisconnect(client) {
        const userId = client.data?.userId;
        if (userId) {
            const sockets = (this.userSocketMap.get(userId) || []).filter((id) => id !== client.id);
            if (sockets.length === 0) {
                this.userSocketMap.delete(userId);
            }
            else {
                this.userSocketMap.set(userId, sockets);
            }
        }
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    handlePing(client) {
        client.emit('pong', { timestamp: new Date().toISOString() });
    }
    broadcastToAll(event, data) {
        this.server.emit(event, data);
    }
    sendToUser(userId, event, data) {
        this.server.to(`user:${userId}`).emit(event, data);
    }
    sendToRole(role, event, data) {
        this.logger.log(`[Gateway] Sending event "${event}" to role room: role:${role}`);
        this.server.to(`role:${role}`).emit(event, data);
    }
    sendToAdmins(event, data) {
        this.logger.log(`[Gateway] Broadcasting to all admins: ${event}`);
        this.server.to([`role:${user_schema_1.UserRole.ADMIN}`, `role:${user_schema_1.UserRole.SUPER_ADMIN}`]).emit(event, data);
    }
    getConnectedUsers() {
        return this.userSocketMap.size;
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handlePing", null);
exports.NotificationsGateway = NotificationsGateway = NotificationsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'],
            credentials: true,
        },
        namespace: '/notifications',
        transports: ['polling', 'websocket'],
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map