import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersController } from './presentation/users.controller';
import { CreateUserNestHandler } from './presentation/handlers/create-user.nest-handler';
import { GetUserByIdNestHandler } from './presentation/handlers/get-user-by-id.nest-handler';
import { GetAllUsersNestHandler } from './presentation/handlers/get-all-users.nest-handler';
import { UpdateUserNestHandler } from './presentation/handlers/update-user.nest-handler';
import { DeleteUserNestHandler } from './presentation/handlers/delete-user.nest-handler';
import { UserPrismaRepository } from '../../core/infrastructure/repositories/user.prisma.repository';
import { BcryptPasswordHasher } from '../../core/infrastructure/services/bcrypt-password-hasher.service';
import { USER_REPOSITORY, PASSWORD_HASHER, LOGGER } from '../../core/application/ports/tokens';
import type { IUserRepository } from '../../core/application/ports/user-repository.port';
import type { IPasswordHasher } from '../../core/application/ports/password-hasher.port';
import { PrismaModule } from '../../core/infrastructure/prisma/prisma.module';
import { LoggerAdapter } from '../../core/infrastructure/logging/logger.adapter';
import { LoggingModule } from '../../core/infrastructure/logging/logging.module';

const CommandHandlers = [
    CreateUserNestHandler,
    UpdateUserNestHandler,
    DeleteUserNestHandler,
];

const QueryHandlers = [
    GetUserByIdNestHandler,
    GetAllUsersNestHandler,
];

@Module({
    imports: [
        CqrsModule,
        PrismaModule,
        LoggingModule,
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
        {
            provide: LOGGER,
            useClass: LoggerAdapter,
        },
    ],
})
export class UsersModule { }
