import { Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { file } from './file.model';
import { DriveService } from './drive.service';
import { getFilesDto } from './dto/getFiles.dto';
import { uploadFilesDto } from './dto/uploadFile.dto';
import { downloadFileDto } from './dto/downloadFile.dto';
import { updateFileDto } from './dto/updateFile.dto';
import { deleteFileDto } from './dto/deleteFile.dto';

@Controller('drive/:driveId')
export class DriveController {
    constructor(private driveService: DriveService) {}

    @Get()
    getFiles(@Param() getFilesDto): file[] {
        return this.driveService.getFiles(getFilesDto)
    }
    
    @Get(':fileId')
    downloadFile(@Param() downloadFileDto) {
        return this.driveService.downloadFile(downloadFileDto)
    }

    @Post()
    uploadFile(@Param() uploadFilesDto) {
        return this.driveService.uploadFile(uploadFilesDto)
    }

    @Put(':fileId')
    updateFile(@Param() updateFileDto) {
        return this.driveService.updateFile(updateFileDto)
    }

    @Delete(':fileId')
    deleteFile(@Param() deleteFileDto) {
        return this.driveService.deleteFile(deleteFileDto)
    }
}
