import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { IRefreshTokenRepository } from '../../application/ports/refresh-token-repository.port';
import { RefreshToken } from '../../domain/entities/refresh-token';

@Injectable()
export class RefreshTokenPrismaRepository implements IRefreshTokenRepository {
    constructor(private readonly db: PrismaService) { }

    async create(token: RefreshToken): Promise<RefreshToken> {
        const created = await this.db.refreshToken.create({
            data: {
                id: token.id,
                userId: token.userId,
                expiresAt: token.expiresAt,
                revoked: token.revoked,
            },
        });

        return RefreshToken.rehydrate({
            id: created.id,
            userId: created.userId,
            expiresAt: created.expiresAt,
            revoked: created.revoked,
            createdAt: created.createdAt,
        });
    }

    async findByJti(jti: string): Promise<RefreshToken | null> {
        const token = await this.db.refreshToken.findUnique({
            where: { id: jti },
        });

        if (!token) return null;

        return RefreshToken.rehydrate({
            id: token.id,
            userId: token.userId,
            expiresAt: token.expiresAt,
            revoked: token.revoked,
            createdAt: token.createdAt,
        });
    }

    async revoke(jti: string): Promise<void> {
        await this.db.refreshToken.update({
            where: { id: jti },
            data: { revoked: true },
        });
    }

    async revokeAllForUser(userId: string): Promise<void> {
        await this.db.refreshToken.updateMany({
            where: { userId },
            data: { revoked: true },
        });
    }

    async cleanup(): Promise<void> {
        const now = new Date();
        await this.db.refreshToken.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: now } },
                    { revoked: true },
                ],
            },
        });
    }
}
