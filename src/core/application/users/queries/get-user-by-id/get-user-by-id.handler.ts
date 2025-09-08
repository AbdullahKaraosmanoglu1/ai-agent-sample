import { GetUserByIdQuery } from './get-user-by-id.query';
import type { IUserRepository } from '../../../ports/user-repository.port';
import { UserOutput } from '../../../models/user.output';
import { UserMapper } from '../../../mapping/user.mapper';
import { USER_REPOSITORY } from '../../../ports/tokens';
import { AppErrorCodes } from '../../../errors/codes';
import type { ILogger } from '../../../ports/logger.port';

export class GetUserByIdHandler {
    constructor(private readonly users: IUserRepository, private readonly logger: ILogger) { }

    async execute(query: GetUserByIdQuery): Promise<UserOutput> {
        this.logger.setComponent('GetUserByIdHandler');
        const user = await this.users.findById(query.id);
        if (!user) {
            throw new Error(AppErrorCodes.USER_NOT_FOUND);
        }
        const output = UserMapper.toOutput(user);
        this.logger.info('GetUserById queried', { id: output.id });
        return output;
    }
}
