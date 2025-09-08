import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllUsersQuery } from './get-all-users.query';
import type { IUserRepository } from '../../../ports/user-repository.port';
import { UserDto } from '../../../dto/user.dto';
import { UserMapper } from '../../../mapping/user.mapper';
import { USER_REPOSITORY } from '../../../ports/tokens';


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
