import { User } from '../../../domain/entities/user';
import { UserOutput } from '../models/user.output';

export class UserMapper {
  static toOutput(user: User): UserOutput {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    };
  }

  static toDomain(raw: any): User {
    return User.rehydrate({
      id: raw.id,
      email: raw.email,
      passwordHash: raw.passwordHash,
      firstName: raw.firstName,
      lastName: raw.lastName,
      createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    });
  }
}
