import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard sử dụng Refresh Token Strategy
 * Dùng cho endpoint refresh token
 */
@Injectable()
export class RefreshAuthGuard extends AuthGuard('jwt-refresh') {

    

 }