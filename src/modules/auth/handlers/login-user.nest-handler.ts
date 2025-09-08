import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LoginUserCommand } from '../../../core/application/auth/commands/login-user/login-user.command';
import { LoginUserHandler as AppLoginUserHandler } from '../../../core/application/auth/commands/login-user/login-user.handler';
import type { IUserRepository } from '../../../core/application/ports/user-repository.port';
import type { IPasswordHasher } from '../../../core/application/ports/password-hasher.port';
import type { ITokenService } from '../../../core/application/ports/token-service.port';
import type { IRefreshTokenRepository } from '../../../core/application/ports/refresh-token-repository.port';
import type { IDateTime } from '../../../core/application/ports/datetime.port';
import type { IUnitOfWork } from '../../../core/application/ports/unit-of-work.port';
import {
  USER_REPOSITORY,
  PASSWORD_HASHER,
  TOKEN_SERVICE,
  REFRESH_TOKEN_REPOSITORY,
  DATE_TIME,
  UNIT_OF_WORK,
  LOGGER,
} from '../../../core/application/ports/tokens';
import type { ILogger } from '../../../core/application/ports/logger.port';
import type { AuthResultDto } from '../../../core/application/auth/dto/auth-result.dto';
import { mapAppErrorToHttp } from '../../shared/error-mapper.js';

@CommandHandler(LoginUserCommand)
export class LoginUserNestHandler
  implements ICommandHandler<LoginUserCommand, AuthResultDto>
{
  private readonly appHandler: AppLoginUserHandler;

  constructor(
    @Inject(USER_REPOSITORY) users: IUserRepository,
    @Inject(PASSWORD_HASHER) hasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE) tokens: ITokenService,
    @Inject(REFRESH_TOKEN_REPOSITORY) refreshTokens: IRefreshTokenRepository,
    @Inject(DATE_TIME) dateTime: IDateTime,
    @Inject(UNIT_OF_WORK) uow: IUnitOfWork,
    @Inject(LOGGER) logger: ILogger,
  ) {
    this.appHandler = new AppLoginUserHandler(
      users,
      hasher,
      tokens,
      refreshTokens,
      dateTime,
      uow,
      logger,
    );
  }

  async execute(command: LoginUserCommand): Promise<AuthResultDto> {
    try {
      return await this.appHandler.execute(command);
    } catch (error: any) {
      mapAppErrorToHttp(error);
      throw error;
    }
  }
}
