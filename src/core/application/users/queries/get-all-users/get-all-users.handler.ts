import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllUsersQuery } from './get-all-users.query';
import type { IUserRepository } from 'src/core/application/ports/user-repository.port';
import { UserDto } from 'src/core/application/dto/user.dto';
import { UserMapper } from 'src/core/application/mapping/user.mapper';
import { USER_REPOSITORY } from 'src/core/application/ports/tokens';

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersHandler implements IQueryHandler<GetAllUsersQuery, UserDto[]> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly users: IUserRepository
    ) { }

    async execute(): Promise<UserDto[]> {
        const users = await this.users.findAll();
        return users.map(UserMapper.toDto);
    }
}
