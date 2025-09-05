import { Module, Global } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { LoggerService } from './logger.service';
import { randomUUID } from 'crypto';

@Global()
@Module({
    imports: [
        ClsModule.forRoot({
            middleware: {
                mount: true,
                generateId: true,
                idGenerator: (req: Request) => {
                    return req.headers['x-correlation-id'] as string || randomUUID();
                },
            },
        }),
    ],
    providers: [LoggerService],
    exports: [LoggerService],
})
export class LoggingModule { }
