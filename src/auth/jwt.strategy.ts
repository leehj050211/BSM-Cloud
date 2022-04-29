import { HttpService, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from './user.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private httpService: HttpService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    return req?.cookies?.token || req?.cookies?.refreshToken;
                }
            ]),
            secretOrKey: process.env.SECRET_KEY,
            passReqToCallback: true,
        })
    }

    private readonly TOKEN_API_URL = 'https://bssm.kro.kr/api/account/token';
    async validate(req: Request, user: User) {
        if (
            typeof user.code != 'number' ||
            typeof user.level != 'number' ||
            typeof user.id != 'string' ||
            typeof user.nickname != 'string' ||
            typeof user.grade != 'number' ||
            typeof user.grade != 'number' ||
            typeof user.classNo != 'number' ||
            typeof user.studentNo != 'number' ||
            typeof user.name != 'string'
        ) {
            if (!(req?.cookies?.refreshToken)) {
                throw new UnauthorizedException();
            }
            try {
                const result = await this.httpService.post(this.TOKEN_API_URL, {
                    refreshToken: req.cookies.refreshToken
                }).toPromise();
                
                req.res.cookie('token', result.data.token, {
                    domain: '.bssm.kro.kr',
                    path: '/',
                    httpOnly: true,
                    secure: true,
                    maxAge: 1000*60*60// 1시간 동안 저장 1000ms*60초*60분
                });
                return result.data.user;
            } catch (err) {
                console.error(err);
                throw new UnauthorizedException();
            }
        } else {
            return user;
        }
    }
}