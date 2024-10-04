import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto'
import { UserEntity } from 'src/user/entity/user.entity';
import { UserSignUpRequest } from 'src/user/dto/request/userSignUpRequest';
import { TokenEntity } from 'src/auth/entity/token.entity';
import { User } from 'src/auth/user';
import BsmOauth, { BsmOauthError, BsmOauthErrorType, BsmUserRole, BsmStudentResource, BsmTeacherResource } from 'bsm-oauth';

const { BSM_OAUTH_CLIENT_ID, BSM_OAUTH_CLIENT_SECRET, SECRET_KEY } = process.env;

@Injectable()
export class UserService {
    constructor(
        private jwtService: JwtService,
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
        @InjectRepository(TokenEntity) private tokenRepository: Repository<TokenEntity>
    ) {
        this.bsmOauth = new BsmOauth(BSM_OAUTH_CLIENT_ID, BSM_OAUTH_CLIENT_SECRET);
    }
  
    private bsmOauth: BsmOauth;

    async oauth(
        res: Response,
        authCode: string
    ) {

        let resource: BsmStudentResource | BsmTeacherResource;
        try {
            resource = await this.bsmOauth.getResource(
                await this.bsmOauth.getToken(authCode)
            );
        } catch (error) {
            if (error instanceof BsmOauthError) {
                switch (error.type) {
                    case BsmOauthErrorType.INVALID_CLIENT: {
                        throw new InternalServerErrorException('OAuth Failed');
                    }
                    case BsmOauthErrorType.AUTH_CODE_NOT_FOUND: {
                        throw new NotFoundException('Authcode not found');
                    }
                    case BsmOauthErrorType.TOKEN_NOT_FOUND: {
                        throw new NotFoundException('Token not found');
                    }
                }
            }
            throw new InternalServerErrorException('OAuth Failed');
        }
        
        let userInfo = await this.getUserBycode(resource.userCode);
        if (!userInfo) {
            await this.saveUser({
                code: resource.userCode,
                nickname: resource.nickname,
                name: resource.role === BsmUserRole.STUDENT? resource.student.name: resource.teacher.name
            });
            userInfo = await this.getUserBycode(resource.userCode);
            if (!userInfo) {
                throw new NotFoundException('User not Found');
            }
        }
        await this.login(res, userInfo);
        res.redirect('https://drive.bssm.app/drive');
    }

    private async login(
        res: Response,
        user: User
    ) {
        const token = this.jwtService.sign({...user}, {
            secret: SECRET_KEY,
            algorithm: 'HS256',
            expiresIn: '1h'
        });
        const refreshToken = this.jwtService.sign({
            refreshToken: (await this.createToken(user.code)).token
        }, {
            secret: SECRET_KEY,
            algorithm: 'HS256',
            expiresIn: '60d'
        });
        
        res.cookie('bsm_cloud_token', token, {
            path: '/',
            httpOnly: true,
            secure: true,
            maxAge: 1000*60*60
        });
        res.cookie('bsm_cloud_refresh_token', refreshToken, {
            path: '/',
            httpOnly: true,
            secure: true,
            maxAge: 24*60*1000*60*60
        });
        return {
            token,
            refreshToken: refreshToken
        }
    }

    private async saveUser(request: UserSignUpRequest) {
        const user = new UserEntity();
        user.code = request.code;
        user.nickname = request.nickname;
        await this.userRepository.save(user);
    }

    private async getUserBycode(userCode: number): Promise<UserEntity | undefined> {
        return this.userRepository.findOne({
            where: {
                code: userCode
            }
        })
    }

    private async createToken(userCode: number): Promise<TokenEntity> {
        const refreshToken = new TokenEntity();
        refreshToken.token = randomBytes(64).toString('hex');
        refreshToken.userCode = userCode;
        refreshToken.valid = true;
        refreshToken.createdAt = new Date;

        await this.tokenRepository.save(refreshToken);
        return refreshToken;
    }
}
