import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserCommand } from '../commands/update-user.command';
import type { IUserRepository } from '../ports/user-repository.port';
import { NotFoundException, Inject } from '@nestjs/common';
import type { IPasswordHasher } from '../ports/password-hasher.port';
import { User } from '../../domain/entities/user';
import { USER_REPOSITORY, PASSWORD_HASHER } from '../ports/tokens';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand, void> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly users: IUserRepository,
        @Inject(PASSWORD_HASHER)
        private readonly hasher: IPasswordHasher,
    ) { }

    async execute(command: UpdateUserCommand): Promise<void> {
        const user = await this.users.findById(command.id);
        if (!user) {
            throw new NotFoundException(`User with id ${command.id} not found`);
        }

        const updateData: any = {};
        if (command.dto.email) updateData.email = command.dto.email;
        if (command.dto.firstName) updateData.firstName = command.dto.firstName;
        if (command.dto.lastName) updateData.lastName = command.dto.lastName;
        if (command.dto.password) {
            updateData.passwordHash = await this.hasher.hash(command.dto.password);
        }

        await this.users.update(User.rehydrate({
            ...user,
            ...updateData
        }));
    }
}
