import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import type { ILogger, LoggerMetadata } from '../../application/ports/logger.port';

@Injectable()
export class LoggerAdapter implements ILogger {
    constructor(private readonly logger: LoggerService) { }

    setComponent(component: string): void {
        this.logger.setComponent(component);
    }
    debug(message: string, metadata?: LoggerMetadata): void {
        this.logger.debug(message, metadata);
    }
    info(message: string, metadata?: LoggerMetadata): void {
        this.logger.info(message, metadata);
    }
    warn(message: string, metadata?: LoggerMetadata): void {
        this.logger.warn(message, metadata);
    }
    error(message: string, error?: Error, metadata?: LoggerMetadata): void {
        this.logger.error(message, error, metadata);
    }
    fatal(message: string, error?: Error, metadata?: LoggerMetadata): void {
        this.logger.fatal(message, error, metadata);
    }
}


