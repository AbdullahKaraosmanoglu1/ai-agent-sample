# Logging Service Documentation

This document describes how to use the Winston-based logging service implemented in the project.

## Setup

1. Import the LoggingModule in your app.module.ts:

```typescript
import { LoggingModule } from './core/infrastructure/logging/logging.module';

@Module({
  imports: [
    LoggingModule,
    // ... other modules
  ],
})
export class AppModule {}
```

2. Apply the LoggingInterceptor globally in your main.ts:

```typescript
import { LoggingInterceptor } from './core/infrastructure/logging/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(LoggerService);
  app.useGlobalInterceptors(new LoggingInterceptor(logger));
  // ... other configurations
  await app.listen(3000);
}
```

## Usage Examples

### Basic Usage in Services

```typescript
import { Injectable } from '@nestjs/common';
import { LoggerService } from './core/infrastructure/logging/logger.service';

@Injectable()
export class UserService {
  constructor(private readonly logger: LoggerService) {
    this.logger.setComponent('UserService');
  }

  async createUser(userData: any) {
    try {
      this.logger.info('Creating new user', { userData: { ...userData, password: '[REDACTED]' } });
      // ... user creation logic
      this.logger.info('User created successfully', { userId: newUser.id });
    } catch (error) {
      this.logger.error('Failed to create user', error, { userData: { ...userData, password: '[REDACTED]' } });
      throw error;
    }
  }
}
```

### Logging Levels

```typescript
// Debug - Detailed information for debugging
logger.debug('Processing user request', { userId, requestData });

// Info - General information about system operation
logger.info('User logged in successfully', { userId });

// Warn - Warning messages for potentially harmful situations
logger.warn('Rate limit threshold reached', { userId, currentRate });

// Error - Error events that might still allow the application to continue running
logger.error('Failed to process payment', error, { orderId });

// Fatal - Very severe error events that might cause the application to terminate
logger.fatal('Database connection lost', error, { connectionString: '[REDACTED]' });
```

### Metadata Context

The logger automatically includes:
- Timestamp (UTC)
- Log Level
- Component name
- Correlation ID (from request context)
- Environment
- Application version
- Machine hostname

### Security Best Practices

1. Never log sensitive information:
   - Passwords
   - API keys
   - Authentication tokens
   - Credit card numbers
   - Personal identifiable information (PII)

2. Use redaction for sensitive fields:
```typescript
const sensitiveData = { username: 'john', password: 'secret', email: 'john@example.com' };
logger.info('User data', {
  userData: {
    ...sensitiveData,
    password: '[REDACTED]',
    email: '[REDACTED]'
  }
});
```

## Configuration

The logging service is configured in `logger.config.ts` with the following features:

- Multiple transport targets:
  - Console (colorized for development)
  - Rotating file system logs
  - SEQ logging system (if configured)

- Log rotation settings:
  - Maximum file size: 50MB
  - Retention period: 30 days
  - Compressed archives

- Environment-based log levels:
  - Development: 'debug'
  - Production: 'info'

## Environment Variables

```env
NODE_ENV=development
SEQ_SERVER_URL=http://seq-server:5341
SEQ_API_KEY=your-api-key
```
