import { Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DriveService } from './drive.service';
import { GetFileListDto } from './dto/getFileList.dto';
import { UploadFilesDto } from './dto/uploadFile.dto';
import { DownloadFileDto } from './dto/downloadFile.dto';
import { UpdateFileDto } from './dto/updateFile.dto';
import { DeleteFileDto } from './dto/deleteFile.dto';
import JwtAuthGuard from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/getUser.decorator';
import { User } from 'src/auth/user.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileMulterOption } from './file.multerOption';

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
    getFileList(
        @GetUser() user: User,
        @Param() GetFileListDto
    ) {
        return this.driveService.getFileList(user.memberCode, GetFileListDto);
    }
    
    @Get(':driveId/:fileId')
    downloadFile(
        @GetUser() user: User,
        @Param() DownloadFileDto
    ) {
        return this.driveService.downloadFile(user.memberCode, DownloadFileDto);
    }

    @UseInterceptors(FileInterceptor('file', FileMulterOption))
    @Post(':driveId')
    uploadFile(
        @GetUser() user: User,
        @Param() UploadFilesDto,
        @UploadedFile() inputFile
    ) {
        return this.driveService.uploadFile(user.memberCode, UploadFilesDto, inputFile);
    }

    @UseInterceptors(FileInterceptor('file', FileMulterOption))
    @Put(':driveId/:fileId')
    updateFile(
        @GetUser() user: User,
        @Param() UpdateFileDto,
        @UploadedFile() inputFile
    ) {
        return this.driveService.updateFile(user.memberCode, UpdateFileDto, inputFile);
    }

    @Delete(':driveId/:fileId')
    deleteFile(
        @GetUser() user: User,
        @Param() DeleteFileDto
    ) {
        return this.driveService.deleteFile(user.memberCode, DeleteFileDto);
    }
}
