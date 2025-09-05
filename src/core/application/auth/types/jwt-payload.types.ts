// Define base JWT payload interface with common JWT claims
export interface JwtPayloadBase {
    iss?: string;    // issuer
    sub?: string;    // subject
    aud?: string;    // audience
    exp?: number;    // expiration time
    nbf?: number;    // not before
    iat?: number;    // issued at
    jti?: string;    // JWT ID
}

export interface JwtAccessPayload extends JwtPayloadBase {
    sub: string;
}

export interface JwtRefreshPayload extends JwtPayloadBase {
    sub: string;
    jti: string;
}
