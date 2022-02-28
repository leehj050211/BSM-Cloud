import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'

import { DriveController } from './drive.controller';
import { DriveService } from './drive.service';
import { DriveRepository } from './repository/drive.repository';
import { FileRepository } from './repository/file.repository';
import { ShareRepository } from './repository/shareCode.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DriveRepository, FileRepository, ShareRepository])],
  controllers: [DriveController],
  providers: [DriveService]
})
export class DriveModule {}
