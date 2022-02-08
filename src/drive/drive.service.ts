import { Injectable } from '@nestjs/common';
import { DeleteFileDto } from './dto/deleteFile.dto';
import { DownloadFileDto } from './dto/downloadFile.dto';
import { GetFilesDto } from './dto/getFiles.dto';
import { UpdateFileDto } from './dto/updateFile.dto';
import { UploadFilesDto } from './dto/uploadFile.dto';
import { file } from './file.model';

@Injectable()
export class DriveService {

    createDrive(userCode: string) {
        return;
    }

    getFiles(GetFilesDto: GetFilesDto): file[] {
        const {driveId} = GetFilesDto;
        return;
    }

    downloadFile(DownloadFileDto: DownloadFileDto) {
        const {driveId, fileId} = DownloadFileDto;
        return;
    }

    uploadFile(UploadFilesDto: UploadFilesDto) {
        const {driveId} = UploadFilesDto;
        return;
    }

    updateFile(UpdateFileDto: UpdateFileDto) {
        const {driveId, fileId} = UpdateFileDto;
        return;
    }

    deleteFile(DeleteFileDto: DeleteFileDto) {
        const {driveId, fileId} = DeleteFileDto;
        return;
    }
}
