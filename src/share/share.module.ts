import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileRepository } from 'src/drive/repository/file.repository';
import { ShareRepository } from 'src/drive/repository/shareCode.repository';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileRepository, ShareRepository])],
  controllers: [ShareController],
  providers: [ShareService]
})
export class ShareModule {}
