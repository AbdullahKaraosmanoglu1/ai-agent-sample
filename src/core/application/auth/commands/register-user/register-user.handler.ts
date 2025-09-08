import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, Inject } from '@nestjs/common';
import { RegisterUserCommand } from './register-user.command';
import type { IUserRepository } from '../../../ports/user-repository.port';
import type { IPasswordHasher } from '../../../ports/password-hasher.port';
import { USER_REPOSITORY, PASSWORD_HASHER } from '../../../ports/tokens';
import { User } from '../../../../domain/entities/user';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand, string> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly users: IUserRepository,
        @Inject(PASSWORD_HASHER)
        private readonly hasher: IPasswordHasher,
    ) { }

    async execute(command: RegisterUserCommand): Promise<string> {
        const existingUser = await this.users.findByEmail(command.email);
        if (existingUser) {
            throw new ConflictException('Email already exists');
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
