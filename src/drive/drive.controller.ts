import { Body, Controller, Delete, Get, Param, ParseBoolPipe, Post, Put, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DriveService } from './drive.service';
import JwtAuthGuard from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/getUser.decorator';
import { User } from 'src/auth/user';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileMulterOption } from './file.multerOption';
import { Response } from 'express';

@Controller('api/drive')
@UseGuards(JwtAuthGuard)
export class DriveController {
    constructor(private driveService: DriveService) {}

    @Post()
    createDrive(@GetUser() user: User) {
        return this.driveService.createDrive(user.code);
    }

    @Get()
    getDrive(@GetUser() user: User) {
        return this.driveService.getDrive(user.code);
    }

    @Get(':driveId/:folderId')
    getFileList(
        @GetUser() user: User,
        @Param() FolderDto
    ) {
        return this.driveService.getFileList(user.code, FolderDto);
    }
    
    @Get(':driveId/:folderId/:fileId')
    downloadFile(
        @Res() res: Response,
        @GetUser() user: User,
        @Param() FileDto
    ) {
        return this.driveService.downloadFile(res, user.code, FileDto);
    }

    @UseInterceptors(FileInterceptor('file', FileMulterOption))
    @Post('upload/:driveId/:folderId')
    uploadFile(
        @GetUser() user: User,
        @Param() FolderDto,
        @UploadedFile() inputFile
    ) {
        return this.driveService.uploadFile(user.code, FolderDto, inputFile);
    }

    @UseInterceptors(FileInterceptor('file', FileMulterOption))
    @Put('upload/:driveId/:folderId/:fileId')
    updateFile(
        @GetUser() user: User,
        @Param() FileDto,
        @UploadedFile() inputFile
    ) {
        return this.driveService.updateFile(user.code, FileDto, inputFile);
    }

    @Delete(':driveId/:folderId/:fileId')
    deleteFile(
        @GetUser() user: User,
        @Param() FileDto
    ) {
        return this.driveService.deleteFile(user.code, FileDto);
    }

    @Post('move/:driveId/:folderId/:fileId')
    moveFile(
        @GetUser() user: User,
        @Param() FileDto,
        @Body('newFolderId') newFolderId: string
    ) {
        return this.driveService.moveFile(user.code, FileDto, newFolderId);
    }

    @Post('share/:driveId/:folderId/:fileId')
    shareFile(
        @GetUser() user: User,
        @Param() FileDto,
        @Body('share', ParseBoolPipe) share: boolean
    ) {
        return this.driveService.shareFile(user.code, FileDto, share);
    }

    @Post('code/:driveId/:folderId/:fileId')
    shareCode(
        @GetUser() user: User,
        @Param() FileDto,
    ) {
        return this.driveService.shareCode(user.code, FileDto);
    }

    @Post('folder/:driveId/:folderId')
    createFolder(
        @GetUser() user: User,
        @Param() FolderDto,
        @Body('folderName') folderName
    ) {
        return this.driveService.createFolder(user.code, FolderDto, folderName);
    }

    @Post('move/:driveId/:folderId')
    moveFolder(
        @GetUser() user: User,
        @Param() FolderDto,
        @Body('newFolderId') newFolderId: string
    ) {
        return this.driveService.moveFolder(user.code, FolderDto, newFolderId);
    }
}
