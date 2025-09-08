import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './core/infrastructure/prisma/prisma.module';
import { LoggingModule } from './core/infrastructure/logging/logging.module';
import { DebugModule } from './modules/debug/debug.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggingModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    DebugModule,
  ],
})
export class AppModule {}
