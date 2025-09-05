export class RefreshToken {
    constructor(
        public readonly id: string, // jti - JWT Token ID
        public readonly userId: string,
        public readonly expiresAt: Date,
        public readonly revoked: boolean,
        public readonly createdAt: Date
    ) { }

    static createNew(
        jti: string,
        userId: string,
        expiresAt: Date,
    ): RefreshToken {
        return new RefreshToken(
            jti,
            userId,
            expiresAt,
            false, // not revoked when created
            new Date()
        );
    }

    static rehydrate(data: {
        id: string;
        userId: string;
        expiresAt: Date;
        revoked: boolean;
        createdAt: Date;
    }): RefreshToken {
        return new RefreshToken(
            data.id,
            data.userId,
            data.expiresAt,
            data.revoked,
            data.createdAt
        );
    }

    revoke(): RefreshToken {
        return new RefreshToken(
            this.id,
            this.userId,
            this.expiresAt,
            true, // revoked
            this.createdAt
        );
    }

    isValid(): boolean {
        return !this.revoked && this.expiresAt > new Date();
    }
}
