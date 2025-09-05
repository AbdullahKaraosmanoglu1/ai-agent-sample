import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Inject } from '@nestjs/common';
import { GetMeQuery } from './get-me.query';
import type { IUserRepository } from '../../ports/user-repository.port';
import { USER_REPOSITORY } from '../../ports/tokens';
import { UserDto } from '../../dto/user.dto';
import { UserMapper } from '../../mapping/user.mapper';

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery, UserDto> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly users: IUserRepository,
    ) { }

    async execute(query: GetMeQuery): Promise<UserDto> {
        const user = await this.users.findById(query.userId);
        if (!user) {
            throw new NotFoundException(`User with id ${query.userId} not found`);
        }
        return UserMapper.toDto(user);
    }
}
