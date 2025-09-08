import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LogoutCommand } from '../../../core/application/auth/commands/logout/logout.command';
import { LogoutHandler as AppLogoutHandler } from '../../../core/application/auth/commands/logout/logout.handler';
import type { IRefreshTokenRepository } from '../../../core/application/ports/refresh-token-repository.port';
import { REFRESH_TOKEN_REPOSITORY } from '../../../core/application/ports/tokens';

@CommandHandler(LogoutCommand)
export class LogoutNestHandler implements ICommandHandler<LogoutCommand, void> {
    private readonly appHandler: AppLogoutHandler;

    constructor(
        @Inject(REFRESH_TOKEN_REPOSITORY) refreshTokens: IRefreshTokenRepository,
    ) {
        this.appHandler = new AppLogoutHandler(refreshTokens);
    }

    async execute(command: LogoutCommand): Promise<void> {
        return this.appHandler.execute(command);
    }
}


