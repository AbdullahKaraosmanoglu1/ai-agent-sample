import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from './logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logger: LoggerService) {
        this.logger.setComponent('HTTP');
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, ip, headers } = request;
        const userAgent = headers['user-agent'];

        const requestMetadata = {
            method,
            url,
            ip,
            userAgent,
        };

        this.logger.info(`Incoming ${method} ${url}`, {
            ...requestMetadata,
            type: 'request',
        });

        const now = Date.now();
        return next.handle().pipe(
            tap({
                next: (response) => {
                    this.logger.info(`${method} ${url} completed`, {
                        ...requestMetadata,
                        type: 'response',
                        duration: Date.now() - now,
                        statusCode: context.switchToHttp().getResponse().statusCode,
                    });
                },
                error: (error) => {
                    this.logger.error(`${method} ${url} failed`, error, {
                        ...requestMetadata,
                        type: 'response',
                        duration: Date.now() - now,
                        statusCode: error.status || 500,
                    });
                },
            }),
        );
    }
}
