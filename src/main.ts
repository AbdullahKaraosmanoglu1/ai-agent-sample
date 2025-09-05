import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './core/infrastructure/logging/logger.service';
import { LoggingInterceptor } from './core/infrastructure/logging/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set up global logging interceptor
  const logger = await app.resolve(LoggerService);
  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
