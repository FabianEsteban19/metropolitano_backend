import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const path = request.originalUrl || request.url || '';

        if (
            request.method === 'OPTIONS' ||
            path === '/' ||
            path.startsWith('/auth') ||
            path.startsWith('/api')
        ) {
            return true;
        }

        const token = this.extractBearerToken(request.headers.authorization);

        if (!token) {
            throw new UnauthorizedException('Falta el token Bearer');
        }

        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get<string>('JWT_SECRET', 'dev-secret'),
            });

            request['user'] = payload;
            return true;
        } catch {
            throw new UnauthorizedException('Token invalido o expirado');
        }
    }

    private extractBearerToken(authorizationHeader?: string): string | null {
        if (!authorizationHeader) {
            return null;
        }

        const [scheme, token] = authorizationHeader.split(' ');
        if (scheme?.toLowerCase() !== 'bearer' || !token) {
            return null;
        }

        return token;
    }
}