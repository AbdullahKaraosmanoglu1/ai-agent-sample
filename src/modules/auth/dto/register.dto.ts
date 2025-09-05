import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'The email address for registration',
        format: 'email'
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'YourSecurePassword123!',
        description: 'The password for registration',
        minimum: 6,
        format: 'password'
    })
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({
        example: 'John',
        description: 'The first name of the user'
    })
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({
        example: 'Doe',
        description: 'The last name of the user'
    })
    @IsNotEmpty()
    lastName: string;
}
