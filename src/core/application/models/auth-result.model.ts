export interface AuthResult {
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // access token expiration in seconds
}
