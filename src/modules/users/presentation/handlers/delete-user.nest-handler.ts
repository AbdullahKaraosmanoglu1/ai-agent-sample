import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteUserCommand } from '../../../../core/application/commands/delete-user.command';
import { DeleteUserHandler as AppDeleteUserHandler } from '../../../../core/application/handlers/delete-user.handler';
import type { IUserRepository } from '../../../../core/application/ports/user-repository.port';
import { USER_REPOSITORY } from '../../../../core/application/ports/tokens';

@CommandHandler(DeleteUserCommand)
export class DeleteUserNestHandler implements ICommandHandler<DeleteUserCommand, void> {
    private readonly appHandler: AppDeleteUserHandler;

    constructor(
        @Inject(USER_REPOSITORY) users: IUserRepository,
    ) {
        this.appHandler = new AppDeleteUserHandler(users);
    }

    async execute(command: DeleteUserCommand): Promise<void> {
        try {
            return await this.appHandler.execute(command);
        } catch (error: any) {
            const { mapAppErrorToHttp } = await import('../../../shared/error-mapper.js');
            mapAppErrorToHttp(error);
        }
    }
}


