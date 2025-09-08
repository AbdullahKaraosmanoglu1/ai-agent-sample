import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ConflictException } from '@nestjs/common';
import { CreateUserCommand } from '../../../../core/application/users/commands/create-user.command';
import { CreateUserHandler as AppCreateUserHandler } from '../../../../core/application/users//handlers/create-user.handler';
import type { IUserRepository } from '../../../../core/application/ports/user-repository.port';
import type { IPasswordHasher } from '../../../../core/application/ports/password-hasher.port';
import {
  USER_REPOSITORY,
  PASSWORD_HASHER,
  LOGGER,
} from '../../../../core/application/ports/tokens';
import type { ILogger } from '../../../../core/application/ports/logger.port';

@CommandHandler(CreateUserCommand)
export class CreateUserNestHandler
  implements ICommandHandler<CreateUserCommand, string>
{
  private readonly appHandler: AppCreateUserHandler;

  constructor(
    @Inject(USER_REPOSITORY) users: IUserRepository,
    @Inject(PASSWORD_HASHER) hasher: IPasswordHasher,
    @Inject(LOGGER) logger: ILogger,
  ) {
    this.appHandler = new AppCreateUserHandler(users, hasher, logger);
  }

  async execute(command: CreateUserCommand): Promise<string> {
    try {
      return await this.appHandler.execute(command);
    } catch (error: any) {
      if (error?.message === 'ERR_EMAIL_EXISTS') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }
}
