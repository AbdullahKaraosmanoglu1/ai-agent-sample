import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserByIdQuery } from '../queries/get-user-by-id.query';
import type { IUserRepository } from '../ports/user-repository.port';
import { UserDto } from '../dto/user.dto';
import { UserMapper } from '../mapping/user.mapper';
import { NotFoundException, Inject } from '@nestjs/common';
import { USER_REPOSITORY } from '../ports/tokens';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery, UserDto> {
    constructor(@Inject(USER_REPOSITORY) private readonly users: IUserRepository) { }

    async execute(query: GetUserByIdQuery): Promise<UserDto> {
        const user = await this.users.findById(query.id);
        if (!user) {
            throw new NotFoundException(`User with id ${query.id} not found`);
        }
        return UserMapper.toDto(user);
    }
}
