import { GetMeQuery } from './get-me.query';
import type { IUserRepository } from '../../../ports/user-repository.port';
import { UserOutput } from '../../../users/models/user.output';
import { UserMapper } from '../../../users/mapping/user.mapper';
import { AppErrorCodes } from '../../../errors/codes';
import type { ILogger } from '../../../ports/logger.port';

export class GetMeHandler {
  constructor(
    private readonly users: IUserRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(query: GetMeQuery): Promise<UserOutput> {
    this.logger.setComponent('GetMeHandler');
    const user = await this.users.findById(query.userId);
    if (!user) {
      throw new Error(AppErrorCodes.USER_NOT_FOUND);
    }
    const output = UserMapper.toOutput(user);
    this.logger.info('GetMe queried', { userId: output.id });
    return output;
  }
}
