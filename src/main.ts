import * as dotenv from 'dotenv';
dotenv.config({path: '.env'});
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.useStaticAssets(`${__dirname}/${process.env.STATIC_PATH}`);
  app.setBaseViewsDir(`${__dirname}/${process.env.VIEWS_PATH}/pages`);
  app.setViewEngine('ejs');
  await app.listen(4001);
}
bootstrap();
