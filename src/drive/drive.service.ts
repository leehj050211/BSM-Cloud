import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileDto } from './dto/file.dto';
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

    async createDrive(usercode: number) {
        // 1.5GB
        const totalStorage = 1610612736;
        const drive = await this.driveRepository.createDrive(usercode, totalStorage);
        const driveId: string = drive.id.toString('hex');

        try {
            await fs.promises.mkdir(`${storagePath}/${driveId}`); 
        } catch(error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to create drive');
        }

        return;
    }

    async getDrive(usercode: number) {
        const result = await this.driveRepository.getDriveByUsercode(usercode);
        if (!result) {
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

    async getFileList(usercode: number, folderDto: FolderDto) {
        const {driveId: inputDriveId} = folderDto;
        // driveId check
        const result = await this.driveRepository.getDriveByUsercode(usercode);
        if (!result) {
            throw new NotFoundException('Drive not found');
        }
        const driveId = result.id.toString('hex');
        if (inputDriveId !== driveId) {
            throw new BadRequestException(`Drive doesn't match`);
        }
        const total = result.total;
        const used = result.used;


        const [filesInfo, foldersInfo, dir] = await Promise.all([
            this.fileRepository.getFileListByFolderDto(folderDto),
            this.folderRepository.getFolderList(folderDto),
            this.folderRepository.getDir(folderDto),
        ]);
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
            used,
            dir: dir.map(e => {
                return {
                    folderId: e.folderId.toString('hex'),
                    folderName: e.folderName
                }
            })
        };
    }

    async downloadFile(res: Response, usercode: number, fileDto: FileDto) {
        const {driveId: inputDriveId, folderId} = fileDto;
        // driveId check
        const result = await this.driveRepository.getDriveByUsercode(usercode);
        if (!result) {
            throw new NotFoundException('Drive not found');
        }
        const driveId = result.id.toString('hex');
        if (inputDriveId !== driveId) {
            throw new BadRequestException(`Drive doesn't match`);
        }

        const file = await this.fileRepository.getFileByFileDto(fileDto);
        if (!file) {
            throw new NotFoundException('File not found');
        }

        let dirInfo: {folderId: Buffer, folderName: string}[] = [];
        let dir = '';
        if (folderId !== 'root') {
            // folder check
            dirInfo = await this.folderRepository.getDir(fileDto);
            if (!dirInfo) {
                throw new NotFoundException('Folder not found');
            }
            dir = dirInfo.map(e => {
                return e.folderId.toString('hex');
            }).join('/');
        }

        const filePath = `${storagePath}/${driveId}/${folderId === 'root'? '': dir+'/'}${file.fileName.toString('hex')}`;
        let fileStat;
        try {
            fileStat = await fs.promises.stat(filePath);
        } catch(err) {
            console.error(err);
            if (err.code=='ENOENT') {
                throw new NotFoundException('Original file not found');
            }else{
                throw new InternalServerErrorException();
            }
        }
        const stream = fs.createReadStream(filePath);
        res.set({
            'Content-Disposition': contentDisposition(file.originalName),
            'Content-Length': fileStat.size,
        });
        return stream.pipe(res);
    }

    async uploadFile(usercode: number, folderDto: FolderDto, inputFile) {
        const {driveId: inputDriveId, folderId} = folderDto;
        // driveId check
        const result = await this.driveRepository.getDriveByUsercode(usercode);
        if (!result) {
            throw new NotFoundException('Drive not found');
        }
        const driveId = result.id.toString('hex');
        if (inputDriveId !== driveId) {
            throw new BadRequestException(`Drive doesn't match`);
        }
        const fileSize = parseInt(inputFile.size);
        const totalUsed = result.used + fileSize;
        if (totalUsed > result.total) {
            try {
                fs.promises.rm(inputFile.path); 
            } catch (error) {
                console.error(error);
            }
            throw new BadRequestException('No more storage space');
        }
        let dirInfo: {folderId: Buffer, folderName: string}[] = [];
        let dir = '';
        if (folderId !== 'root') {
            // folder check
            dirInfo = await this.folderRepository.getDir(folderDto);
            if (!dirInfo) {
                throw new NotFoundException('Folder not found');
            }
            dir = dirInfo.map(e => {
                return e.folderId.toString('hex');
            }).join('/');
        }

        const file = await this.fileRepository.uploadFile(folderDto, usercode, inputFile.originalname, inputFile.filename, new Date(), fileSize);
        const fileId: string = file.fileId.toString('hex');

        const newFilePath = `${storagePath}/${driveId}/${folderId === 'root'? '': dir+'/'}${inputFile.filename}`;
        try {
            await Promise.all([
                this.driveRepository.updateTotalUsed(driveId, totalUsed),
                fs.promises.rename(inputFile.path, newFilePath)
            ]);
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to upload file');
        }

        return {
            fileId: fileId
        };
    }

    async updateFile(usercode: number, fileDto: FileDto, inputFile) {
        const {driveId: inputDriveId, folderId} = fileDto;
        // driveId check
        const result = await this.driveRepository.getDriveByUsercode(usercode);
        if (!result) {
            throw new NotFoundException('Drive not found');
        }
        const driveId = result.id.toString('hex');
        if (inputDriveId !== driveId) {
            throw new BadRequestException(`Drive doesn't match`);
        }

        // file check
        const file = await this.fileRepository.getFileByFileDto(fileDto);
        if (!file) {
            throw new NotFoundException('File not found');
        }
        const oldFileName = file.fileName.toString('hex');
        const newFileName = inputFile.filename;
        const newFileSize = parseInt(inputFile.size);
        const totalUsed = (result.used - file.size) + newFileSize;
        if (totalUsed > result.total) {
            try {
                fs.promises.rm(inputFile.path); 
            } catch (error) {
                console.error(error);
            }
            throw new BadRequestException('No more storage space');
        }
        let dirInfo: {folderId: Buffer, folderName: string}[] = [];
        let dir = '';
        if (folderId !== 'root') {
            // folder check
            dirInfo = await this.folderRepository.getDir(fileDto);
            if (!dirInfo) {
                throw new NotFoundException('Folder not found');
            }
            dir = dirInfo.map(e => {
                return e.folderId.toString('hex');
            }).join('/');
        }

        // update file
        const newFilePath = `${storagePath}/${driveId}/${folderId === 'root'? '': dir+'/'}${newFileName}`;
        const oldFilePath = `${storagePath}/${driveId}/${folderId === 'root'? '': dir+'/'}${oldFileName}`;
        try {
            await fs.promises.rename(inputFile.path, newFilePath); 
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to update file');
        }
        try {
            await Promise.all([
                this.driveRepository.updateTotalUsed(driveId, totalUsed),
                this.fileRepository.updateFile(
                    fileDto,
                    inputFile.originalname,
                    newFileName,
                    new Date(),
                    newFileSize
                ),
                fs.promises.rm(oldFilePath)
            ]);
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to update file');
        }
        return;
    }

    async deleteFile(usercode: number, fileDto: FileDto) {
        const {driveId: inputDriveId, folderId} = fileDto;
        // driveId check
        const result = await this.driveRepository.getDriveByUsercode(usercode);
        if (!result) {
            throw new NotFoundException('Drive not found');
        }
        const driveId = result.id.toString('hex');
        if (inputDriveId !== driveId) {
            throw new BadRequestException(`Drive doesn't match`);
        }

        // file check
        const file = await this.fileRepository.getFileByFileDto(fileDto);
        if (!file) {
            throw new NotFoundException('File not found');
        }
        const fileName = file.fileName.toString('hex');
        const totalUsed = result.used - file.size;

        let dirInfo: {folderId: Buffer, folderName: string}[] = [];
        let dir = '';
        if (folderId !== 'root') {
            // folder check
            dirInfo = await this.folderRepository.getDir(fileDto);
            if (!dirInfo) {
                throw new NotFoundException('Folder not found');
            }
            dir = dirInfo.map(e => {
                return e.folderId.toString('hex');
            }).join('/');
        }

        // delete file
        await this.fileRepository.deleteFile(fileDto);
        const filePath = `${storagePath}/${driveId}/${folderId === 'root'? '': dir+'/'}${fileName}`;
        try {
            await fs.promises.rm(filePath); 
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to delete file');
        }
        this.driveRepository.updateTotalUsed(driveId, totalUsed);
        return;
    }

    async moveFile(usercode: number, fileDto: FileDto, newFolderId: string) {
        const {driveId: inputDriveId, folderId: oldFolderId} = fileDto;
        if (oldFolderId === newFolderId) {
            throw new ConflictException('Same directory');
        }
        // driveId check
        const drive = await this.driveRepository.getDriveByUsercode(usercode);
        if (!drive) {
            throw new NotFoundException('Drive not found');
        }
        const driveId = drive.id.toString('hex');
        if (inputDriveId !== driveId) {
            throw new BadRequestException(`Drive doesn't match`);
        }

        // file check
        const file = await this.fileRepository.getFileByFileDto(fileDto);
        if (!file) {
            throw new NotFoundException('File not found');
        }
        const fileName = file.fileName.toString('hex');

        let oldDirInfo: {folderId: Buffer, folderName: string}[] = [];
        let newDirInfo: {folderId: Buffer, folderName: string}[] = [];
        let oldDir = '';
        let newDir = '';

        // folder check
        if (oldFolderId !== 'root') {
            oldDirInfo = await this.folderRepository.getDir({driveId, folderId: oldFolderId});
            if (!oldDirInfo.length) {
                throw new NotFoundException('Folder not found');
            }
            oldDir = oldDirInfo.map(e => {
                return e.folderId.toString('hex');
            }).join('/');
        }
        if (newFolderId !== 'root') {
            newDirInfo = await this.folderRepository.getDir({driveId, folderId: newFolderId});
            if (!newDirInfo.length) {
                throw new NotFoundException('Folder not found');
            }
            newDir = newDirInfo.map(e => {
                return e.folderId.toString('hex');
            }).join('/');
        }
        
        const oldFilePath = `${storagePath}/${driveId}/${oldFolderId === 'root'? '': oldDir+'/'}${fileName}`;
        const newFilePath = `${storagePath}/${driveId}/${newFolderId === 'root'? '': newDir+'/'}${fileName}`;
        try {
            await Promise.all([
                await this.fileRepository.moveFile(fileDto, newFolderId),
                await fs.promises.rename(oldFilePath, newFilePath)
            ]);
        } catch(error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to move folder');
        }
    }

    async shareFile(usercode: number, fileDto: FileDto, share: boolean) {
        const {driveId: inputDriveId} = fileDto;
        // driveId check
        const result = await this.driveRepository.getDriveByUsercode(usercode);
        if (!result) {
            throw new NotFoundException('Drive not found');
        }
        const driveId = result.id.toString('hex');
        if (inputDriveId !== driveId) {
            throw new BadRequestException(`Drive doesn't match`);
        }

        // file check
        const file = await this.fileRepository.getFileByFileDto(fileDto);
        if (!file) {
            throw new NotFoundException('File not found');
        }

        try {
            await this.fileRepository.shareFile(fileDto, share);
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to share file');
        }
        return;
    }
    
    async shareCode(usercode: number, fileDto: FileDto) {
        const {driveId: inputDriveId, fileId: inputFileId} = fileDto;
        // driveId check
        const result = await this.driveRepository.getDriveByUsercode(usercode);
        if (!result) {
            throw new NotFoundException('Drive not found');
        }
        const driveId = result.id.toString('hex');
        if (inputDriveId !== driveId) {
            throw new BadRequestException(`Drive doesn't match`);
        }

        // file check
        const file = await this.fileRepository.getFileByFileDto(fileDto);
        if (!file) {
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

    async createFolder(usercode: number, folderDto: FolderDto, folderName: string) {
        const {driveId: inputDriveId, folderId: parentId} = folderDto;
        // driveId check
        const drive = await this.driveRepository.getDriveByUsercode(usercode);
        if (!drive) {
            throw new NotFoundException('Drive not found');
        }
        const driveId = drive.id.toString('hex');
        if (inputDriveId !== driveId) {
            throw new BadRequestException(`Drive doesn't match`);
        }
        let dirInfo: {folderId: Buffer, folderName: string}[] = [];
        let dir = '';
        if (parentId !== 'root') {
            // folder check
            dirInfo = await this.folderRepository.getDir(folderDto);
            if (!dirInfo) {
                throw new NotFoundException('Folder not found');
            }
            dir = dirInfo.map(e => {
                return e.folderId.toString('hex');
            }).join('/');
        }
        
        // folderName check
        if (await this.folderRepository.getFolderByName(folderDto, folderName)) {
            throw new ConflictException('Same folder already exists');
        }

        const folder = await this.folderRepository.createFolder(folderDto, usercode, folderName, new Date);
        const folderId: string = folder.folderId.toString('hex');

        try {
            await fs.promises.mkdir(`${storagePath}/${driveId}/${folderId === 'root'? '': dir+'/'}${folderId}`); 
        } catch(error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to create folder');
        }
        return {
            folderId
        };
    }

    async moveFolder(usercode: number, folderDto: FolderDto, newFolderId: string) {
        const {driveId: inputDriveId, folderId: oldFolderId} = folderDto;
        if (oldFolderId === newFolderId) {
            throw new ConflictException('Same directory');
        }
        // driveId check
        const drive = await this.driveRepository.getDriveByUsercode(usercode);
        if (!drive) {
            throw new NotFoundException('Drive not found');
        }
        const driveId = drive.id.toString('hex');
        if (inputDriveId !== driveId) {
            throw new BadRequestException(`Drive doesn't match`);
        }

        let oldDirInfo: {folderId: Buffer, folderName: string}[] = [];
        let newDirInfo: {folderId: Buffer, folderName: string}[] = [];
        let oldDir = '';
        let newDir = '';
        let oldFolderName = '';

        // folder check
        if (newFolderId !== 'root') {
            [oldDirInfo, newDirInfo] = await Promise.all([
                this.folderRepository.getDir(folderDto),
                this.folderRepository.getDir({driveId, folderId: newFolderId})
            ]);
            if (!newDirInfo.length) {
                throw new NotFoundException('Folder not found');
            }
            newDir = newDirInfo.map(e => {
                return e.folderId.toString('hex');
            }).join('/');
        } else {
            oldDirInfo = await this.folderRepository.getDir(folderDto);
        }
        if (!oldDirInfo.length) {
            throw new NotFoundException('Folder not found');
        }
        oldDir = oldDirInfo.map(e => {
            return e.folderId.toString('hex');
        }).join('/');
        oldFolderName = oldDirInfo[oldDirInfo.length-1].folderName;

        // folderName check
        if (await this.folderRepository.getFolderByName({driveId, folderId: newFolderId}, oldFolderName)) {
            throw new ConflictException('Same folder already exists');
        }

        const oldFolderPath = `${storagePath}/${driveId}/${oldDir}`;
        const newFolderPath = `${storagePath}/${driveId}/${newFolderId === 'root'? '': newDir+'/'}${oldFolderId}`;
        try {
            await Promise.all([
                await this.folderRepository.moveFolder(folderDto, newFolderId),
                await fs.promises.rename(oldFolderPath, newFolderPath)
            ]);
        } catch(error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to move folder');
        }
    }
}
