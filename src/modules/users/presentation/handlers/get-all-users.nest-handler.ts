import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAllUsersQuery } from '../../../../core/application/users/queries/get-all-users/get-all-users.query';
import { GetAllUsersHandler as AppGetAllUsersHandler } from '../../../../core/application/users/queries/get-all-users/get-all-users.handler';
import type { IUserRepository } from '../../../../core/application/ports/user-repository.port';
import { USER_REPOSITORY } from '../../../../core/application/ports/tokens';
import type { UserDto } from '../../../../core/application/dto/user.dto';

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersNestHandler implements IQueryHandler<GetAllUsersQuery, UserDto[]> {
    private readonly appHandler: AppGetAllUsersHandler;

    constructor(
        @Inject(USER_REPOSITORY) users: IUserRepository,
    ) {
        this.appHandler = new AppGetAllUsersHandler(users);
    }

    async execute(): Promise<UserDto[]> {
        try {
            return await this.appHandler.execute();
        } catch (error: any) {
            const { mapAppErrorToHttp } = await import('../../../shared/error-mapper.js');
            mapAppErrorToHttp(error);
        }
    }
}


