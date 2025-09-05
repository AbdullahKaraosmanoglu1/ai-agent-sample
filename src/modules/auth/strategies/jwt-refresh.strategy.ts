import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(private readonly config: ConfigService) {
        const secret = config.get<string>('JWT_REFRESH_SECRET');
        if (!secret) throw new Error('JWT_REFRESH_SECRET is not defined');

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
            issuer: config.get<string>('JWT_ISSUER'),
            audience: config.get<string>('JWT_AUDIENCE'),
        });
    }

    validate(payload: any) {
        // Return the payload which will be available in the Request
        return payload;
    }
}
