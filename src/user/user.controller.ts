import { Controller, Get, Res, UseGuards, Query } from '@nestjs/common';
import { Response } from 'express';
import JwtAuthGuard from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/getUser.decorator';
import { User } from 'src/auth/user';
import { UserService } from './user.service';

@Controller('api/user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('oauth/bsm')
    oauth(
        @Res({passthrough: true}) res: Response,
        @Query('code') authCode: string
    ) {
        return this.userService.oauth(res, authCode);
    }

    @Get('/')
    @UseGuards(JwtAuthGuard)  
    getUserInfo(@GetUser() user: User) {
        return user;
    }
}
