import { NotFoundException, Inject } from '@nestjs/common';
import { GetMeQuery } from './get-me.query';
import type { IUserRepository } from '../../../ports/user-repository.port';
import { USER_REPOSITORY } from '../../../ports/tokens';
import { UserOutput } from '../../../models/user.output';
import { UserMapper } from '../../../mapping/user.mapper';
import { AppErrorCodes } from '../../../errors/codes';

export class GetMeHandler {
    constructor(
        private readonly users: IUserRepository,
    ) { }

    async execute(query: GetMeQuery): Promise<UserOutput> {
        const user = await this.users.findById(query.userId);
        if (!user) {
            throw new Error(AppErrorCodes.USER_NOT_FOUND);
        }
        return UserMapper.toOutput(user);
    }
}
