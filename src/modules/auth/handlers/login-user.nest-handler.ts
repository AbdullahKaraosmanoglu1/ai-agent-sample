import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LoginUserCommand } from '../../../core/application/auth/commands/login-user/login-user.command';
import { LoginUserHandler as AppLoginUserHandler } from '../../../core/application/auth/commands/login-user/login-user.handler';
import type { IUserRepository } from '../../../core/application/ports/user-repository.port';
import type { IPasswordHasher } from '../../../core/application/ports/password-hasher.port';
import type { ITokenService } from '../../../core/application/ports/token-service.port';
import type { IRefreshTokenRepository } from '../../../core/application/ports/refresh-token-repository.port';
import type { IDateTime } from '../../../core/application/ports/datetime.port';
import { USER_REPOSITORY, PASSWORD_HASHER, TOKEN_SERVICE, REFRESH_TOKEN_REPOSITORY, DATE_TIME } from '../../../core/application/ports/tokens';
import type { AuthResultDto } from '../../../core/application/dto/auth-result.dto';

@CommandHandler(LoginUserCommand)
export class LoginUserNestHandler implements ICommandHandler<LoginUserCommand, AuthResultDto> {
    private readonly appHandler: AppLoginUserHandler;

    constructor(
        @Inject(USER_REPOSITORY) users: IUserRepository,
        @Inject(PASSWORD_HASHER) hasher: IPasswordHasher,
        @Inject(TOKEN_SERVICE) tokens: ITokenService,
        @Inject(REFRESH_TOKEN_REPOSITORY) refreshTokens: IRefreshTokenRepository,
        @Inject(DATE_TIME) dateTime: IDateTime,
    ) {
        this.appHandler = new AppLoginUserHandler(users, hasher, tokens, refreshTokens, dateTime);
    }

    async execute(command: LoginUserCommand): Promise<AuthResultDto> {
        try {
            return await this.appHandler.execute(command);
        } catch (error: any) {
            const { mapAppErrorToHttp } = await import('../../shared/error-mapper.js');
            mapAppErrorToHttp(error);
        }
    }
}


