import { User } from '../../domain/entities/user';

export class UserDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: Date;

    static from(entity: User): UserDto {
        return {
            id: entity.id,
            email: entity.email,
            firstName: entity.firstName,
            lastName: entity.lastName,
            createdAt: entity.createdAt,
        };
    }
}
