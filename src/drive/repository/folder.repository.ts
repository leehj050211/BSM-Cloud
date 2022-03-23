import { EntityRepository, Repository } from "typeorm";
import { Folder } from "../entity/folder.entity";

import { v4 as getUuid } from 'uuid';
import { InternalServerErrorException } from "@nestjs/common";

@EntityRepository(Folder)
export class FolderRepository extends Repository<Folder> {

    async getFolder(
        folderId: string
    ):Promise<Folder> {
        const folder = this.findOne({
            folderId: new Buffer(folderId, 'hex')
        })
        return folder;
    }

    async getFolderByDriveId(
        folderId: string,
        driveId: string
    ):Promise<Folder> {
        const file = this.findOne({
            folderId: new Buffer(folderId, 'hex'),
            driveId: new Buffer(driveId, 'hex')
        })
        return file;
    }

    async getFolderByName(
        driveId: string,
        parentId: string|undefined,
        folderName: string
    ):Promise<Folder> {
        const file = this.findOne({
            driveId: new Buffer(driveId, 'hex'),
            parentId: typeof parentId != 'undefined'? new Buffer(parentId, 'hex'): null,
            folderName
        })
        return file;
    }

    async getFolderList(
        driveId: string,
        parentId?: string
    ):Promise<Folder[]> {
        const folderList = this.find({
            driveId: new Buffer(driveId, 'hex'),
            parentId: parentId? new Buffer(parentId, 'hex'): null
        })
        return folderList;
    }

    async createFolder(
        driveId: string,
        usercode: number,
        folderName: string,
        created: Date,
        parentId?: string
    ):Promise<Folder> {
        const folderId = getUuid().replaceAll('-', '');
        const folder = this.create({
            folderId: new Buffer(folderId, 'hex'),
            driveId: new Buffer(driveId, 'hex'),
            usercode,
            folderName,
            created,
            isShare: false,
            parentId: parentId? new Buffer(parentId, 'hex'): null
        })

        try {
            return await this.save(folder);
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Failed to create folder');
        }
    }

    async updateFile(
        folderName: string,
        created: Date,
        folderId?: string
    ):Promise<void> {
        try {
            this.update({
                folderId: new Buffer(folderId, 'hex')
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
        folderId?: string
    ):Promise<void> {
        try {
            await this.delete({
                folderId: new Buffer(folderId, 'hex')
            })
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException();
        }
    }

    async shareFolder(
        isShare: boolean,
        folderId: string
    ):Promise<void> {
        try {
            this.update({
                folderId: new Buffer(folderId, 'hex')
            }, {
                isShare
            })
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException();
        }
    }
}