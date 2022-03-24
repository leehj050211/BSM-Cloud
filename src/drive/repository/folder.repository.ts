import { EntityRepository, Repository } from "typeorm";
import { Folder } from "../entity/folder.entity";
import { FolderDto } from "../dto/folder.dto";

import { v4 as getUuid } from 'uuid';
import { InternalServerErrorException } from "@nestjs/common";

@EntityRepository(Folder)
export class FolderRepository extends Repository<Folder> {

    async getFolderById(
        folderId: string
    ):Promise<Folder> {
        const folder = this.findOne({
            folderId: folderId === 'root'? null: new Buffer(folderId, 'hex')
        })
        return folder;
    }

    async getFolderByFolderDto(
        folderDto: FolderDto
    ):Promise<Folder> {
        const {driveId, folderId} = folderDto;
        const file = this.findOne({
            folderId: folderId === 'root'? null: new Buffer(folderId, 'hex'),
            driveId: new Buffer(driveId, 'hex')
        })
        return file;
    }

    async getFolderByName(
        folderDto: FolderDto,
        folderName: string
    ):Promise<Folder> {
        const {driveId, folderId:parentId} = folderDto;
        const file = this.findOne({
            driveId: new Buffer(driveId, 'hex'),
            parentId: parentId === 'root'? null: new Buffer(parentId, 'hex'),
            folderName
        })
        return file;
    }

    async getFolderList(
        folderDto: FolderDto
    ):Promise<Folder[]> {
        const {driveId, folderId:parentId} = folderDto;
        const folderList = this.find({
            driveId: new Buffer(driveId, 'hex'),
            parentId: parentId === 'root'? null: new Buffer(parentId, 'hex')
        })
        return folderList;
    }

    async createFolder(
        folderDto: FolderDto,
        usercode: number,
        folderName: string,
        created: Date,
    ):Promise<Folder> {
        const {driveId, folderId:parentId} = folderDto;
        const folderId = getUuid().replaceAll('-', '');
        const folder = this.create({
            folderId: new Buffer(folderId, 'hex'),
            driveId: new Buffer(driveId, 'hex'),
            usercode,
            folderName,
            created,
            isShare: false,
            parentId: parentId === 'root'? null: new Buffer(parentId, 'hex')
        })

        try {
            return await this.save(folder);
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to create folder');
        }
    }

    async updateFolder(
        folderDto: FolderDto,
        folderName: string,
        created: Date,
    ):Promise<void> {
        const {driveId, folderId} = folderDto;
        try {
            this.update({
                driveId: new Buffer(driveId, 'hex'),
                folderId: folderId === 'root'? null: new Buffer(folderId, 'hex')
            }, {
                folderName,
                created
            })
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException();
        }
    }

    async deleteFolder(
        folderDto: FolderDto
    ):Promise<void> {
        const {driveId, folderId} = folderDto;
        try {
            await this.delete({
                driveId: new Buffer(driveId, 'hex'),
                folderId: folderId === 'root'? null: new Buffer(folderId, 'hex')
            })
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException();
        }
    }

    async shareFolder(
        folderDto: FolderDto,
        isShare: boolean
    ):Promise<void> {
        const {driveId, folderId} = folderDto;
        try {
            this.update({
                driveId: new Buffer(driveId, 'hex'),
                folderId: folderId === 'root'? null: new Buffer(folderId, 'hex')
            }, {
                isShare
            })
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException();
        }
    }
}