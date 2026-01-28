import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';
import { ExtractJwt } from 'passport-jwt';
import { extractJwtFromCookie } from '../strategies/jwt.strategy';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        // Nếu route được đánh dấu public → bỏ qua guard
        const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            // cho phép vào nhưng vẫn check token nếu có
            const req = context.switchToHttp().getRequest();
            const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req) || extractJwtFromCookie(req);

            if (token) {
                return super.canActivate(context);
            }

            return true;
        }

        return super.canActivate(context);
    }

    handleRequest(err, user, info) {
        if (err || !user) {
            throw new UnauthorizedException('INVALID_TOKEN');
        }
        return user;
    }
}
