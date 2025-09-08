import { RefreshTokenCommand } from './refresh-token.command';
import type { IRefreshTokenRepository } from '../../../ports/refresh-token-repository.port';
import type { ITokenService } from '../../../ports/token-service.port';
import type { IDateTime } from '../../../ports/datetime.port';
import type { IUnitOfWork } from '../../../ports/unit-of-work.port';
import { AuthResultDto } from '../../../auth/dto/auth-result.dto';
import { RefreshToken } from '../../../../domain/entities/refresh-token';
import { randomUUID } from 'crypto';
import {
  InvalidRefreshTokenError,
  InvalidRefreshTokenFormatError,
} from '../../../errors/app-error';
import type { ILogger } from '../../../ports/logger.port';

export class RefreshTokenHandler {
  constructor(
    private readonly tokens: ITokenService,
    private readonly refreshTokens: IRefreshTokenRepository,
    private readonly dateTime: IDateTime,
    private readonly uow: IUnitOfWork,
    private readonly logger: ILogger,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<AuthResultDto> {
    this.logger.setComponent('RefreshTokenHandler');
    const payload = await this.tokens.verifyRefreshToken(command.refreshToken);

    if (!payload.jti) {
      this.logger.warn('Refresh failed: missing jti');
      throw new InvalidRefreshTokenFormatError();
    }

    const token = await this.refreshTokens.findByJti(payload.jti);
    if (!token || !token.isValid()) {
      this.logger.warn('Refresh failed: token not found or invalid');
      throw new InvalidRefreshTokenError();
    }

    await this.uow.run(async () => {
      await this.refreshTokens.revoke(payload.jti!);
      const newJti = randomUUID();
      const expiresAt = this.dateTime.addDays(this.dateTime.now(), 14);
      await this.refreshTokens.create(
        RefreshToken.createNew(newJti, payload.sub, expiresAt),
      );
    });

    const accessToken = await this.tokens.signAccessToken({ sub: payload.sub });
    const newJti = randomUUID();
    const refreshToken = await this.tokens.signRefreshToken({
      sub: payload.sub,
      jti: newJti,
    });

    this.logger.info('Refresh successful');
    return {
      accessToken,
      refreshToken,
      expiresIn: this.tokens.getAccessTokenTtlSeconds(),
    };
  }
}
