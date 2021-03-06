import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'

import { DriveController } from './drive.controller';
import { DriveService } from './drive.service';
import { DriveUtil } from './drive.util';
import { DriveRepository } from './repository/drive.repository';
import { FileRepository } from './repository/file.repository';
import { FolderRepository } from './repository/folder.repository';
import { ShareRepository } from './repository/shareCode.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DriveRepository, FileRepository, ShareRepository, FolderRepository])],
  controllers: [DriveController],
  providers: [DriveService, DriveUtil]
})
export class DriveModule {}
