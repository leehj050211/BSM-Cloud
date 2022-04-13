import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileDto } from './dto/file.dto';
import { FolderDto } from './dto/folder.dto';
import { DriveRepository } from './repository/drive.repository';
import { FileRepository } from './repository/file.repository';
import { FolderRepository } from './repository/folder.repository';
import { Drive } from './entity/drive.entity';
import { File } from './entity/file.entity';


export class DriveUtil {
    constructor(
        @InjectRepository(DriveRepository)
        private driveRepository: DriveRepository,
        @InjectRepository(FileRepository)
        private fileRepository: FileRepository,
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
}