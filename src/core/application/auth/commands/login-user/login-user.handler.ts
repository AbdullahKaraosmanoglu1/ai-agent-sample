import { LoginUserCommand } from './login-user.command';

import type { IUserRepository } from '../../../ports/user-repository.port';
import type { IPasswordHasher } from '../../../ports/password-hasher.port';
import type { ITokenService } from '../../../ports/token-service.port';
import type { IRefreshTokenRepository } from '../../../ports/refresh-token-repository.port';
import type { IDateTime } from '../../../ports/datetime.port';

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
import { AppErrorCodes } from '../../../errors/codes';


export class LoginUserHandler {
    constructor(
        private readonly users: IUserRepository,
        private readonly hasher: IPasswordHasher,
        private readonly tokens: ITokenService,
        private readonly refreshTokens: IRefreshTokenRepository,
        private readonly dateTime: IDateTime,
    ) { }

    async execute(command: LoginUserCommand): Promise<AuthResultDto> {
        const user = await this.users.findByEmail(command.email);
        if (!user) {
            throw new Error(AppErrorCodes.AUTH_INVALID_CREDENTIALS);
        }

        const isValid = await this.hasher.verify(command.password, user.passwordHash);
        if (!isValid) {
            throw new Error(AppErrorCodes.AUTH_INVALID_CREDENTIALS);
        }
        const accessToken = await this.tokens.signAccessToken({ sub: user.id });

        await this.refreshTokens.revokeAllForUser(user.id);

        const jti = randomUUID();
        const expiresAt = this.dateTime.addDays(this.dateTime.now(), 14);
        await this.refreshTokens.create(RefreshToken.createNew(jti, user.id, expiresAt));

        const refreshToken = await this.tokens.signRefreshToken({
            sub: user.id,
            jti: jti
        });

        return {
            accessToken,
            refreshToken,
            expiresIn: 900,
        };
    }
}
