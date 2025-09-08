import { RefreshTokenCommand } from './refresh-token.command';
import type { IRefreshTokenRepository } from '../../../ports/refresh-token-repository.port';
import type { ITokenService } from '../../../ports/token-service.port';
import type { IDateTime } from '../../../ports/datetime.port';
import { AuthResultDto } from '../../../dto/auth-result.dto';
import { RefreshToken } from '../../../../domain/entities/refresh-token';
import { randomUUID } from 'crypto';
import { AppErrorCodes } from '../../../errors/codes';

export class RefreshTokenHandler {
    constructor(
        private readonly tokens: ITokenService,
        private readonly refreshTokens: IRefreshTokenRepository,
        private readonly dateTime: IDateTime,
    ) { }

    async execute(command: RefreshTokenCommand): Promise<AuthResultDto> {

        const payload = await this.tokens.verifyRefreshToken(command.refreshToken);

        if (!payload.jti) {
            throw new Error(AppErrorCodes.AUTH_INVALID_REFRESH_TOKEN_FORMAT);
        }

        const token = await this.refreshTokens.findByJti(payload.jti);
        if (!token || !token.isValid()) {
            throw new Error(AppErrorCodes.AUTH_INVALID_REFRESH_TOKEN);
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
