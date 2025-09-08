import { LoggerOptions, format } from 'winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as os from 'os';
import * as path from 'path';

const { combine, timestamp, printf, colorize, json } = format;

const appVersion = require('../../../../package.json').version;

export const logLevels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
};

const customFormat = printf(({ level, message, timestamp, ...metadata }) => {
    const logObject = {
        timestamp,
        level,
        message,
        ...metadata,
        environment: process.env.NODE_ENV || 'development',
        version: appVersion,
        hostname: os.hostname(),
    };
    return JSON.stringify(logObject);
});

const fileRotateTransport = new winston.transports.DailyRotateFile({
    filename: path.join('logs', 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '50m',
    maxFiles: '30d',
    zippedArchive: true,
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        json(),
    ),
});

const consoleTransport = new winston.transports.Console({
    format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        customFormat,
    ),
});

const seqTransport = process.env.SEQ_SERVER_URL
    ? new winston.transports['@datalust/winston-seq']({
        serverUrl: process.env.SEQ_SERVER_URL,
        apiKey: process.env.SEQ_API_KEY,
        handleExceptions: true,
        handleRejections: true,
    })
    : null;

export const loggerConfig: LoggerOptions = {
    levels: logLevels,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transports: [
        consoleTransport,
        fileRotateTransport,
        ...(seqTransport ? [seqTransport] : []),
    ],

    handleExceptions: true,
    handleRejections: true,

    exitOnError: false,
};
