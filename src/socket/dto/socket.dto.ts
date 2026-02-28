/**
 * DTOs cho Socket.IO Events
 */

import { IsString, IsOptional } from 'class-validator';

// =====================================================
// ONLINE USER - Thông tin user đang online
// =====================================================
export interface OnlineUser {
    user_id: string;
    user_name: string;
    avatar_url?: string;
    joined_at: string;
}

// =====================================================
// JOIN ROOM PAYLOAD - Payload khi join vào room
// =====================================================
export class JoinRoomPayload {
    @IsString()
    topic: string;  // Topic của speaking exam

    @IsString()
    @IsOptional()
    exam_id?: string; // ID của exam (optional, để biết cụ thể đang làm bài nào)
}

// =====================================================
// LEAVE ROOM PAYLOAD - Payload khi rời room
// =====================================================
export class LeaveRoomPayload {
    @IsString()
    topic: string;
}

// =====================================================
// ROOM USERS UPDATE - Event gửi danh sách users trong room
// =====================================================
export interface RoomUsersUpdate {
    topic: string;
    users: OnlineUser[];
    count: number;
}

// =====================================================
// SOCKET USER DATA - Dữ liệu user lưu trong socket
// =====================================================
export interface SocketUserData {
    _id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    role: string;
}
