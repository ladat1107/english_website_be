/**
 * Speaking Room Gateway
 * Quản lý WebSocket connections cho tính năng hiển thị người đang làm cùng topic
 */

import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/user/user.service';
import {
    OnlineUser,
    JoinRoomPayload,
    LeaveRoomPayload,
    RoomUsersUpdate,
    SocketUserData,
} from '../dto/socket.dto';

// =====================================================
// CUSTOM SOCKET TYPE - Socket với user data
// =====================================================
interface AuthenticatedSocket extends Socket {
    user?: SocketUserData;
    currentRoom?: string;
}

// =====================================================
// SPEAKING ROOM GATEWAY
// =====================================================
@WebSocketGateway({
    namespace: '/speaking',
    cors: {
        origin: process.env.FRONTEND_URL || 'https://khailingo.vercel.app',
        credentials: true,
    },
})
export class SpeakingRoomGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(SpeakingRoomGateway.name);

    // Lưu trữ users theo room (topic)
    // Map<topic, Map<socketId, OnlineUser>>
    private rooms: Map<string, Map<string, OnlineUser>> = new Map();

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
    ) { }

    // =====================================================
    // HANDLE CONNECTION - Xác thực JWT khi connect
    // =====================================================
    async handleConnection(client: AuthenticatedSocket): Promise<void> {
        try {
            // Lấy token từ handshake
            const token = this.extractTokenFromHandshake(client);
            console.log(`Client ${client.id} connecting with token:`, token);

            if (!token) {
                this.logger.warn(`Client ${client.id} connected without token`);
                client.disconnect();
                return;
            }

            // Verify JWT token
            const jwtSecret = this.configService.get<string>('auth.jwtSecret');
            const payload = await this.jwtService.verifyAsync(token, {
                secret: jwtSecret,
            });

            if (!payload || !payload._id) {
                throw new UnauthorizedException('Invalid token payload');
            }

            // Lấy thông tin user từ database
            const user = await this.usersService.findById(payload._id);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            // Lưu user data vào socket
            client.user = {
                _id: user._id.toString(),
                email: user.email,
                full_name: user.full_name,
                avatar_url: user.avatar_url,
                role: user.role,
            };

            this.logger.log(
                `Client ${client.id} connected - User: ${client.user.full_name}`,
            );

            // ✅ Emit event để client biết authentication đã hoàn tất
            client.emit('authenticated', {
                user_id: client.user._id,
                user_name: client.user.full_name,
            });
        } catch (error) {
            this.logger.error(
                `Connection error for client ${client.id}: ${error.message}`,
            );
            client.disconnect();
        }
    }

    // =====================================================
    // HANDLE DISCONNECT - Cleanup khi disconnect
    // =====================================================
    async handleDisconnect(client: AuthenticatedSocket): Promise<void> {
        this.logger.log(`Client ${client.id} disconnected`);

        // Nếu user đang ở trong room, rời khỏi room
        if (client.currentRoom && client.user) {
            await this.removeUserFromRoom(client);
        }
    }

    // =====================================================
    // JOIN ROOM - Tham gia vào room theo topic
    // =====================================================
    @SubscribeMessage('join_room')
    async handleJoinRoom(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() payload: JoinRoomPayload,
    ): Promise<void> {
        if (!client.user) {
            this.logger.warn(`Unauthenticated client ${client.id} tried to join room`);
            return;
        }

        console.log(`Client ${client.id} requested to join room with payload:`, payload);
        const { topic } = payload;
        const roomName = this.getRoomName(topic);

        // Nếu đang ở room khác, rời khỏi room cũ trước
        if (client.currentRoom && client.currentRoom !== roomName) {
            await this.removeUserFromRoom(client);
        }

        // Join vào room socket.io
        await client.join(roomName);
        client.currentRoom = roomName;

        // Thêm user vào danh sách room
        if (!this.rooms.has(roomName)) {
            this.rooms.set(roomName, new Map());
        }

        const roomUsers = this.rooms.get(roomName)!;
        const onlineUser: OnlineUser = {
            user_id: client.user._id,
            user_name: client.user.full_name,
            avatar_url: client.user.avatar_url,
            joined_at: new Date().toISOString(),
        };

        roomUsers.set(client.id, onlineUser);

        this.logger.log(
            `User ${client.user.full_name} joined room ${roomName}. Total: ${roomUsers.size}`,
        );

        // Broadcast danh sách users mới cho tất cả trong room
        this.broadcastRoomUsers(roomName, topic);
    }

    // =====================================================
    // LEAVE ROOM - Rời khỏi room
    // =====================================================
    @SubscribeMessage('leave_room')
    async handleLeaveRoom(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() payload: LeaveRoomPayload,
    ): Promise<void> {
        if (!client.user) {
            return;
        }

        await this.removeUserFromRoom(client);
    }

    // =====================================================
    // HELPER - Extract token from handshake
    // =====================================================
    private extractTokenFromHandshake(client: Socket): string | null {
        // 1. Thử lấy từ cookies (ưu tiên cao nhất)
        const cookieHeader = client.handshake.headers.cookie;
        if (cookieHeader) {
            const cookies = this.parseCookies(cookieHeader);
            if (cookies['accessToken']) {
                return cookies['accessToken'];
            }
        }

        // 2. Thử lấy từ auth header
        const authHeader = client.handshake.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }

        // 3. Thử lấy từ auth object hoặc query params
        const token = client.handshake.auth?.token || client.handshake.query?.token;
        if (typeof token === 'string') {
            return token;
        }

        return null;
    }

    // =====================================================
    // HELPER - Parse cookies from cookie header
    // =====================================================
    private parseCookies(cookieHeader: string): Record<string, string> {
        const cookies: Record<string, string> = {};
        cookieHeader.split(';').forEach(cookie => {
            const [name, ...rest] = cookie.trim().split('=');
            if (name && rest.length > 0) {
                cookies[name] = decodeURIComponent(rest.join('='));
            }
        });
        return cookies;
    }

    // =====================================================
    // HELPER - Get room name từ topic
    // =====================================================
    private getRoomName(topic: string): string {
        return `speaking:${topic.toLowerCase().replace(/\s+/g, '_')}`;
    }

    // =====================================================
    // HELPER - Remove user from room
    // =====================================================
    private async removeUserFromRoom(client: AuthenticatedSocket): Promise<void> {
        const roomName = client.currentRoom;
        if (!roomName) return;

        // Parse topic từ room name
        const topic = roomName.replace('speaking:', '').replace(/_/g, ' ');

        // Xóa user khỏi danh sách
        const roomUsers = this.rooms.get(roomName);
        if (roomUsers) {
            roomUsers.delete(client.id);

            // Nếu room trống, xóa room
            if (roomUsers.size === 0) {
                this.rooms.delete(roomName);
            } else {
                // Broadcast danh sách users mới
                this.broadcastRoomUsers(roomName, topic);
            }
        }

        // Leave socket.io room
        await client.leave(roomName);
        client.currentRoom = undefined;

        this.logger.log(
            `User ${client.user?.full_name} left room ${roomName}. Remaining: ${roomUsers?.size || 0}`,
        );
    }

    // =====================================================
    // HELPER - Broadcast room users
    // =====================================================
    private broadcastRoomUsers(roomName: string, topic: string): void {
        const roomUsers = this.rooms.get(roomName);
        const users: OnlineUser[] = roomUsers ? Array.from(roomUsers.values()) : [];

        const update: RoomUsersUpdate = {
            topic,
            users,
            count: users.length,
        };

        // Gửi cho tất cả clients trong room
        this.server.to(roomName).emit('room_users_update', update);

        this.logger.debug(
            `Broadcast room_users_update to ${roomName}: ${users.length} users`,
        );
    }

    // =====================================================
    // GET ROOM USERS - Lấy danh sách users trong room (public method)
    // =====================================================
    getRoomUsersByTopic(topic: string): OnlineUser[] {
        const roomName = this.getRoomName(topic);
        const roomUsers = this.rooms.get(roomName);
        return roomUsers ? Array.from(roomUsers.values()) : [];
    }
}
