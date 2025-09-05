import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupRefreshTokensJob } from '../../core/infrastructure/jobs/cleanup-refresh-tokens.job';
import { AuthController } from './controllers/auth.controller';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { RegisterUserHandler } from '../../core/application/auth/commands/register-user/register-user.handler';
import { LoginUserHandler } from '../../core/application/auth/commands/login-user/login-user.handler';
import { RefreshTokenHandler } from '../../core/application/auth/commands/refresh-token/refresh-token.handler';
import { LogoutHandler } from '../../core/application/auth/commands/logout/logout.handler';
import { GetMeHandler } from '../../core/application/auth/queries/get-me/get-me.handler';
import { BcryptPasswordHasher } from '../../core/infrastructure/services/bcrypt-password-hasher.service';
import { JwtTokenService } from '../../core/infrastructure/services/jwt-token.service';
import { SystemDateTime } from '../../core/infrastructure/services/system-datetime';
import { UserPrismaRepository } from '../../core/infrastructure/repositories/user.prisma.repository';
import { RefreshTokenPrismaRepository } from '../../core/infrastructure/repositories/refresh-token.prisma.repository';
import { PASSWORD_HASHER, TOKEN_SERVICE, USER_REPOSITORY, REFRESH_TOKEN_REPOSITORY, DATE_TIME } from '../../core/application/ports/tokens';
import { APP_GUARD } from '@nestjs/core';

const CommandHandlers = [
    RegisterUserHandler,
    LoginUserHandler,
    RefreshTokenHandler,
    LogoutHandler,
];

const QueryHandlers = [
    GetMeHandler,
];

const Strategies = [
    JwtAccessStrategy,
    JwtRefreshStrategy,
];

@Module({
    imports: [
        CqrsModule,
        PassportModule,
        ScheduleModule.forRoot(),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => {
                const accessSecret = config.get<string>('JWT_ACCESS_SECRET');
                if (!accessSecret) throw new Error('JWT_ACCESS_SECRET is not defined');

                return {
                    secret: accessSecret,
                    global: true,
                    signOptions: {
                        expiresIn: '15m',
                        issuer: config.get<string>('JWT_ISSUER', 'aiAgentSample'),
                        audience: config.get<string>('JWT_AUDIENCE', 'aiAgentSample_api'),
                    },
                };
            },
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [
        ...CommandHandlers,
        ...QueryHandlers,
        ...Strategies,
        JwtService,
        CleanupRefreshTokensJob,
        {
            provide: APP_GUARD,
            useClass: JwtAccessGuard,
        },
        {
            provide: PASSWORD_HASHER,
            useClass: BcryptPasswordHasher,
        },
        {
            provide: TOKEN_SERVICE,
            useClass: JwtTokenService,
        },
        {
            provide: USER_REPOSITORY,
            useClass: UserPrismaRepository,
        },
        {
            provide: REFRESH_TOKEN_REPOSITORY,
            useClass: RefreshTokenPrismaRepository,
        },
        {
            provide: DATE_TIME,
            useClass: SystemDateTime,
        },
    ],
    exports: [PassportModule],
})
export class AuthModule { }
