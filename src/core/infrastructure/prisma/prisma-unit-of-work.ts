import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import type { IUnitOfWork } from '../../application/ports/unit-of-work.port';

@Injectable()
export class PrismaUnitOfWork implements IUnitOfWork {
    constructor(private readonly db: PrismaService) { }

    async run<T>(work: () => Promise<T>): Promise<T> {
        return this.db.$transaction(async () => {
            return work();
        });
    }
}


