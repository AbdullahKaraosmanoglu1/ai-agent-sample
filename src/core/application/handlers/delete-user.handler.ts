import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteUserCommand } from '../commands/delete-user.command';
import type { IUserRepository } from '../ports/user-repository.port';
import { NotFoundException, Inject } from '@nestjs/common';
import { USER_REPOSITORY } from '../ports/tokens';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand, void> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly users: IUserRepository
    ) { }

    async execute(command: DeleteUserCommand): Promise<void> {
        const user = await this.users.findById(command.id);
        if (!user) {
            throw new NotFoundException(`User with id ${command.id} not found`);
        }
        await this.users.delete(command.id);
    }
}
