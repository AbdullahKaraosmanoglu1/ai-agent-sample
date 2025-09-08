import { Injectable, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as refreshTokenRepositoryPort from '../../application/ports/refresh-token-repository.port';
import { REFRESH_TOKEN_REPOSITORY } from '../../application/ports/tokens';

@Injectable()
export class CleanupRefreshTokensJob {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokens: refreshTokenRepositoryPort.IRefreshTokenRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async execute(): Promise<void> {
    await this.refreshTokens.cleanup();
  }
}
