import { NotFoundException, Inject } from '@nestjs/common';
import { GetUserByIdQuery } from './get-user-by-id.query';
import type { IUserRepository } from '../../../ports/user-repository.port';
import { UserOutput } from '../../../models/user.output';
import { UserMapper } from '../../../mapping/user.mapper';
import { USER_REPOSITORY } from '../../../ports/tokens';
import { AppErrorCodes } from '../../../errors/codes';

export class GetUserByIdHandler {
    constructor(private readonly users: IUserRepository) { }

    async execute(query: GetUserByIdQuery): Promise<UserOutput> {
        const user = await this.users.findById(query.id);
        if (!user) {
            throw new Error(AppErrorCodes.USER_NOT_FOUND);
        }
        return UserMapper.toOutput(user);
    }
}
