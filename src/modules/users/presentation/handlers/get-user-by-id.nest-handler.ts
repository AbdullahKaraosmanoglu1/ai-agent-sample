import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserByIdQuery } from '../../../../core/application/users/queries/get-user-by-id/get-user-by-id.query';
import { GetUserByIdHandler as AppGetUserByIdHandler } from '../../../../core/application/users/queries/get-user-by-id/get-user-by-id.handler';
import type { IUserRepository } from '../../../../core/application/ports/user-repository.port';
import { USER_REPOSITORY } from '../../../../core/application/ports/tokens';
import type { UserDto } from '../../../../core/application/dto/user.dto';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdNestHandler implements IQueryHandler<GetUserByIdQuery, UserDto> {
    private readonly appHandler: AppGetUserByIdHandler;

    constructor(
        @Inject(USER_REPOSITORY) users: IUserRepository,
    ) {
        this.appHandler = new AppGetUserByIdHandler(users);
    }

    async execute(query: GetUserByIdQuery): Promise<UserDto> {
        try {
            return await this.appHandler.execute(query);
        } catch (error: any) {
            const { mapAppErrorToHttp } = await import('../../../shared/error-mapper.js');
            mapAppErrorToHttp(error);
        }
    }
}


