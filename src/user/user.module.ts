import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { TokenEntity } from 'src/auth/entity/token.entity';
import { UserEntity } from 'src/user/entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, TokenEntity]),
    JwtModule.register({
        secret: process.env.SECRET_KEY
    })
  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
