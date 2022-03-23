import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileDto } from './dto/file.dto';
import { DriveDto } from './dto/drive.dto';
import { FolderDto } from './dto/folder.dto';
import { DriveRepository } from './repository/drive.repository';
import { FileRepository } from './repository/file.repository';
import { ShareRepository } from './repository/shareCode.repository';

import * as fs from 'fs'
import * as contentDisposition from 'content-disposition';
import { Response } from 'express';
import { FolderRepository } from './repository/folder.repository';

const storagePath = `${__dirname}/${process.env.STORAGE_PATH}`;

@Injectable()
export class DriveService {

    constructor(
        @InjectRepository(DriveRepository)
        private driveRepository: DriveRepository,
        @InjectRepository(FileRepository)
        private fileRepository: FileRepository,
        @InjectRepository(ShareRepository)
        private shareRepository: ShareRepository,
        @InjectRepository(FolderRepository)
        private folderRepository: FolderRepository
    ) {}

    async createDrive(usercode: number){
        // 1.5GB
        const totalStorage = 1610612736;
        const drive = await this.driveRepository.createDrive(usercode, totalStorage);
        const driveId: string = drive.id.toString('hex');

        try{
            await fs.promises.mkdir(`${storagePath}/${driveId}`); 
        }catch(error){
            console.error(error);
            throw new InternalServerErrorException('Failed to create drive');
        }

        return;
    }

    async getDrive(usercode: number) {
        const result = await this.driveRepository.getDriveByUsercode(usercode);
        if(!result){
            throw new NotFoundException('Drive not found');
        }

        const driveId = result.id.toString('hex');
        const total = result.total;
        const used = result.used;
        return {
            driveId,
            total,
            used
        }
    }

    async getFileList(usercode: number, driveDto: DriveDto) {
        const {driveId: inputDriveId, folderId} = driveDto;
        // driveId check
        const result = await this.driveRepository.getDriveByUsercode(usercode);
        if(!result){
            throw new NotFoundException('Drive not found');
        }
        const driveId = result.id.toString('hex');
        if(inputDriveId !== driveId){
            throw new BadRequestException(`Drive doesn't match`);
        }
        const total = result.total;
        const used = result.used;


        const [filesInfo, foldersInfo] = await Promise.all([
            this.fileRepository.getFileList(driveId),
            this.folderRepository.getFolderList(driveId, folderId)
        ])
        const files = filesInfo.map(file => {
            return {
                fileId: file.fileId.toString('hex'),
                fileName: file.originalName,
                created: file.created,
                size: file.size,
                isShare: file.isShare
            }
        })
        const folders = foldersInfo.map(folder => {
            return {
                folderId: folder.folderId.toString('hex'),
                folderName: folder.folderName,
                created: folder.created,
                isShare: folder.isShare
            }
        })
        return {
            files,
            folders,
            total,
            used
        };
    }

    async downloadFile(res: Response, usercode: number, fileDto: FileDto) {
        const {driveId: inputDriveId, fileId: inputFileId} = fileDto;
        // driveId check
        const result = await this.driveRepository.getDriveByUsercode(usercode);
        if(!result){
            throw new NotFoundException('Drive not found');
        }
        const driveId = result.id.toString('hex');
        if(inputDriveId !== driveId){
            throw new BadRequestException(`Drive doesn't match`);
        }

        const file = await this.fileRepository.getFileByFileIdAndDriveId(inputFileId, driveId);
        if(!file){
            throw new NotFoundException('File not found');
        }

        const filepath = `${storagePath}/${driveId}/${file.fileName.toString('hex')}`;
        let fileStat;
        try{
            fileStat = await fs.promises.stat(filepath);
        }catch(err){
            console.error(err);
            if(err.code=='ENOENT'){
                throw new NotFoundException('Original file not found');
            }else{
                throw new InternalServerErrorException();
            }
        }
        const stream = fs.createReadStream(filepath);
        res.set({
            'Content-Disposition': contentDisposition(file.originalName),
            'Content-Length': fileStat.size,
        });
        return stream.pipe(res);
    }

    async uploadFile(usercode: number, driveDto: DriveDto, inputFile) {
        const {driveId: inputDriveId} = driveDto;
        // driveId check
        const result = await this.driveRepository.getDriveByUsercode(usercode);
        if(!result){
            throw new NotFoundException('Drive not found');
        }
        const driveId = result.id.toString('hex');
        if(inputDriveId !== driveId){
            throw new BadRequestException(`Drive doesn't match`);
        }
        const fileSize = parseInt(inputFile.size);
        const totalUsed = result.used + fileSize;
        if(totalUsed > result.total){
            try{
                fs.promises.rm(inputFile.path); 
            }catch (error){
                console.error(error)
            }
            throw new BadRequestException('No more storage space');
        }

        const file = await this.fileRepository.uploadFile(driveId, usercode, inputFile.originalname, inputFile.filename, new Date(), fileSize);
        const fileId: string = file.fileId.toString('hex')

        try{
            await Promise.all([
                this.driveRepository.updateTotalUsed(driveId, totalUsed),
                fs.promises.rename(inputFile.path, `${storagePath}/${driveId}/${inputFile.filename}`)
            ])
        }catch (error){
            console.error(error)
            throw new InternalServerErrorException('Failed to upload file');
        }

        return {
            fileId: fileId
        };
    }

    async updateFile(usercode: number, fileDto: FileDto, inputFile) {
        const {driveId: inputDriveId, fileId: inputFileId} = fileDto;
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
        const file = await this.fileRepository.getFileByFileIdAndDriveId(inputFileId, driveId);
        if(!file){
            throw new NotFoundException('File not found');
        }
        const oldFileName = file.fileName.toString('hex');
        const newFileName = inputFile.filename;
        const newFileSize = parseInt(inputFile.size);
        const totalUsed = (result.used - file.size) + newFileSize;
        if(totalUsed > result.total){
            try{
                fs.promises.rm(inputFile.path); 
            }catch (error){
                console.error(error)
            }
            throw new BadRequestException('No more storage space');
        }

        // update file
        try{
            await fs.promises.rename(inputFile.path, `${storagePath}/${driveId}/${newFileName}`); 
        }catch (error){
            console.error(error)
            throw new InternalServerErrorException('Failed to update file');
        }
        try{
            await Promise.all([
                this.driveRepository.updateTotalUsed(driveId, totalUsed),
                this.fileRepository.updateFile(inputFileId, inputFile.originalname, newFileName, new Date(), newFileSize),
                fs.promises.rm(`${storagePath}/${driveId}/${oldFileName}`)
            ])
        }catch (error){
            console.error(error)
            throw new InternalServerErrorException('Failed to update file');
        }
        return;
    }

    async deleteFile(usercode: number, fileDto: FileDto) {
        const {driveId: inputDriveId, fileId: inputFileId} = fileDto;
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
        const file = await this.fileRepository.getFileByFileIdAndDriveId(inputFileId, driveId);
        if(!file){
            throw new NotFoundException('File not found');
        }
        const fileName = file.fileName.toString('hex');
        const totalUsed = result.used - file.size;

        // delete file
        await this.fileRepository.deleteFile(inputFileId);
        try{
            await fs.promises.rm(`${storagePath}/${driveId}/${fileName}`); 
        }catch (error){
            console.error(error)
            throw new InternalServerErrorException('Failed to delete file');
        }
        this.driveRepository.updateTotalUsed(driveId, totalUsed);
        return;
    }

    async shareFile(usercode: number, fileDto: FileDto, share: boolean) {
        const {driveId: inputDriveId, fileId: inputFileId} = fileDto;
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
        const file = await this.fileRepository.getFileByFileIdAndDriveId(inputFileId, driveId);
        if(!file){
            throw new NotFoundException('File not found');
        }

        try{
            await this.fileRepository.shareFile(inputFileId, share);
        }catch (error){
            console.error(error)
            throw new InternalServerErrorException('Failed to share file');
        }
        return;
    }
    
    async shareCode(usercode: number, fileDto: FileDto) {
        const {driveId: inputDriveId, fileId: inputFileId} = fileDto;
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
        const file = await this.fileRepository.getFileByFileIdAndDriveId(inputFileId, driveId);
        if(!file){
            throw new NotFoundException('File not found');
        }

        // 2분 뒤
        const expireTime = new Date(Date.now()+120000);

        const shareFile = await this.shareRepository.shareFile(inputFileId, expireTime);

        return {
            shareCode: shareFile.code,
            expireTime
        };
    }

    async createFolder(usercode: number, folderDto: FolderDto, folderName: string){
        const {driveId: inputDriveId, folderId: parentId} = folderDto;
        // driveId check
        const drive = await this.driveRepository.getDriveByUsercode(usercode);
        if(!drive){
            throw new NotFoundException('Drive not found');
        }
        const driveId = drive.id.toString('hex');
        if(inputDriveId !== driveId){
            throw new BadRequestException(`Drive doesn't match`);
        }
        if (typeof parentId !== 'undefined') {
            // folder check
            if (!await this.folderRepository.getFolderByDriveId(parentId, driveId)) {
                throw new NotFoundException('Folder not found');
            }
        }
        // folderName check
        if (await this.folderRepository.getFolderByName(driveId, parentId, folderName)) {
            throw new ConflictException('Same folder already exists');
        }

        const folder = await this.folderRepository.createFolder(driveId, usercode, folderName, new Date, parentId);
        const folderId: string = folder.folderId.toString('hex');

        try{
            await fs.promises.mkdir(`${storagePath}/${driveId}/${folderId}`); 
        }catch(error){
            console.error(error);
            throw new InternalServerErrorException('Failed to create folder');
        }
        return {
            folderId
        };
    }
}
