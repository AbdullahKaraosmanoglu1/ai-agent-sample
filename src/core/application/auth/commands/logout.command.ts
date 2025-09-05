export class LogoutCommand {
    constructor(
        public readonly userId: string,
        public readonly refreshTokenJti?: string, // If not provided, all tokens will be revoked
    ) { }
}
