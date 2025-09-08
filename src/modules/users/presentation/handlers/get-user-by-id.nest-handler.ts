import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import type { IUserRepository } from '../../../../core/application/ports/user-repository.port';
import type { ILogger } from '../../../../core/application/ports/logger.port';
import { USER_REPOSITORY, LOGGER } from '../../../../core/application/ports/tokens';

import { GetUserByIdQuery } from '../../../../core/application/users/queries/get-user-by-id/get-user-by-id.query';
import { GetUserByIdHandler as AppGetUserByIdHandler } from '../../../../core/application/users/queries/get-user-by-id/get-user-by-id.handler';
import type { UserOutput } from '../../../../core/application/models/user.output';
import { mapAppErrorToHttp } from '../../../shared/error-mapper.js';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdNestHandler implements IQueryHandler<GetUserByIdQuery, UserOutput> {
    private readonly appHandler: AppGetUserByIdHandler;

    constructor(
        @Inject(USER_REPOSITORY) users: IUserRepository,
        @Inject(LOGGER) private readonly logger: ILogger,
    ) {
        this.appHandler = new AppGetUserByIdHandler(users, this.logger);
    }

    async execute(query: GetUserByIdQuery): Promise<UserOutput> {
        try {
            return await this.appHandler.execute(query);
        } catch (error: any) {
            throw mapAppErrorToHttp(error); // hatayı dışarı fırlat
        }
    }
}
