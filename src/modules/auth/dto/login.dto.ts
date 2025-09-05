import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'The email address for login',
        format: 'email'
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'YourPassword123!',
        description: 'The password for login',
        minimum: 6,
        format: 'password'
    })
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}
