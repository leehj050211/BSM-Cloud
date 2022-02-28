import { EntityRepository, Repository } from "typeorm";
import { File } from "../entity/file.entity";

import { v4 as getUuid } from 'uuid';
import { InternalServerErrorException } from "@nestjs/common";

@EntityRepository(File)
export class FileRepository extends Repository<File> {

    async getFileByFileId(
        fileId: string
    ):Promise<File> {
        const file = this.findOne({
            fileId: new Buffer(fileId, 'hex')
        })
        return file;
    }

    async getFileByFileIdAndDriveId(
        fileId: string,
        driveId: string
    ):Promise<File> {
        const file = this.findOne({
            fileId: new Buffer(fileId, 'hex'),
            driveId: new Buffer(driveId, 'hex')
        })
        return file;
    }

    async getFileList(
        driveId: string
    ):Promise<File[]> {
        const fileList = this.find({
            driveId: new Buffer(driveId, 'hex')
        })
        return fileList;
    }

    async uploadFile(
        driveId: string,
        usercode: number,
        originalName: string,
        fileName: string,
        created: Date,
        size: number
    ):Promise<File> {
        const fileId = getUuid().replaceAll('-', '');
        const file = this.create({
            fileId: new Buffer(fileId, 'hex'),
            driveId: new Buffer(driveId, 'hex'),
            usercode,
            originalName,
            fileName: new Buffer(fileName, 'hex'),
            created,
            size,
            isShare: false
        })

        try{
            return await this.save(file)
        }catch(error){
            console.error(error)
            throw new InternalServerErrorException('Failed to upload file');
        }
    }

    async updateFile(
        fileId: string,
        originalName: string,
        fileName: string,
        created: Date,
        size: number
    ):Promise<void> {
        try{
            this.update({
                fileId: new Buffer(fileId, 'hex')
            }, {
                originalName,
                fileName: new Buffer(fileName, 'hex'),
                created,
                size
            })
        }catch(error){
            console.error(error)
            throw new InternalServerErrorException();
        }
    }

    async deleteFile(
        fileId: string
    ):Promise<void> {
        try{
            await this.delete({
                fileId: new Buffer(fileId, 'hex'),
            })
        }catch(error){
            console.error(error)
            throw new InternalServerErrorException();
        }
    }

    async shareFile(
        fileId: string,
        isShare: boolean,
    ):Promise<void> {
        try{
            this.update({
                fileId: new Buffer(fileId, 'hex')
            }, {
                isShare
            })
        }catch(error){
            console.error(error)
            throw new InternalServerErrorException();
        }
    }
}