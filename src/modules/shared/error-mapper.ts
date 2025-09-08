import { UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common';
import { AppError } from '../../core/application/errors/app-error';

export function mapAppErrorToHttp(error: unknown): never {
    if (error instanceof AppError) {
        switch (error.message) {
            case 'AUTH_INVALID_CREDENTIALS':
            case 'AUTH_INVALID_REFRESH_TOKEN_FORMAT':
            case 'AUTH_INVALID_REFRESH_TOKEN':
                throw new UnauthorizedException('Unauthorized');
        }
    }
    throw error as any;
}


