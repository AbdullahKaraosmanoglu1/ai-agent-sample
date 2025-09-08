import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { mapAppErrorToHttp } from '../../../shared/error-mapper.js';
import { UpdateUserCommand } from '../../../../core/application/commands/update-user.command';
import { UpdateUserHandler as AppUpdateUserHandler } from '../../../../core/application/handlers/update-user.handler';

import type { IUserRepository } from '../../../../core/application/ports/user-repository.port';
import type { IPasswordHasher } from '../../../../core/application/ports/password-hasher.port';
import type { ILogger } from '../../../../core/application/ports/logger.port';
import { USER_REPOSITORY, PASSWORD_HASHER, LOGGER } from '../../../../core/application/ports/tokens';

@CommandHandler(UpdateUserCommand)
export class UpdateUserNestHandler implements ICommandHandler<UpdateUserCommand, void> {
    private readonly appHandler: AppUpdateUserHandler;

    constructor(
        @Inject(USER_REPOSITORY) users: IUserRepository,
        @Inject(PASSWORD_HASHER) hasher: IPasswordHasher,
        @Inject(LOGGER) private readonly logger: ILogger,
    ) {
        this.appHandler = new AppUpdateUserHandler(users, hasher, this.logger);
    }

    async execute(command: UpdateUserCommand): Promise<void> {
        try {
            return await this.appHandler.execute(command);
        } catch (error: any) {
            throw mapAppErrorToHttp(error);
        }
    }
}
