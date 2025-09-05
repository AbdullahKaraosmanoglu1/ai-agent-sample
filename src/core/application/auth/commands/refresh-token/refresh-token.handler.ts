import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException, Inject } from '@nestjs/common';
import { RefreshTokenCommand } from './refresh-token.command';
import type { IRefreshTokenRepository } from 'src/core/application/ports/refresh-token-repository.port';
import type { ITokenService } from 'src/core/application/ports/token-service.port';
import type { IDateTime } from 'src/core/application/ports/datetime.port';
import { AuthResultDto } from 'src/core/application/dto/auth-result.dto';
import { RefreshToken } from 'src/core/domain/entities/refresh-token';
import { TOKEN_SERVICE, REFRESH_TOKEN_REPOSITORY, DATE_TIME } from 'src/core/application/ports/tokens';
import { randomUUID } from 'crypto';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand, AuthResultDto> {
    constructor(
        @Inject(TOKEN_SERVICE)
        private readonly tokens: ITokenService,
        @Inject(REFRESH_TOKEN_REPOSITORY)
        private readonly refreshTokens: IRefreshTokenRepository,
        @Inject(DATE_TIME)
        private readonly dateTime: IDateTime,
    ) { }

    async execute(command: RefreshTokenCommand): Promise<AuthResultDto> {
        // Verify the refresh token
        const payload = await this.tokens.verifyRefreshToken(command.refreshToken);

        if (!payload.jti) {
            throw new UnauthorizedException('Invalid refresh token format');
        }

        // Check if the token exists and is valid
        const token = await this.refreshTokens.findByJti(payload.jti);
        if (!token || !token.isValid()) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        // Revoke the old token
        await this.refreshTokens.revoke(payload.jti);

        // Generate new tokens
        const accessToken = await this.tokens.signAccessToken({ sub: payload.sub });

        const newJti = randomUUID();
        const refreshToken = await this.tokens.signRefreshToken({ sub: payload.sub, jti: newJti });

        // Store new refresh token
        const expiresAt = this.dateTime.addDays(this.dateTime.now(), 14); // 14 days
        await this.refreshTokens.create(RefreshToken.createNew(newJti, payload.sub, expiresAt));

        return {
            accessToken,
            refreshToken,
            expiresIn: 900, // 15 minutes in seconds
        };
    }
}
