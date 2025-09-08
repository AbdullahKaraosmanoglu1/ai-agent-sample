import { UpdateUserCommand } from '../commands/update-user.command';
import type { IUserRepository } from '../ports/user-repository.port';
import type { IPasswordHasher } from '../ports/password-hasher.port';
import { User } from '../../domain/entities/user';
import { USER_REPOSITORY, PASSWORD_HASHER } from '../ports/tokens';
import type { ILogger } from '../ports/logger.port';
import { AppErrorCodes } from '../errors/codes';

export class UpdateUserHandler {
    constructor(
        private readonly users: IUserRepository,
        private readonly hasher: IPasswordHasher,
        private readonly logger: ILogger,
    ) { }

    async execute(command: UpdateUserCommand): Promise<void> {
        this.logger.setComponent('UpdateUserHandler');
        const user = await this.users.findById(command.id);
        if (!user) {
            throw new Error(AppErrorCodes.USER_NOT_FOUND);
        }

        const updateData: any = {};
        if (command.dto.email) updateData.email = command.dto.email;
        if (command.dto.firstName) updateData.firstName = command.dto.firstName;
        if (command.dto.lastName) updateData.lastName = command.dto.lastName;
        if (command.dto.password) {
            updateData.passwordHash = await this.hasher.hash(command.dto.password);
        }

        const updated = await this.users.update(User.rehydrate({
            ...user,
            ...updateData
        }));
        this.logger.info('User updated', { userId: updated.id, fields: Object.keys(updateData) });
    }
}
