import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.useStaticAssets(`${__dirname}/public`);
  app.setBaseViewsDir(`${__dirname}/views/pages`);
  app.setViewEngine('ejs');
  await app.listen(4001);
}
bootstrap();
