export interface LoggerMetadata {
    component?: string;
    correlationId?: string;
    [key: string]: any;
}

export interface ILogger {
    setComponent(component: string): void;
    debug(message: string, metadata?: LoggerMetadata): void;
    info(message: string, metadata?: LoggerMetadata): void;
    warn(message: string, metadata?: LoggerMetadata): void;
    error(message: string, error?: Error, metadata?: LoggerMetadata): void;
    fatal(message: string, error?: Error, metadata?: LoggerMetadata): void;
}


