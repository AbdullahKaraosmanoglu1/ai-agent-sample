import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ITokenService } from '../../application/ports/token-service.port';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtTokenService implements ITokenService {
    constructor(
        private readonly jwt: JwtService,
        private readonly config: ConfigService,
    ) { }

    private getAccessTokenOptions() {
        return {
            secret: this.config.get('JWT_ACCESS_SECRET'),
            expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN'),
            issuer: this.config.get('JWT_ISSUER'),
            audience: this.config.get('JWT_AUDIENCE'),
        };
    }

    private getRefreshTokenOptions() {
        return {
            secret: this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
            issuer: this.config.get('JWT_ISSUER'),
            audience: this.config.get('JWT_AUDIENCE'),
        };
    }

    async signAccessToken(payload: { sub: string }): Promise<string> {
        return this.jwt.signAsync(payload, this.getAccessTokenOptions());
    }

    async signRefreshToken(payload: { sub: string; jti: string }): Promise<string> {
        return this.jwt.signAsync(payload, this.getRefreshTokenOptions());
    }

    async verifyAccessToken(token: string): Promise<{ sub: string }> {
        const payload = await this.jwt.verifyAsync(token, this.getAccessTokenOptions());
        return { sub: payload.sub };
    }

    async verifyRefreshToken(token: string): Promise<{ sub: string; jti: string }> {
        const payload = await this.jwt.verifyAsync(token, this.getRefreshTokenOptions());
        return { sub: payload.sub, jti: payload.jti };
    }
}
