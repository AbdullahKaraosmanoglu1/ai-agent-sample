import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Inject } from '@nestjs/common';
import { GetUserByIdQuery } from './get-user-by-id.query';
import type { IUserRepository } from 'src/core/application/ports/user-repository.port';
import { UserDto } from 'src/core/application/dto/user.dto';
import { UserMapper } from 'src/core/application/mapping/user.mapper';
import { USER_REPOSITORY } from 'src/core/application/ports/tokens';

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
