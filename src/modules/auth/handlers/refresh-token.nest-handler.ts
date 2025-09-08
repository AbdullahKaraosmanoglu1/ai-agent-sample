import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { mapAppErrorToHttp } from '../../shared/error-mapper.js';
import { RefreshTokenCommand } from '../../../core/application/auth/commands/refresh-token/refresh-token.command';
import { RefreshTokenHandler as AppRefreshTokenHandler } from '../../../core/application/auth/commands/refresh-token/refresh-token.handler';
import type { ITokenService } from '../../../core/application/ports/token-service.port';
import type { IRefreshTokenRepository } from '../../../core/application/ports/refresh-token-repository.port';
import type { IDateTime } from '../../../core/application/ports/datetime.port';
import { TOKEN_SERVICE, REFRESH_TOKEN_REPOSITORY, DATE_TIME } from '../../../core/application/ports/tokens';
import type { AuthResultDto } from '../../../core/application/dto/auth-result.dto';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenNestHandler implements ICommandHandler<RefreshTokenCommand, AuthResultDto> {
    private readonly appHandler: AppRefreshTokenHandler;

    constructor(
        @Inject(TOKEN_SERVICE) tokens: ITokenService,
        @Inject(REFRESH_TOKEN_REPOSITORY) refreshTokens: IRefreshTokenRepository,
        @Inject(DATE_TIME) dateTime: IDateTime,
    ) {
        this.appHandler = new AppRefreshTokenHandler(tokens, refreshTokens, dateTime);
    }

    async execute(command: RefreshTokenCommand): Promise<AuthResultDto> {
        try {
            return await this.appHandler.execute(command);
        } catch (error: any) {
            mapAppErrorToHttp(error);
            return Promise.reject(error);
        }
    }
}


