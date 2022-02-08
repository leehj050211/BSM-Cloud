import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'

import { DriveController } from './drive.controller';
import { DriveService } from './drive.service';
import { Drive } from './entity/drive.entity';
import { File } from './entity/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Drive, File])],
  controllers: [DriveController],
  providers: [DriveService]
})
export class DriveModule {}
