import { GetAllUsersQuery } from './get-all-users.query';
import type { IUserRepository } from '../../../ports/user-repository.port';
import { UserOutput } from '../../../models/user.output';
import { UserMapper } from '../../../mapping/user.mapper';
import { USER_REPOSITORY } from '../../../ports/tokens';


export class GetAllUsersHandler {
    constructor(
        private readonly users: IUserRepository
    ) { }

    async execute(): Promise<UserOutput[]> {
        const users = await this.users.findAll();
        return users.map(UserMapper.toOutput);
    }
}
