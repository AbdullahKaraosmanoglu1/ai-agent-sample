export interface TokenPayload {
    sub: string;
    jti?: string;
}

export interface RefreshTokenResult {
    token: string;
    expiresIn: number;
}

export interface TokenVerifyResult {
    sub: string;
    jti?: string;
}

export interface ITokenService {
    signAccessToken(payload: TokenPayload): Promise<string>;
    signRefreshToken(payload: TokenPayload): Promise<string>;
    verifyAccessToken(token: string): Promise<TokenVerifyResult>;
    verifyRefreshToken(token: string): Promise<TokenVerifyResult>;
    getAccessTokenTtlSeconds(): number;
}
