import { Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { DriveService } from './drive.service';
import { GetFilesDto } from './dto/getFiles.dto';
import { UploadFilesDto } from './dto/uploadFile.dto';
import { DownloadFileDto } from './dto/downloadFile.dto';
import { UpdateFileDto } from './dto/updateFile.dto';
import { DeleteFileDto } from './dto/deleteFile.dto';

@Controller('drive')
export class DriveController {
    constructor(private driveService: DriveService) {}

    @Post()
    createDrive(@Query('usercode') usercode: number) {
        return this.driveService.createDrive(usercode);
    }

    @Get('')
    getDriveId(@Query('usercode') usercode: number) {
        return this.driveService.getDriveId(usercode);
    }

    @Get(':driveId')
    getFiles(@Param() GetFilesDto) {
        return this.driveService.getFiles(GetFilesDto);
    }
    
    @Get(':driveId/:fileId')
    downloadFile(@Param() DownloadFileDto) {
        return this.driveService.downloadFile(DownloadFileDto);
    }

    @Post(':driveId')
    uploadFile(@Param() UploadFilesDto) {
        return this.driveService.uploadFile(UploadFilesDto);
    }

    @Put(':driveId/:fileId')
    updateFile(@Param() UpdateFileDto) {
        return this.driveService.updateFile(UpdateFileDto);
    }

    @Delete(':driveId/:fileId')
    deleteFile(@Param() DeleteFileDto) {
        return this.driveService.deleteFile(DeleteFileDto);
    }
}
