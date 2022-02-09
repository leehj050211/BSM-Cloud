import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteFileDto } from './dto/deleteFile.dto';
import { DownloadFileDto } from './dto/downloadFile.dto';
import { GetFilesDto } from './dto/getFiles.dto';
import { UpdateFileDto } from './dto/updateFile.dto';
import { UploadFilesDto } from './dto/uploadFile.dto';
import { DriveRepository } from './repository/drive.repository';
import { FileRepository } from './repository/file.repository';

import * as fs from 'fs'

@Injectable()
export class DriveService {

    constructor(
        @InjectRepository(DriveRepository)
        private driveRepository: DriveRepository,
        @InjectRepository(FileRepository)
        private fileRepository: FileRepository
    ) {}

    async createDrive(usercode: number){
        const drive = await this.driveRepository.createDrive(usercode);
        const driveId: string = drive.id.toString('hex')

        try{
            await fs.promises.mkdir(`${__dirname}/../public/drive/${driveId}`); 
        }catch (error){
            console.error(error)
            throw new InternalServerErrorException('Failed to create drive')
        }

        await this.driveRepository.save(drive);
        return;
    }

    async getDriveId(usercode: number) {
        const driveId = await this.driveRepository.getDriveByUsercode(usercode);
        if(!driveId){
            throw new NotFoundException()
        }
        return {
            driveId: driveId.id.toString('hex')
        }
    }

    getFiles(usercode: number, GetFilesDto: GetFilesDto) {
        const {driveId} = GetFilesDto;
        return;
    }

    downloadFile(usercode: number, DownloadFileDto: DownloadFileDto) {
        const {driveId, fileId} = DownloadFileDto;
        return;
    }

    uploadFile(usercode: number, UploadFilesDto: UploadFilesDto) {
        const {driveId} = UploadFilesDto;
        return;
    }

    updateFile(usercode: number, UpdateFileDto: UpdateFileDto) {
        const {driveId, fileId} = UpdateFileDto;
        return;
    }

    deleteFile(usercode: number, DeleteFileDto: DeleteFileDto) {
        const {driveId, fileId} = DeleteFileDto;
        return;
    }
}
