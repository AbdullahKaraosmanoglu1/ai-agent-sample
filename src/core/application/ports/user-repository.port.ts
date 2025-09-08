export interface FindAllParams {
  skip?: number;
  take?: number;
}
import { User } from '../../domain/entities/user';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(p?: FindAllParams): Promise<User[]>;
}
