import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './core/infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule { }
