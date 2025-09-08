import type { IUserRepository } from '../../ports/user-repository.port';
import { UserOutput } from '../models/user.output';
import { UserMapper } from '../mapping/user.mapper';
import type { ILogger } from '../../ports/logger.port';

export class GetAllUsersHandler {
  constructor(
    private readonly users: IUserRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(): Promise<UserOutput[]> {
    this.logger.setComponent('GetAllUsersHandler');
    const users = await this.users.findAll();
    const outputs = users.map(UserMapper.toOutput);
    this.logger.info('GetAllUsers queried', { count: outputs.length });
    return outputs;
  }
}
