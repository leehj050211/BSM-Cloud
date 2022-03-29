import { EntityRepository, Repository } from "typeorm";
import { File } from "../entity/file.entity";

import { v4 as getUuid } from 'uuid';
import { InternalServerErrorException } from "@nestjs/common";
import { FileDto } from "../dto/file.dto";
import { FolderDto } from "../dto/folder.dto";

@EntityRepository(File)
export class FileRepository extends Repository<File> {

    async getFileByFileId(
        fileId: string
    ):Promise<File> {
        const file = this.findOne({
            fileId: new Buffer(fileId, 'hex')
        });
        return file;
    }

    async getFileByFileDto(
        fileDto: FileDto
    ):Promise<File> {
        const {fileId, driveId, folderId} = fileDto;
        const file = this.findOne({
            fileId: new Buffer(fileId, 'hex'),
            driveId: new Buffer(driveId, 'hex'),
            folderId: folderId === 'root'? null: new Buffer(folderId, 'hex')
        });
        return file;
    }

    async getFileListByFolderDto(
        folderDto: FolderDto
    ):Promise<File[]> {
        const {driveId, folderId} = folderDto;
        const fileList = this.find({
            driveId: new Buffer(driveId, 'hex'),
            folderId: folderId === 'root'? null: new Buffer(folderId, 'hex')
        });
        return fileList;
    }

    async uploadFile(
        folderDto: FolderDto,
        usercode: number,
        originalName: string,
        fileName: string,
        created: Date,
        size: number
    ):Promise<File> {
        const {driveId, folderId} = folderDto;
        const fileId = getUuid().replaceAll('-', '');
        const file = this.create({
            fileId: new Buffer(fileId, 'hex'),
            folderId: folderId === 'root'? null: new Buffer(folderId, 'hex'),
            driveId: new Buffer(driveId, 'hex'),
            usercode,
            originalName,
            fileName: new Buffer(fileName, 'hex'),
            created,
            size,
            isShare: false
        });

        try {
            return await this.save(file)
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to upload file');
        }
    }

    async updateFile(
        fileDto: FileDto,
        originalName: string,
        fileName: string,
        created: Date,
        size: number
    ):Promise<void> {
        const {fileId, driveId, folderId} = fileDto;
        try {
            this.update({
                fileId: new Buffer(fileId, 'hex'),
                folderId: folderId === 'root'? null: new Buffer(folderId, 'hex'),
                driveId: new Buffer(driveId, 'hex')
            }, {
                originalName,
                fileName: new Buffer(fileName, 'hex'),
                created,
                size
            });
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException();
        }
    }

    async deleteFile(
        fileDto: FileDto
    ):Promise<void> {
        const {fileId, driveId, folderId} = fileDto;
        try {
            await this.delete({
                fileId: new Buffer(fileId, 'hex'),
                folderId: folderId === 'root'? null: new Buffer(folderId, 'hex'),
                driveId: new Buffer(driveId, 'hex')
            });
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException();
        }
    }

    async shareFile(
        fileDto: FileDto,
        isShare: boolean,
    ):Promise<void> {
        const {fileId, driveId, folderId} = fileDto;
        try {
            this.update({
                fileId: new Buffer(fileId, 'hex'),
                folderId: folderId === 'root'? null: new Buffer(folderId, 'hex'),
                driveId: new Buffer(driveId, 'hex')
            }, {
                isShare
            });
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException();
        }
    }

    async moveFile(
        fileDto: FileDto,
        newFolderId: string
    ):Promise<void> {
        const {driveId, folderId} = fileDto;
        try {
            this.update({
                driveId: new Buffer(driveId, 'hex'),
                folderId: new Buffer(folderId, 'hex')
            }, {
                folderId: newFolderId === 'root'? null: new Buffer(newFolderId, 'hex')
            })
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException();
        }
    }
}