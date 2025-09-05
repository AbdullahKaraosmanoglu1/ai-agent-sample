import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersController } from './presentation/users.controller';
import { CreateUserHandler } from '../../core/application/handlers/create-user.handler';
import { GetUserByIdHandler } from '../../core/application/users/queries/get-user-by-id/get-user-by-id.handler';
import { GetAllUsersHandler } from '../../core/application/users/queries/get-all-users/get-all-users.handler';
import { UpdateUserHandler } from '../../core/application/handlers/update-user.handler';
import { DeleteUserHandler } from '../../core/application/handlers/delete-user.handler';
import { UserPrismaRepository } from '../../core/infrastructure/repositories/user.prisma.repository';
import { BcryptPasswordHasher } from '../../core/infrastructure/services/bcrypt-password-hasher.service';
import { USER_REPOSITORY, PASSWORD_HASHER } from '../../core/application/ports/tokens';
import type { IUserRepository } from '../../core/application/ports/user-repository.port';
import type { IPasswordHasher } from '../../core/application/ports/password-hasher.port';
import { PrismaModule } from '../../core/infrastructure/prisma/prisma.module';

const CommandHandlers = [
    CreateUserHandler,
    UpdateUserHandler,
    DeleteUserHandler,
];

const QueryHandlers = [
    GetUserByIdHandler,
    GetAllUsersHandler,
];

@Module({
    imports: [
        CqrsModule,
        PrismaModule,
    ],
    controllers: [UsersController],
    providers: [
        ...CommandHandlers,
        ...QueryHandlers,
        {
            provide: USER_REPOSITORY,
            useClass: UserPrismaRepository,
        },
        {
            provide: PASSWORD_HASHER,
            useClass: BcryptPasswordHasher,
        },
    ],
})
export class UsersModule { }
