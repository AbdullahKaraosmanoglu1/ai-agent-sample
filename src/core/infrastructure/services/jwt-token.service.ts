import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ITokenService, TokenPayload, TokenVerifyResult } from '../../application/ports/token-service.port';
import type { IRefreshTokenRepository } from '../../application/ports/refresh-token-repository.port';
import { REFRESH_TOKEN_REPOSITORY } from '../../application/ports/tokens';
import { RefreshToken } from '../../domain/entities/refresh-token';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class JwtTokenService implements ITokenService {
    constructor(
        private readonly jwt: JwtService,
        private readonly config: ConfigService,
        @Inject(REFRESH_TOKEN_REPOSITORY)
        private readonly refreshTokenRepository: IRefreshTokenRepository,
    ) { }

    private getAccessTokenOptions() {
        return {
            secret: this.config.get('JWT_ACCESS_SECRET'),
            expiresIn: '15m',
            issuer: this.config.get('JWT_ISSUER'),
            audience: this.config.get('JWT_AUDIENCE'),
        };
    }

    async signAccessToken(payload: TokenPayload): Promise<string> {
        return this.jwt.signAsync(payload, this.getAccessTokenOptions());
    }

    async signRefreshToken(payload: TokenPayload): Promise<string> {
        if (!payload.jti) {
            throw new Error('jti is required for refresh token');
        }
        return payload.jti;
    }

    async verifyAccessToken(token: string): Promise<TokenVerifyResult> {
        const payload = await this.jwt.verifyAsync(token, this.getAccessTokenOptions());
        return { sub: payload.sub };
    }

    async verifyRefreshToken(token: string): Promise<TokenVerifyResult> {
        const refreshToken = await this.refreshTokenRepository.findByJti(token);
        if (!refreshToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (!refreshToken.isValid()) {
            await this.refreshTokenRepository.revoke(token);
            throw new UnauthorizedException(
                refreshToken.revoked
                    ? 'Refresh token has been revoked'
                    : 'Refresh token expired'
            );
        }

        return {
            sub: refreshToken.userId,
            jti: refreshToken.id
        };
    }

    getAccessTokenTtlSeconds(): number {
        const raw = this.getAccessTokenOptions().expiresIn as string;
        // naive parse '15m' | '900s'
        const m = /^([0-9]+)\s*([smhd])$/.exec(raw);
        if (!m) return 900;
        const n = parseInt(m[1], 10);
        const unit = m[2];
        switch (unit) {
            case 's': return n;
            case 'm': return n * 60;
            case 'h': return n * 3600;
            case 'd': return n * 86400;
            default: return 900;
        }
    }
}
