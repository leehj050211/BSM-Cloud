import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileRepository } from 'src/drive/repository/file.repository';
import { ShareRepository } from 'src/drive/repository/shareCode.repository';
import { FolderRepository } from 'src/drive/repository/folder.repository';
import { DriveUtil } from 'src/drive/drive.util';

import * as fs from 'fs'
import * as contentDisposition from 'content-disposition';
import { Response } from 'express';

const storagePath = `${__dirname}/${process.env.STORAGE_PATH}`;

@Injectable()
export class ShareService {

    constructor(
        @InjectRepository(FileRepository)
        private fileRepository: FileRepository,
        @InjectRepository(FolderRepository)
        private folderRepository: FolderRepository,
        @InjectRepository(ShareRepository)
        private shareRepository: ShareRepository,
        private driveUtil: DriveUtil
    ) {}
    
    async getFileInfo({
        fileId,
        fileCode
    }:{
        fileId?: string,
        fileCode?: string
    }) {
        if (fileCode) {
            const share = await this.shareRepository.getByCodeAndTime(fileCode, new Date);
            if (!share) {
                throw new NotFoundException('File not found');
            }
            fileId = share.fileId.toString('hex');
        }

        const file = await this.fileRepository.getFileByFileId(fileId);
        if (!file || (!file.isShare && !fileCode)) {
            throw new NotFoundException('File not found');
        }
        return {
            fileName: file.originalName,
            created: file.created,
            size: file.size
        }
    }

    async downlaodFile(res: Response, {
        fileId,
        fileCode
    }:{
        fileId?: string,
        fileCode?: string
    }) {
        if (fileCode) {
            const share = await this.shareRepository.getByCodeAndTime(fileCode, new Date);
            if (!share) {
                throw new NotFoundException('File not found');
            }
            fileId = share.fileId.toString('hex');
        }
        
        const file = await this.fileRepository.getFileByFileId(fileId);
        if (!file || (!file.isShare && !fileCode)) {
            throw new NotFoundException('File not found');
        }

        const folderId = file.folderId === null? 'root': file.folderId.toString('hex');
        const driveId = file.driveId.toString('hex');

        
        const dir = await this.driveUtil.getDir({folderId, driveId});
        const filepath = `${storagePath}/${driveId}/${dir}${file.fileName.toString('hex')}`;
        let fileStat;
        try {
            fileStat = await fs.promises.stat(filepath);
        } catch(err) {
            console.error(err);
            if (err.code=='ENOENT') {
                throw new NotFoundException('Original file not found');
            } else {
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
}
