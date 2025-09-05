export interface ITokenService {
    signAccessToken(payload: { sub: string }): Promise<string>;
    signRefreshToken(payload: { sub: string; jti: string }): Promise<string>;
    verifyAccessToken(token: string): Promise<{ sub: string }>;
    verifyRefreshToken(token: string): Promise<{ sub: string; jti: string }>;
}
