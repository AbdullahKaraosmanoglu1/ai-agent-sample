import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({
        status: 201,
        description: 'User successfully registered',
        schema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'The ID of the newly created user',
                    example: '507f1f77bcf86cd799439011'
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
    @ApiResponse({ status: 409, description: 'Conflict - Email already exists' })
    async register(@Body() dto: RegisterDto): Promise<{ id: string }> {
        const id = await this.commandBus.execute(
            new RegisterUserCommand(dto.email, dto.password, dto.firstName, dto.lastName)
        );
        return { id };
    }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Login user and get tokens' })
    @ApiResponse({
        status: 201,
        description: 'Login successful',
        schema: {
            type: 'object',
            properties: {
                accessToken: {
                    type: 'string',
                    description: 'JWT access token'
                },
                refreshToken: {
                    type: 'string',
                    description: 'JWT refresh token'
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
    async login(@Body() dto: LoginDto): Promise<AuthResult> {
        return await this.commandBus.execute(
            new LoginUserCommand(dto.email, dto.password)
        );
    }

    @Post('refresh')
    @UseGuards(JwtRefreshGuard)
    @ApiOperation({ summary: 'Refresh access token using refresh token' })
    @ApiBearerAuth('access-token')
    @ApiResponse({
        status: 201,
        description: 'Token refresh successful',
        schema: {
            type: 'object',
            properties: {
                accessToken: {
                    type: 'string',
                    description: 'New JWT access token'
                },
                refreshToken: {
                    type: 'string',
                    description: 'New JWT refresh token'
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid refresh token' })
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
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Logout user and invalidate refresh token' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
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
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Get current user information' })
    @ApiResponse({
        status: 200,
        description: 'User information retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'User ID'
                },
                email: {
                    type: 'string',
                    description: 'User email'
                },
                firstName: {
                    type: 'string',
                    description: 'User first name'
                },
                lastName: {
                    type: 'string',
                    description: 'User last name'
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
    async getMe(@CurrentUser() userId: string) {
        return await this.queryBus.execute(new GetMeQuery(userId));
    }
}
