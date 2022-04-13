import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriveUtil } from 'src/drive/drive.util';
import { DriveRepository } from 'src/drive/repository/drive.repository';
import { FileRepository } from 'src/drive/repository/file.repository';
import { FolderRepository } from 'src/drive/repository/folder.repository';
import { ShareRepository } from 'src/drive/repository/shareCode.repository';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';

@Module({
  imports: [TypeOrmModule.forFeature([DriveRepository, FileRepository, FolderRepository, ShareRepository])],
  controllers: [ShareController],
  providers: [ShareService, DriveUtil]
})
export class ShareModule {}
