import { LogoutCommand } from './logout.command';
import type { IRefreshTokenRepository } from '../../../ports/refresh-token-repository.port';
import { REFRESH_TOKEN_REPOSITORY } from '../../../ports/tokens';

export class LogoutHandler {
    constructor(
        private readonly refreshTokens: IRefreshTokenRepository,
    ) { }

    async execute(command: LogoutCommand): Promise<void> {
        if (command.refreshTokenJti) {
            await this.refreshTokens.revoke(command.refreshTokenJti);
        } else {
            await this.refreshTokens.revokeAllForUser(command.userId);
        }
    }
}
