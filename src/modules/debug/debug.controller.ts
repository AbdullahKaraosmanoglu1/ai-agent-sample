import { Controller, Get, Post, Query, Body, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { LoggerService } from '../../core/infrastructure/logging/logger.service';

interface SensitiveData {
    username: string;
    password: string;
    creditCard: string;
    email: string;
    personalInfo: {
        ssn: string;
        dateOfBirth: string;
    };
}

@Controller('_debug')
export class DebugController {
    constructor(private readonly logger: LoggerService) {
        this.logger.setComponent('DebugController');
    }

    @Get('logs')
    testAllLevels(@Headers('x-correlation-id') correlationId: string) {
        // Test all log levels
        this.logger.debug('This is a debug message', {
            testId: 'debug-level',
            correlationId
        });

        this.logger.info('This is an info message', {
            testId: 'info-level',
            correlationId
        });

        this.logger.warn('This is a warning message', {
            testId: 'warn-level',
            correlationId
        });

        this.logger.error('This is an error message', new Error('Test error'), {
            testId: 'error-level',
            correlationId
        });

        this.logger.fatal('This is a fatal message', new Error('Fatal test error'), {
            testId: 'fatal-level',
            correlationId
        });

        return { message: 'All log levels tested' };
    }

    @Get('error')
    testError() {
        try {
            // Simulate a deep error
            throw new Error('Simulated deep error for testing');
        } catch (error) {
            this.logger.error('Deep error occurred', error, {
                additionalContext: 'Error test endpoint'
            });
            throw new HttpException('Test error with stack trace', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('slow')
    async testPerformance(@Query('ms') milliseconds: string) {
        const startTime = process.hrtime();
        const delay = parseInt(milliseconds) || 500;

        // Simulate slow operation
        await new Promise(resolve => setTimeout(resolve, delay));

        const [seconds, nanoseconds] = process.hrtime(startTime);
        const duration = seconds * 1000 + nanoseconds / 1000000;

        this.logger.info('Slow operation completed', {
            operationType: 'slow-test',
            requestedDelay: delay,
            actualDuration: duration
        });

        if (duration > 1000) {
            this.logger.warn('Slow operation threshold exceeded', {
                threshold: 1000,
                actualDuration: duration
            });
        }

        return { duration };
    }

    @Post('masked')
    testDataMasking(@Body() sensitiveData: SensitiveData) {
        // Log with proper masking of sensitive data
        this.logger.info('Processing sensitive data', {
            data: {
                username: sensitiveData.username,
                password: '[REDACTED]',
                creditCard: '[REDACTED]',
                email: `${sensitiveData.email.substring(0, 2)}***@${sensitiveData.email.split('@')[1]}`,
                personalInfo: {
                    ssn: '[REDACTED]',
                    dateOfBirth: '[REDACTED]'
                }
            }
        });

        return { message: 'Sensitive data processed and logged with masking' };
    }
}
