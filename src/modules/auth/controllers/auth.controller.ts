import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RegisterUserCommand } from '../../../core/application/auth/commands/register-user/register-user.command';
import { LoginUserCommand } from '../../../core/application/auth/commands/login-user/login-user.command';
import { RefreshTokenCommand } from '../../../core/application/auth/commands/refresh-token/refresh-token.command';
import { LogoutCommand } from '../../../core/application/auth/commands/logout/logout.command';
import { GetMeQuery } from '../../../core/application/auth/queries/get-me/get-me.query';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import type { AuthResult } from '../../../core/application/models/auth-result.model';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    @Public()
    @Post('register')
    async register(@Body() dto: RegisterDto): Promise<{ id: string }> {
        const id = await this.commandBus.execute(
            new RegisterUserCommand(dto.email, dto.password, dto.firstName, dto.lastName)
        );
        return { id };
    }

    @Public()
    @Post('login')
    async login(@Body() dto: LoginDto): Promise<AuthResult> {
        return await this.commandBus.execute(
            new LoginUserCommand(dto.email, dto.password)
        );
    }

    @Post('refresh')
    @UseGuards(JwtRefreshGuard)
    async refresh(
        @Body() dto: RefreshTokenDto,
        @CurrentUser() userId: string,
    ): Promise<AuthResult> {
        if (!dto.refreshToken) {
            throw new Error('Refresh token is required');
        }
        return await this.commandBus.execute(
            new RefreshTokenCommand(dto.refreshToken)
        );
    }

    @Post('logout')
    async logout(
        @CurrentUser() userId: string,
        @Body() dto: RefreshTokenDto,
    ): Promise<void> {
        if (!dto.refreshToken) {
            throw new Error('Refresh token is required');
        }
        await this.commandBus.execute(
            new LogoutCommand(userId, dto.refreshToken)
        );
    }

    @Get('me')
    async getMe(@CurrentUser() userId: string) {
        return await this.queryBus.execute(new GetMeQuery(userId));
    }
}
