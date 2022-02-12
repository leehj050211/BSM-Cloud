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
import { v4 as getUuid } from 'uuid';

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

    async getFileList(usercode: number, GetFilesDto: GetFileListDto) {
        const {driveId: inputDriveId} = GetFilesDto;
        // driveId check
        const result = await this.driveRepository.getDriveByUsercode(usercode);
        if(!result){
            throw new NotFoundException('Drive not found');
        }
        const driveId = result.id.toString('hex');
        if(inputDriveId !== driveId){
            throw new BadRequestException(`Drive doesn't match`);
        }

        const fileList = (await this.fileRepository.getFileList(driveId)).map(file => {
            return {
                fileId: file.fileId.toString('hex'),
                fileName: file.originalName,
                created: file.created
            }
        })
        return fileList;
    }

    async downloadFile(usercode: number, DownloadFileDto: DownloadFileDto) {
        const {driveId: inputDriveId, fileId: inputFileId} = DownloadFileDto;
        // driveId check
        const result = await this.driveRepository.getDriveByUsercode(usercode);
        if(!result){
            throw new NotFoundException('Drive not found');
        }
        const driveId = result.id.toString('hex');
        if(inputDriveId !== driveId){
            throw new BadRequestException(`Drive doesn't match`);
        }

        const file = (await this.fileRepository.getFile(inputFileId));
        if(!file){
            throw new NotFoundException('File not found');
        }
        return {
            originalName: file.originalName,
            fileName: file.fileName.toString('hex')
        };
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

    async updateFile(usercode: number, UpdateFileDto: UpdateFileDto, inputFile) {
        const {driveId: inputDriveId, fileId: inputFileId} = UpdateFileDto;
        // driveId check
        const result = await this.driveRepository.getDriveByUsercode(usercode);
        if(!result){
            throw new NotFoundException('Drive not found');
        }
        const driveId = result.id.toString('hex');
        if(inputDriveId !== driveId){
            throw new BadRequestException(`Drive doesn't match`);
        }

        // file check
        const file = (await this.fileRepository.getFile(inputFileId));
        if(!file){
            throw new NotFoundException('File not found');
        }
        const oldFileName = file.fileName.toString('hex');
        const newFileName = inputFile.filename;

        // update file
        try{
            await fs.promises.rename(inputFile.path, `${__dirname}/../public/drive/${driveId}/${newFileName}`); 
        }catch (error){
            console.error(error)
            throw new InternalServerErrorException('Failed to update file');
        }
        await this.fileRepository.updateFile(inputFileId, inputFile.originalname, newFileName, new Date());
        try{
            await fs.promises.rm(`${__dirname}/../public/drive/${driveId}/${oldFileName}`); 
        }catch (error){
            console.error(error)
            throw new InternalServerErrorException('Failed to update file');
        }
        return;
    }

    async deleteFile(usercode: number, DeleteFileDto: DeleteFileDto) {
        const {driveId: inputDriveId, fileId: inputFileId} = DeleteFileDto;
        // driveId check
        const result = await this.driveRepository.getDriveByUsercode(usercode);
        if(!result){
            throw new NotFoundException('Drive not found');
        }
        const driveId = result.id.toString('hex');
        if(inputDriveId !== driveId){
            throw new BadRequestException(`Drive doesn't match`);
        }

        // file check
        const file = (await this.fileRepository.getFile(inputFileId));
        if(!file){
            throw new NotFoundException('File not found');
        }
        const fileName = file.fileName.toString('hex');

        // delete file
        await this.fileRepository.deleteFile(inputFileId);
        try{
            await fs.promises.rm(`${__dirname}/../public/drive/${driveId}/${fileName}`); 
        }catch (error){
            console.error(error)
            throw new InternalServerErrorException('Failed to delete file');
        }
        return;
    }
}
