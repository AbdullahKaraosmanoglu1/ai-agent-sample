import type { RefreshToken } from '../../domain/entities/refresh-token';

export interface IRefreshTokenRepository {
    create(token: RefreshToken): Promise<RefreshToken>;
    findByJti(jti: string): Promise<RefreshToken | null>;
    revoke(jti: string): Promise<void>;
    revokeAllForUser(userId: string): Promise<void>;
    cleanup(): Promise<void>;
}
