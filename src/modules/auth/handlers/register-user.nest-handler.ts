import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { RegisterUserCommand } from '../../../core/application/auth/commands/register-user/register-user.command';
import { RegisterUserHandler as AppRegisterUserHandler } from '../../../core/application/auth/commands/register-user/register-user.handler';

import type { IUserRepository } from '../../../core/application/ports/user-repository.port';
import type { IPasswordHasher } from '../../../core/application/ports/password-hasher.port';
import { USER_REPOSITORY, PASSWORD_HASHER } from '../../../core/application/ports/tokens';

import { mapAppErrorToHttp } from '../../shared/error-mapper.js';

@CommandHandler(RegisterUserCommand)
export class RegisterUserNestHandler implements ICommandHandler<RegisterUserCommand, string> {
    private readonly appHandler: AppRegisterUserHandler;

    constructor(
        @Inject(USER_REPOSITORY) users: IUserRepository,
        @Inject(PASSWORD_HASHER) hasher: IPasswordHasher,
    ) {
        this.appHandler = new AppRegisterUserHandler(users, hasher);
    }

    async execute(command: RegisterUserCommand): Promise<string> {
        try {
            return await this.appHandler.execute(command);
        } catch (error: any) {
            throw mapAppErrorToHttp(error);
        }
    }
}
