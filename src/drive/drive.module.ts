import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'

import { DriveController } from './drive.controller';
import { DriveService } from './drive.service';
import { DriveRepository } from './repository/drive.repository';
import { FileRepository } from './repository/file.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DriveRepository, FileRepository])],
  controllers: [DriveController],
  providers: [DriveService]
})
export class DriveModule {}
