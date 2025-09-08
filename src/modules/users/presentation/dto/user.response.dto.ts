import { ApiProperty } from '@nestjs/swagger';
import type { UserOutput } from '../../../../core/application/users/models/user.output';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  static fromOutput(output: UserOutput): UserResponseDto {
    return {
      id: output.id,
      email: output.email,
      firstName: output.firstName,
      lastName: output.lastName,
      createdAt: output.createdAt,
    };
  }
}
