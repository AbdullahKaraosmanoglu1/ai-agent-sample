export interface JwtPayloadBase {
    iss?: string;
    sub?: string;
    aud?: string;
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
}

export interface JwtAccessPayload extends JwtPayloadBase {
    sub: string;
}

export interface JwtRefreshPayload extends JwtPayloadBase {
    sub: string;
    jti: string;
}
