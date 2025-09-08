import { LoginUserCommand } from './login-user.command';

import type { IUserRepository } from '../../../ports/user-repository.port';
import type { IPasswordHasher } from '../../../ports/password-hasher.port';
import type { ITokenService } from '../../../ports/token-service.port';
import type { IRefreshTokenRepository } from '../../../ports/refresh-token-repository.port';
import type { IDateTime } from '../../../ports/datetime.port';
import type { IUnitOfWork } from '../../../ports/unit-of-work.port';
import type { ILogger } from '../../../ports/logger.port';

import { AuthResultDto } from '../../../dto/auth-result.dto';
import { RefreshToken } from '../../../../domain/entities/refresh-token';
import {
    USER_REPOSITORY,
    PASSWORD_HASHER,
    TOKEN_SERVICE,
    REFRESH_TOKEN_REPOSITORY,
    DATE_TIME,
} from '../../../ports/tokens';

import { randomUUID } from 'crypto';
import { InvalidCredentialsError } from '../../../errors/app-error';


export class LoginUserHandler {
    constructor(
        private readonly users: IUserRepository,
        private readonly hasher: IPasswordHasher,
        private readonly tokens: ITokenService,
        private readonly refreshTokens: IRefreshTokenRepository,
        private readonly dateTime: IDateTime,
        private readonly uow: IUnitOfWork,
        private readonly logger: ILogger,
    ) { }

    async execute(command: LoginUserCommand): Promise<AuthResultDto> {
        this.logger.setComponent('LoginUserHandler');
        this.logger.info('Login attempt received');
        const user = await this.users.findByEmail(command.email);
        if (!user) {
            this.logger.warn('Login failed: user not found');
            throw new InvalidCredentialsError();
        }

        const isValid = await this.hasher.verify(command.password, user.passwordHash);
        if (!isValid) {
            this.logger.warn('Login failed: invalid password');
            throw new InvalidCredentialsError();
        }
        const accessToken = await this.tokens.signAccessToken({ sub: user.id });

        const { refreshToken } = await this.uow.run(async () => {
            await this.refreshTokens.revokeAllForUser(user.id);

            const jti = randomUUID();
            const expiresAt = this.dateTime.addDays(this.dateTime.now(), 14);
            await this.refreshTokens.create(RefreshToken.createNew(jti, user.id, expiresAt));

            const refreshToken = await this.tokens.signRefreshToken({
                sub: user.id,
                jti: jti
            });
            return { refreshToken };
        });

        this.logger.info('Login successful');
        return {
            accessToken,
            refreshToken,
            expiresIn: this.tokens.getAccessTokenTtlSeconds(),
        };
    }
}
