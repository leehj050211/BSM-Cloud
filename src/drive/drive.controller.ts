import { Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { DriveService } from './drive.service';
import { GetFilesDto } from './dto/getFiles.dto';
import { UploadFilesDto } from './dto/uploadFile.dto';
import { DownloadFileDto } from './dto/downloadFile.dto';
import { UpdateFileDto } from './dto/updateFile.dto';
import { DeleteFileDto } from './dto/deleteFile.dto';
import JwtAuthGuard from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/getUser.decorator';
import { User } from 'src/auth/user.model';

@Controller('api/drive')
@UseGuards(JwtAuthGuard)
export class DriveController {
    constructor(private driveService: DriveService) {}

    @Post()
    createDrive(@GetUser() user: User) {
        return this.driveService.createDrive(user.memberCode);
    }

    @Get('')
    getDriveId(@GetUser() user: User) {
        return this.driveService.getDriveId(user.memberCode);
    }

    @Get(':driveId')
    getFiles(
        @GetUser() user: User,
        @Param() GetFilesDto
    ) {
        return this.driveService.getFiles(user.memberCode, GetFilesDto);
    }
    
    @Get(':driveId/:fileId')
    downloadFile(
        @GetUser() user: User,
        @Param() DownloadFileDto
    ) {
        return this.driveService.downloadFile(user.memberCode, DownloadFileDto);
    }

    @Post(':driveId')
    uploadFile(
        @GetUser() user: User,
        @Param() UploadFilesDto
    ) {
        return this.driveService.uploadFile(user.memberCode, UploadFilesDto);
    }

    @Put(':driveId/:fileId')
    updateFile(
        @GetUser() user: User,
        @Param() UpdateFileDto
    ) {
        return this.driveService.updateFile(user.memberCode, UpdateFileDto);
    }

    @Delete(':driveId/:fileId')
    deleteFile(
        @GetUser() user: User,
        @Param() DeleteFileDto
    ) {
        return this.driveService.deleteFile(user.memberCode, DeleteFileDto);
    }
}
