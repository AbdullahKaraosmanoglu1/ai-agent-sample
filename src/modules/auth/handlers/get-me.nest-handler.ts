import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetMeQuery } from '../../../core/application/auth/queries/get-me/get-me.query';
import { GetMeHandler as AppGetMeHandler } from '../../../core/application/auth/queries/get-me/get-me.handler';
import type { IUserRepository } from '../../../core/application/ports/user-repository.port';
import { USER_REPOSITORY } from '../../../core/application/ports/tokens';
import type { UserDto } from '../../../core/application/dto/user.dto';

@QueryHandler(GetMeQuery)
export class GetMeNestHandler implements IQueryHandler<GetMeQuery, UserDto> {
    private readonly appHandler: AppGetMeHandler;

    constructor(
        @Inject(USER_REPOSITORY) users: IUserRepository,
    ) {
        this.appHandler = new AppGetMeHandler(users);
    }

    async execute(query: GetMeQuery): Promise<UserDto> {
        try {
            return await this.appHandler.execute(query);
        } catch (error: any) {
            const { mapAppErrorToHttp } = await import('../../shared/error-mapper.js');
            mapAppErrorToHttp(error);
        }
    }
}


