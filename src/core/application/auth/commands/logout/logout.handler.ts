import { LogoutCommand } from './logout.command';
import type { IRefreshTokenRepository } from '../../../ports/refresh-token-repository.port';
import { REFRESH_TOKEN_REPOSITORY } from '../../../ports/tokens';
import type { ILogger } from '../../../ports/logger.port';

export class LogoutHandler {
    constructor(
        private readonly refreshTokens: IRefreshTokenRepository,
        private readonly logger: ILogger,
    ) { }

    async execute(command: LogoutCommand): Promise<void> {
        this.logger.setComponent('LogoutHandler');
        if (command.refreshTokenJti) {
            await this.refreshTokens.revoke(command.refreshTokenJti);
            this.logger.info('Logout revoked single refresh token', { jti: command.refreshTokenJti, userId: command.userId });
        } else {
            await this.refreshTokens.revokeAllForUser(command.userId);
            this.logger.info('Logout revoked all refresh tokens', { userId: command.userId });
        }
    }
}
