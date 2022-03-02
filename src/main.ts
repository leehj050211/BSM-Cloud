import * as dotenv from 'dotenv';
dotenv.config({path: '.env'});
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import * as helmet from 'helmet';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // 보안설정
  app.use(helmet.dnsPrefetchControl());
  app.use(helmet.expectCt());
  app.use(helmet.frameguard());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.hsts());
  app.use(helmet.ieNoOpen());
  app.use(helmet.noSniff());
  app.use(helmet.permittedCrossDomainPolicies());
  app.use(helmet.referrerPolicy());
  app.use(helmet.xssFilter());

  app.use(cookieParser());
  app.useStaticAssets(`${__dirname}/${process.env.STATIC_PATH}`);
  app.setBaseViewsDir(`${__dirname}/${process.env.VIEWS_PATH}/pages`);
  app.setViewEngine('ejs');
  await app.listen(4001);
}
bootstrap();
