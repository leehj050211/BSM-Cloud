import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileRepository } from 'src/drive/repository/file.repository';

import * as fs from 'fs'
import * as contentDisposition from 'content-disposition';
import { Response } from 'express';

const storagePath = `${__dirname}/${process.env.STORAGE_PATH}`;

@Injectable()
export class ShareService {

    constructor(
        @InjectRepository(FileRepository)
        private fileRepository: FileRepository
    ) {}
    
    async getFileInfo(fileId: string) {
        const file = await this.fileRepository.getFileByFileId(fileId);
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
        const file = await this.fileRepository.getFileByFileId(fileId);
        if(!file || !file.isShare){
            throw new NotFoundException('File not found');
        }

        const filepath = `${storagePath}/${file.driveId.toString('hex')}/${file.fileName.toString('hex')}`;
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
}
