import { ConflictException, Inject } from '@nestjs/common';
import { RegisterUserCommand } from './register-user.command';
import type { IUserRepository } from '../../../ports/user-repository.port';
import type { IPasswordHasher } from '../../../ports/password-hasher.port';
import { USER_REPOSITORY, PASSWORD_HASHER } from '../../../ports/tokens';
import { User } from '../../../../domain/entities/user';

export class RegisterUserHandler {
    constructor(
        private readonly users: IUserRepository,
        private readonly hasher: IPasswordHasher,
    ) { }

    async execute(command: RegisterUserCommand): Promise<string> {
        const existingUser = await this.users.findByEmail(command.email);
        if (existingUser) {
            throw new Error('ERR_EMAIL_EXISTS');
        }

        const passwordHash = await this.hasher.hash(command.password);
        const user = User.createNew(
            command.email,
            passwordHash,
            command.firstName,
            command.lastName,
        );

        const created = await this.users.create(user);
        return created.id;
    }
}
