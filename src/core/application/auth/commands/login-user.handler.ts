import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException, Inject } from '@nestjs/common';
import { LoginUserCommand } from './login-user.command';
import type { IUserRepository } from '../../ports/user-repository.port';
import type { IPasswordHasher } from '../../ports/password-hasher.port';
import type { ITokenService } from '../../ports/token-service.port';
import type { IRefreshTokenRepository } from '../../ports/refresh-token-repository.port';
import type { IDateTime } from '../../ports/datetime.port';
import { AuthResultDto } from '../../dto/auth-result.dto';
import { RefreshToken } from '../../../domain/entities/refresh-token';
import { USER_REPOSITORY, PASSWORD_HASHER, TOKEN_SERVICE, REFRESH_TOKEN_REPOSITORY, DATE_TIME } from '../../ports/tokens';
import { randomUUID } from 'crypto';

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand, AuthResultDto> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly users: IUserRepository,
        @Inject(PASSWORD_HASHER)
        private readonly hasher: IPasswordHasher,
        @Inject(TOKEN_SERVICE)
        private readonly tokens: ITokenService,
        @Inject(REFRESH_TOKEN_REPOSITORY)
        private readonly refreshTokens: IRefreshTokenRepository,
        @Inject(DATE_TIME)
        private readonly dateTime: IDateTime,
    ) { }

    async execute(command: LoginUserCommand): Promise<AuthResultDto> {
        const user = await this.users.findByEmail(command.email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isValid = await this.hasher.verify(command.password, user.passwordHash);
        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate access token
        const accessToken = await this.tokens.signAccessToken({ sub: user.id });

        // Generate refresh token with JTI
        const jti = randomUUID();
        const refreshToken = await this.tokens.signRefreshToken({ sub: user.id, jti });

        // Store refresh token in database
        const expiresAt = this.dateTime.addDays(this.dateTime.now(), 14); // 14 days
        await this.refreshTokens.create(RefreshToken.createNew(jti, user.id, expiresAt));

        return {
            accessToken,
            refreshToken,
            expiresIn: 900, // 15 minutes in seconds
        };
    }
}
