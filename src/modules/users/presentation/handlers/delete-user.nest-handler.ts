import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { mapAppErrorToHttp } from '../../../shared/error-mapper.js';
import { DeleteUserCommand } from '../../../../core/application/commands/delete-user.command';
import { DeleteUserHandler as AppDeleteUserHandler } from '../../../../core/application/handlers/delete-user.handler';

import type { IUserRepository } from '../../../../core/application/ports/user-repository.port';
import type { ILogger } from '../../../../core/application/ports/logger.port';
import { USER_REPOSITORY, LOGGER } from '../../../../core/application/ports/tokens';

@CommandHandler(DeleteUserCommand)
export class DeleteUserNestHandler implements ICommandHandler<DeleteUserCommand, void> {
    private readonly appHandler: AppDeleteUserHandler;

    constructor(
        @Inject(USER_REPOSITORY) users: IUserRepository,
        @Inject(LOGGER) private readonly logger: ILogger,
    ) {
        this.appHandler = new AppDeleteUserHandler(users, this.logger);
    }

    async execute(command: DeleteUserCommand): Promise<void> {
        try {
            await this.appHandler.execute(command);
        } catch (error: any) {
            throw mapAppErrorToHttp(error);
        }
    }
}
