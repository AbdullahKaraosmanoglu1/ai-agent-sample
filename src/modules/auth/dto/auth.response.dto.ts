import { ApiProperty } from '@nestjs/swagger';
import type { AuthResult } from '../../../core/application/models/auth-result.model';

export class AuthResponseDto {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken: string;

    @ApiProperty({ example: 900 })
    expiresIn: number;

    static fromResult(result: AuthResult): AuthResponseDto {
        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresIn: result.expiresIn,
        };
    }
}


