import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { LogoutCommand } from '../../../core/application/auth/commands/logout/logout.command';
import { LogoutHandler as AppLogoutHandler } from '../../../core/application/auth/commands/logout/logout.handler';

import type { IRefreshTokenRepository } from '../../../core/application/ports/refresh-token-repository.port';
import type { ILogger } from '../../../core/application/ports/logger.port';
import { REFRESH_TOKEN_REPOSITORY, LOGGER } from '../../../core/application/ports/tokens';

import { mapAppErrorToHttp } from '../../shared/error-mapper.js';

@CommandHandler(LogoutCommand)
export class LogoutNestHandler implements ICommandHandler<LogoutCommand, void> {
    private readonly appHandler: AppLogoutHandler;

    constructor(
        @Inject(REFRESH_TOKEN_REPOSITORY) refreshTokens: IRefreshTokenRepository,
        @Inject(LOGGER) private readonly logger: ILogger,
    ) {
        this.appHandler = new AppLogoutHandler(refreshTokens, this.logger);
    }

    async execute(command: LogoutCommand): Promise<void> {
        try {
            await this.appHandler.execute(command);
        } catch (error: any) {
            throw mapAppErrorToHttp(error);
        }
    }
}
