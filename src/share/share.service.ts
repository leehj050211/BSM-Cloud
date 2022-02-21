import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileRepository } from 'src/drive/repository/file.repository';

import * as fs from 'fs'
import { Response } from 'express';

const storagePath = `${__dirname}/${process.env.STORAGE_PATH}`;

@Injectable()
export class ShareService {

    constructor(
        @InjectRepository(FileRepository)
        private fileRepository: FileRepository
    ) {}
    
    async getFileInfo(fileId: string) {
        const file = await this.fileRepository.getFile(fileId);
        if(!file || !file.isShare){
            throw new NotFoundException('File not found');
        }
        return {
            fileName: file.originalName,
            created: file.created,
            size: file.size
        }
    }

    async downlaodFile(res: Response, fileId: string) {
        const file = await this.fileRepository.getFile(fileId);
        if(!file || !file.isShare){
            throw new NotFoundException('File not found');
        }

        const filepath = `${storagePath}/${file.driveId.toString('hex')}/${file.fileName.toString('hex')}`;
        const fileStat = await fs.promises.stat(filepath);
        const stream = fs.createReadStream(filepath);
        res.set({
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="${file.originalName}"`,
            'Content-Length': fileStat.size,
        });
        return stream.pipe(res);
    }
}
