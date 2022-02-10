import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteFileDto } from './dto/deleteFile.dto';
import { DownloadFileDto } from './dto/downloadFile.dto';
import { GetFileListDto } from './dto/getFileList.dto';
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
        const driveId: string = drive.id.toString('hex');

        try{
            await fs.promises.mkdir(`${__dirname}/../public/drive/${driveId}`); 
        }catch(error){
            console.error(error);
            throw new InternalServerErrorException('Failed to create drive');
        }

        await this.driveRepository.save(drive);
        return;
    }

    async getDriveId(usercode: number) {
        const result = await this.driveRepository.getDriveByUsercode(usercode);
        if(!result){
            throw new NotFoundException('Drive not found');
        }

        const driveId = result.id.toString('hex');
        return {
            driveId: driveId
        }
    }

    getFileList(usercode: number, GetFilesDto: GetFileListDto) {
        const {driveId} = GetFilesDto;
        return;
    }

    downloadFile(usercode: number, DownloadFileDto: DownloadFileDto) {
        const {driveId, fileId} = DownloadFileDto;
        return;
    }

    async uploadFile(usercode: number, UploadFilesDto: UploadFilesDto, inputFile) {
        const {driveId: inputDriveId} = UploadFilesDto;
        // driveId check
        const result = await this.driveRepository.getDriveByUsercode(usercode);
        if(!result){
            throw new NotFoundException('Drive not found');
        }
        const driveId = result.id.toString('hex');
        if(inputDriveId !== driveId){
            throw new BadRequestException(`Drive doesn't match`);
        }
        const file = await this.fileRepository.uploadFile(driveId, usercode, inputFile.originalname, inputFile.filename, new Date());
        const fileId: string = file.fileId.toString('hex')

        try{
            await fs.promises.rename(inputFile.path, `${__dirname}/../public/drive/${driveId}/${inputFile.filename}`); 
        }catch (error){
            console.error(error)
            throw new InternalServerErrorException('Failed to upload file');
        }

        await this.fileRepository.save(file);
        return {
            fileId: fileId
        };
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
