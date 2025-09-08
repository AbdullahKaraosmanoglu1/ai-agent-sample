import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateUserCommand } from '../../../../core/application/commands/update-user.command';
import { UpdateUserHandler as AppUpdateUserHandler } from '../../../../core/application/handlers/update-user.handler';
import type { IUserRepository } from '../../../../core/application/ports/user-repository.port';
import type { IPasswordHasher } from '../../../../core/application/ports/password-hasher.port';
import { USER_REPOSITORY, PASSWORD_HASHER } from '../../../../core/application/ports/tokens';

@CommandHandler(UpdateUserCommand)
export class UpdateUserNestHandler implements ICommandHandler<UpdateUserCommand, void> {
    private readonly appHandler: AppUpdateUserHandler;

    constructor(
        @Inject(USER_REPOSITORY) users: IUserRepository,
        @Inject(PASSWORD_HASHER) hasher: IPasswordHasher,
    ) {
        this.appHandler = new AppUpdateUserHandler(users, hasher);
    }

    async execute(command: UpdateUserCommand): Promise<void> {
        try {
            return await this.appHandler.execute(command);
        } catch (error: any) {
            const { mapAppErrorToHttp } = await import('../../../shared/error-mapper.js');
            mapAppErrorToHttp(error);
        }
    }
}


