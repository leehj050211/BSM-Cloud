import { Body, Controller, Delete, Get, Param, ParseBoolPipe, Post, Put, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DriveService } from './drive.service';
import { DriveDto } from './dto/drive.dto';
import { FileDto } from './dto/file.dto';
import JwtAuthGuard from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/getUser.decorator';
import { User } from 'src/auth/user.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileMulterOption } from './file.multerOption';
import { Response } from 'express';
import { FolderDto } from './dto/folder.dto';

@Controller('api/drive')
@UseGuards(JwtAuthGuard)
export class DriveController {
    constructor(private driveService: DriveService) {}

    @Post()
    createDrive(@GetUser() user: User) {
        return this.driveService.createDrive(user.memberCode);
    }

    @Get()
    getDrive(@GetUser() user: User) {
        return this.driveService.getDrive(user.memberCode);
    }

    @Get(':driveId/:folderId?')
    getFileList(
        @GetUser() user: User,
        @Param() DriveDto
    ) {
        return this.driveService.getFileList(user.memberCode, DriveDto);
    }
    
    @Get(':driveId/:folderId?/:fileId')
    downloadFile(
        @Res() res: Response,
        @GetUser() user: User,
        @Param() FileDto
    ) {
        return this.driveService.downloadFile(res, user.memberCode, FileDto);
    }

    @UseInterceptors(FileInterceptor('file', FileMulterOption))
    @Post('upload/:driveId')
    uploadFile(
        @GetUser() user: User,
        @Param() DriveDto,
        @UploadedFile() inputFile
    ) {
        return this.driveService.uploadFile(user.memberCode, DriveDto, inputFile);
    }

    @UseInterceptors(FileInterceptor('file', FileMulterOption))
    @Put('upload/:driveId/:fileId')
    updateFile(
        @GetUser() user: User,
        @Param() FileDto,
        @UploadedFile() inputFile
    ) {
        return this.driveService.updateFile(user.memberCode, FileDto, inputFile);
    }

    @Delete(':driveId/:fileId')
    deleteFile(
        @GetUser() user: User,
        @Param() FileDto
    ) {
        return this.driveService.deleteFile(user.memberCode, FileDto);
    }

    @Post('share/:driveId/:fileId')
    shareFile(
        @GetUser() user: User,
        @Param() FileDto,
        @Body('share', ParseBoolPipe) share: boolean
    ) {
        return this.driveService.shareFile(user.memberCode, FileDto, share);
    }

    @Post('code/:driveId/:fileId')
    shareCode(
        @GetUser() user: User,
        @Param() FileDto,
    ) {
        return this.driveService.shareCode(user.memberCode, FileDto);
    }

    @Post('folder/:driveId/:folderId?')
    createFolder(
        @GetUser() user: User,
        @Param() FolderDto,
        @Body('folderName') folderName
    ) {
        return this.driveService.createFolder(user.memberCode, FolderDto, folderName);
    }

    // @Put('upload/:driveId/:fileId')
    // updateFolder(
    //     @GetUser() user: User,
    //     @Param() FileDto,
    //     @Body('folderName')
    // ) {
    //     return this.driveService.updateFile(user.memberCode, FileDto, inputFile);
    // }
}
