import { UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common';
import { AppErrorCodes } from '../../core/application/errors/codes';

export function mapAppErrorToHttp(error: unknown): never {
    const message = (error as any)?.message;
    switch (message) {
        case AppErrorCodes.AUTH_INVALID_CREDENTIALS:
        case AppErrorCodes.AUTH_INVALID_REFRESH_TOKEN_FORMAT:
        case AppErrorCodes.AUTH_INVALID_REFRESH_TOKEN:
            throw new UnauthorizedException('Unauthorized');
        case AppErrorCodes.USER_NOT_FOUND:
            throw new NotFoundException('User not found');
        case AppErrorCodes.USER_EMAIL_EXISTS:
            throw new ConflictException('Email already exists');
        default:
            throw error as any;
    }
}


