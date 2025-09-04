import { User } from '../../domain/entities/user';
import { UserDto } from '../dto/user.dto';

export class UserMapper {
    static toDto(user: User): UserDto {
        return UserDto.from(user);
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
