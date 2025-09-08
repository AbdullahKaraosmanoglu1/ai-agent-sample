import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException, Inject } from '@nestjs/common';
import { RefreshTokenCommand } from './refresh-token.command';
import type { IRefreshTokenRepository } from '../../../ports/refresh-token-repository.port';
import type { ITokenService } from '../../../ports/token-service.port';
import type { IDateTime } from '../../../ports/datetime.port';
import { AuthResultDto } from '../../../dto/auth-result.dto';
import { RefreshToken } from '../../../../domain/entities/refresh-token';
import { TOKEN_SERVICE, REFRESH_TOKEN_REPOSITORY, DATE_TIME } from '../../../ports/tokens';
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

        const payload = await this.tokens.verifyRefreshToken(command.refreshToken);

        if (!payload.jti) {
            throw new UnauthorizedException('Invalid refresh token format');
        }

        const token = await this.refreshTokens.findByJti(payload.jti);
        if (!token || !token.isValid()) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        await this.refreshTokens.revoke(payload.jti);

        const accessToken = await this.tokens.signAccessToken({ sub: payload.sub });

        const newJti = randomUUID();
        const refreshToken = await this.tokens.signRefreshToken({ sub: payload.sub, jti: newJti });

        const expiresAt = this.dateTime.addDays(this.dateTime.now(), 14);
        await this.refreshTokens.create(RefreshToken.createNew(newJti, payload.sub, expiresAt));

        return {
            accessToken,
            refreshToken,
            expiresIn: 900,
        };
    }
}
