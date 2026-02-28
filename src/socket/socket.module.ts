/**
 * Socket Module
 * Module quản lý WebSocket connections
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SpeakingRoomGateway } from './gateway/speaking-room.gateway';
import { UsersModule } from '@/user/user.module';

@Module({
    imports: [
        UsersModule,
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('auth.jwtSecret'),
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [SpeakingRoomGateway],
    exports: [SpeakingRoomGateway],
})
export class SocketModule { }
