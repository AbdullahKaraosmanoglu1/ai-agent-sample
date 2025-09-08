import { DeleteUserCommand } from '../commands/delete-user.command';
import type { IUserRepository } from '../../ports/user-repository.port';
import { USER_REPOSITORY } from '../../ports/tokens';
import type { ILogger } from '../../ports/logger.port';
import { AppErrorCodes } from '../../errors/codes';

export class DeleteUserHandler {
  constructor(
    private readonly users: IUserRepository,
    private readonly logger: ILogger,
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const user = await this.users.findById(command.id);
    if (!user) {
      throw new Error(AppErrorCodes.USER_NOT_FOUND);
    }
    await this.users.delete(command.id);
    this.logger.setComponent('DeleteUserHandler');
    this.logger.info('User deleted', { userId: command.id });
  }
}
