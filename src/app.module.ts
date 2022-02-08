import { Module } from '@nestjs/common';
import { DriveModule } from './drive/drive.module';

@Module({
  imports: [DriveModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
