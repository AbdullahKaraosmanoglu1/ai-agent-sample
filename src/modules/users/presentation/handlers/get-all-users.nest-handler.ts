import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { GetAllUsersQuery } from '../../../../core/application/users/queries/get-all-users.query';
import { GetAllUsersHandler as AppGetAllUsersHandler } from '../../../../core/application/users/queries/get-all-users.handler';

import type { IUserRepository } from '../../../../core/application/ports/user-repository.port';
import type { ILogger } from '../../../../core/application/ports/logger.port';
import {
  USER_REPOSITORY,
  LOGGER,
} from '../../../../core/application/ports/tokens';

import type { UserOutput } from '../../../../core/application/users/models/user.output';
import { mapAppErrorToHttp } from '../../../shared/error-mapper.js';

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersNestHandler
  implements IQueryHandler<GetAllUsersQuery, UserOutput[]>
{
  private readonly appHandler: AppGetAllUsersHandler;

  constructor(
    @Inject(USER_REPOSITORY) users: IUserRepository,
    @Inject(LOGGER) private readonly logger: ILogger,
  ) {
    this.appHandler = new AppGetAllUsersHandler(users, this.logger);
  }

  async execute(): Promise<UserOutput[]> {
    try {
      return await this.appHandler.execute();
    } catch (error: any) {
      throw mapAppErrorToHttp(error);
    }
  }
}
