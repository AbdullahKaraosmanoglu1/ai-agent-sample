import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IUserRepository } from '../../application/ports/user-repository.port';
import { User } from '../../domain/entities/user';
import { UserMapper } from '../../application/users/mapping/user.mapper';

@Injectable()
export class UserPrismaRepository implements IUserRepository {
  constructor(private readonly db: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const r = await this.db.user.findUnique({ where: { id } });
    return r ? UserMapper.toDomain(r) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const r = await this.db.user.findUnique({ where: { email } });
    return r ? UserMapper.toDomain(r) : null;
  }

  async create(user: User): Promise<User> {
    const created = await this.db.user.create({
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
    return UserMapper.toDomain(created);
  }

  async update(user: User): Promise<User> {
    const updated = await this.db.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
    return UserMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.db.user.delete({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    const users = await this.db.user.findMany();
    return users.map(UserMapper.toDomain);
  }
}
