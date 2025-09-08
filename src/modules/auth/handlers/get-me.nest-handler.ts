import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { GetMeQuery } from '../../../core/application/auth/queries/get-me/get-me.query';
import { GetMeHandler as AppGetMeHandler } from '../../../core/application/auth/queries/get-me/get-me.handler';

import type { IUserRepository } from '../../../core/application/ports/user-repository.port';
import type { ILogger } from '../../../core/application/ports/logger.port';
import {
  USER_REPOSITORY,
  LOGGER,
} from '../../../core/application/ports/tokens';

import type { UserOutput } from '../../../core/application/users/models/user.output';
import { mapAppErrorToHttp } from '../../shared/error-mapper.js';

@QueryHandler(GetMeQuery)
export class GetMeNestHandler implements IQueryHandler<GetMeQuery, UserOutput> {
  private readonly appHandler: AppGetMeHandler;

  constructor(
    @Inject(USER_REPOSITORY) users: IUserRepository,
    @Inject(LOGGER) private readonly logger: ILogger,
  ) {
    this.appHandler = new AppGetMeHandler(users, this.logger);
  }

  async execute(query: GetMeQuery): Promise<UserOutput> {
    try {
      return await this.appHandler.execute(query);
    } catch (error: any) {
      throw mapAppErrorToHttp(error);
    }
  }
}
