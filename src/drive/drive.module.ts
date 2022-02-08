import { Module } from '@nestjs/common';
import { DriveController } from './drive.controller';
import { DriveService } from './drive.service';

@Module({
  controllers: [DriveController],
  providers: [DriveService]
})
export class DriveModule {}
