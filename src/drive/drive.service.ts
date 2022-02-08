import { Injectable } from '@nestjs/common';
import { deleteFileDto } from './dto/deleteFile.dto';
import { downloadFileDto } from './dto/downloadFile.dto';
import { getFilesDto } from './dto/getFiles.dto';
import { updateFileDto } from './dto/updateFile.dto';
import { uploadFilesDto } from './dto/uploadFile.dto';
import { file } from './file.model';

@Injectable()
export class DriveService {

    getFiles(getFilesDto: getFilesDto): file[] {
        const {driveId} = getFilesDto;
        return;
    }

    downloadFile(downloadFileDto: downloadFileDto) {
        const {driveId, fileId} = downloadFileDto;
        return;
    }

    uploadFile(uploadFilesDto: uploadFilesDto) {
        const {driveId} = uploadFilesDto;
        return;
    }

    updateFile(updateFileDto: updateFileDto) {
        const {driveId, fileId} = updateFileDto;
        return;
    }

    deleteFile(deleteFileDto: deleteFileDto) {
        const {driveId, fileId} = deleteFileDto;
        return;
    }
}
