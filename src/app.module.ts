import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DriveModule } from './drive/drive.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      username: process.env.DB_USER,
      password: process.env.DB_PW,
      database: process.env.DB_NAME,
      synchronize: true,
      logging: true,
      entities: [__dirname + '/**/entity/*.entity.{js,ts}']
    }),
    DriveModule,
    AuthModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
