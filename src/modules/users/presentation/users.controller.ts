import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserCommand } from '../../../core/application/commands/create-user.command';
import { UpdateUserCommand } from '../../../core/application/commands/update-user.command';
import { DeleteUserCommand } from '../../../core/application/commands/delete-user.command';
import { GetUserByIdQuery } from '../../../core/application/queries/get-user-by-id.query';
import { GetAllUsersQuery } from '../../../core/application/queries/get-all-users.query';

@Controller('users')
export class UsersController {
    constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) { }

    @Post()
    async create(@Body() dto: CreateUserDto) {
        const id = await this.commandBus.execute(new CreateUserCommand(dto.email, dto.password, dto.firstName, dto.lastName));
        return { id };
    }

    @Get(':id')
    async get(@Param('id') id: string) {
        return await this.queryBus.execute(new GetUserByIdQuery(id));
    }

    @Get()
    async getAll() {
        return await this.queryBus.execute(new GetAllUsersQuery());
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        await this.commandBus.execute(new UpdateUserCommand(id, dto));
        return { success: true };
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.commandBus.execute(new DeleteUserCommand(id));
        return { success: true };
    }
}
