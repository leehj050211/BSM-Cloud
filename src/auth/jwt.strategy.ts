import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from './user.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.cookies?.token;
                }
            ]),
            secretOrKey: process.env.SECRET_KEY
        })
    }

    async validate(payload: User) {
        if(payload.isLogin){
            return payload
        }else{
            throw new UnauthorizedException();
        }
    }
}