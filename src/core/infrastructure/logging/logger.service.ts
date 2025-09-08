import { Injectable } from '@nestjs/common';
import { createLogger, Logger as WinstonLogger } from 'winston';
import loggerConfig from './logger.config';
import { ClsService } from 'nestjs-cls';

export interface LogMetadata {
  component?: string;
  correlationId?: string;
  [key: string]: any;
}

@Injectable()
export class LoggerService {
  private logger: WinstonLogger;
  private component?: string;

  constructor(private readonly cls: ClsService) {
    this.logger = createLogger(loggerConfig);
  }

  setComponent(component: string): void {
    this.component = component;
  }

  private buildMetadata(metadata: LogMetadata = {}): LogMetadata {
    return {
      component: this.component || metadata.component || 'unknown',
      correlationId:
        (this.cls.get('correlationId') as string | undefined) ||
        metadata.correlationId ||
        'no-correlation-id',
      ...metadata,
    };
  }

  debug(message: string, metadata: LogMetadata = {}): void {
    this.logger.debug(message, this.buildMetadata(metadata));
  }

  info(message: string, metadata: LogMetadata = {}): void {
    this.logger.info(message, this.buildMetadata(metadata));
  }

  warn(message: string, metadata: LogMetadata = {}): void {
    this.logger.warn(message, this.buildMetadata(metadata));
  }

  error(message: string, error?: Error, metadata: LogMetadata = {}): void {
    const errorMetadata = {
      ...this.buildMetadata(metadata),
      error: error
        ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
        : undefined,
    };
    this.logger.error(message, errorMetadata);
  }

  fatal(message: string, error?: Error, metadata: LogMetadata = {}): void {
    const errorMetadata = {
      ...this.buildMetadata(metadata),
      error: error
        ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
        : undefined,
    };
    this.logger.log('fatal', message, errorMetadata);
  }
}
