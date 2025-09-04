import { Injectable } from '@nestjs/common';
import { IPasswordHasher } from '../../application/ports/password-hasher.port';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
    private readonly SALT_ROUNDS = 10;

    async hash(plain: string): Promise<string> {
        return bcrypt.hash(plain, this.SALT_ROUNDS);
    }

    async verify(plain: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(plain, hashed);
    }
}
