import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
    @IsString()
    @IsOptional()
    refreshToken?: string; // From request body

    @IsString()
    @IsOptional()
    cookie?: string; // From cookie if using cookie-based refresh tokens
}
