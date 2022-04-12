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
import { Drive } from './entity/drive.entity';
import { File } from './entity/file.entity';

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

    async driveCheck(inputDriveId: string, usercode: number): Promise<Drive> {
        const drive = await this.driveRepository.getDriveByUsercode(usercode);
        if (!drive) {
            throw new NotFoundException('Drive not found');
        }
        const driveId = drive.id.toString('hex');
        if (inputDriveId !== driveId) {
            throw new BadRequestException(`Drive doesn't match`);
        }
        return drive;
    }

    async fileCheck(fileDto: FileDto): Promise<File> {
        const file = await this.fileRepository.getFileByFileDto(fileDto);
        if (!file) {
            throw new NotFoundException('File not found');
        }
        return file;
    }

    async getDir(folderDto: FolderDto): Promise<string> {
        const {folderId} = folderDto;
        let dirInfo: {folderId: Buffer, folderName: string}[] = [];
        if (folderId !== 'root') {
            // folder check
            dirInfo = await this.folderRepository.getDir(folderDto);
            if (!dirInfo) {
                throw new NotFoundException('Folder not found');
            }
            return dirInfo.map(e => {
                return e.folderId.toString('hex');
            }).join('/')+'/';
        }
        return '';
    }

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
        const {driveId} = folderDto;
        // drive check
        const {total: totalStorage, used: usedStorage} = await this.driveCheck(driveId, usercode);

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
            totalStorage,
            usedStorage,
            dir: dir.map(e => {
                return {
                    folderId: e.folderId.toString('hex'),
                    folderName: e.folderName
                }
            })
        };
    }

    async downloadFile(res: Response, usercode: number, fileDto: FileDto) {
        const {driveId} = fileDto;
        // drive check
        await this.driveCheck(driveId, usercode);
        const [file, dir] = await Promise.all([
            this.fileCheck(fileDto),
            this.getDir(fileDto)
        ]);

        const filePath = `${storagePath}/${driveId}/${dir}${file.fileName.toString('hex')}`;
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
        const {driveId, folderId} = folderDto;
        // drive check
        const drive = await this.driveCheck(driveId, usercode);
        const dir = await this.getDir(folderDto);

        const fileSize = parseInt(inputFile.size);
        const totalUsed = drive.used + fileSize;
        if (totalUsed > drive.total) {
            try {
                fs.promises.rm(inputFile.path); 
            } catch (error) {
                console.error(error);
            }
            throw new BadRequestException('No more storage space');
        }
        if (inputFile.originalname.length > 255) {
            try {
                fs.promises.rm(inputFile.path); 
            } catch (error) {
                console.error(error);
            }
            throw new BadRequestException('File name is too long');
        }

        const file = await this.fileRepository.uploadFile(folderDto, usercode, inputFile.originalname, inputFile.filename, new Date(), fileSize);
        const fileId: string = file.fileId.toString('hex');

        const newFilePath = `${storagePath}/${driveId}/${dir}${inputFile.filename}`;
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
        const {driveId} = fileDto;
        // drive check
        const drive = await this.driveCheck(driveId, usercode);
        const [file, dir] = await Promise.all([
            this.fileCheck(fileDto),
            this.getDir(fileDto)
        ]);

        const oldFileName = file.fileName.toString('hex');
        const newFileName = inputFile.filename;
        const newFileSize = parseInt(inputFile.size);
        const totalUsed = (drive.used - file.size) + newFileSize;
        if (totalUsed > drive.total) {
            try {
                fs.promises.rm(inputFile.path); 
            } catch (error) {
                console.error(error);
            }
            throw new BadRequestException('No more storage space');
        }
        if (inputFile.originalname.length > 255) {
            try {
                fs.promises.rm(inputFile.path); 
            } catch (error) {
                console.error(error);
            }
            throw new BadRequestException('File name is too long');
        }

        // update file
        const newFilePath = `${storagePath}/${driveId}/${dir}${newFileName}`;
        const oldFilePath = `${storagePath}/${driveId}/${dir}${oldFileName}`;
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
        const {driveId} = fileDto;
        // drive check
        const drive = await this.driveCheck(driveId, usercode);
        const [file, dir] = await Promise.all([
            this.fileCheck(fileDto),
            this.getDir(fileDto)
        ]);

        const fileName = file.fileName.toString('hex');
        const totalUsed = drive.used - file.size;

        // delete file
        await this.fileRepository.deleteFile(fileDto);
        const filePath = `${storagePath}/${driveId}/${dir}${fileName}`;
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
        const {driveId, folderId: oldFolderId} = fileDto;
        if (oldFolderId === newFolderId) {
            throw new ConflictException('Same directory');
        }
        // drive check
        await this.driveCheck(driveId, usercode);
        const [file, oldDir, newDir] = await Promise.all([
            this.fileCheck(fileDto),
            this.getDir(fileDto),
            this.getDir({driveId, folderId: newFolderId})
        ]);

        const fileName = file.fileName.toString('hex');
        const oldFilePath = `${storagePath}/${driveId}/${oldDir}${fileName}`;
        const newFilePath = `${storagePath}/${driveId}/${newDir}${fileName}`;

        try {
            await fs.promises.rename(oldFilePath, newFilePath);
            await this.fileRepository.moveFile(fileDto, newFolderId);
        } catch(error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to move folder');
        }
    }

    async shareFile(usercode: number, fileDto: FileDto, share: boolean) {
        const {driveId} = fileDto;
        // drive check
        Promise.all([
            await this.driveCheck(driveId, usercode),
            await this.fileCheck(fileDto)
        ]);

        try {
            await this.fileRepository.shareFile(fileDto, share);
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to share file');
        }
        return;
    }
    
    async shareCode(usercode: number, fileDto: FileDto) {
        const {driveId, fileId: inputFileId} = fileDto;
        // drive check
        await Promise.all([
            this.driveCheck(driveId, usercode),
            this.fileCheck(fileDto)
        ]);

        // 2분 뒤
        const expireTime = new Date(Date.now()+120000);
        const shareFile = await this.shareRepository.shareFile(inputFileId, expireTime);

        return {
            shareCode: shareFile.code,
            expireTime
        };
    }

    async createFolder(usercode: number, folderDto: FolderDto, folderName: string) {
        const {driveId} = folderDto;
        // drive check
        await this.driveCheck(driveId, usercode);
        const [dir, isExist] = await Promise.all([
            this.getDir(folderDto),
            this.folderRepository.getFolderByName(folderDto, folderName)
        ]);
        
        // folderName check
        if (isExist) {
            throw new ConflictException('Same folder already exists');
        }
        if (folderName.length > 255) {
            throw new BadRequestException('Folder name is too long');
        }

        const newFolder = await this.folderRepository.createFolder(folderDto, usercode, folderName, new Date);
        const newFolderId = newFolder.folderId.toString('hex');

        try {
            await fs.promises.mkdir(`${storagePath}/${driveId}/${dir}${newFolderId}`); 
        } catch(error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to create folder');
        }
        return {
            folderId: newFolderId
        };
    }

    async moveFolder(usercode: number, folderDto: FolderDto, newFolderId: string) {
        const {driveId, folderId: oldFolderId} = folderDto;
        if (oldFolderId === newFolderId) {
            throw new ConflictException('Same directory');
        }
        // drive check
        await this.driveCheck(driveId, usercode);
        const [oldDir, newDir] = await Promise.all([
            this.getDir(folderDto),
            this.getDir({driveId, folderId: newFolderId})
        ]);

        // folderName check
        const oldFolderName = oldDir.split('/')[oldDir.split('/').length-1];
        if (await this.folderRepository.getFolderByName({driveId, folderId: newFolderId}, oldFolderName)) {
            throw new ConflictException('Same folder already exists');
        }

        const oldFolderPath = `${storagePath}/${driveId}/${oldDir}`;
        const newFolderPath = `${storagePath}/${driveId}/${newDir}${oldFolderId}`;
        try {
            await fs.promises.rename(oldFolderPath, newFolderPath);
            await this.folderRepository.moveFolder(folderDto, newFolderId);
        } catch(error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to move folder');
        }
    }
}
