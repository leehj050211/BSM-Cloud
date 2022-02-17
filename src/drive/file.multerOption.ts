import {} from '@nestjs/common';
import { diskStorage } from 'multer'
import { v4 as getUuid } from 'uuid';

const storagePath = `${__dirname}/${process.env.STORAGE_PATH}`;

export const FileMulterOption = {
    storage: diskStorage({
        destination: (req, file, callback) => {
            const path: string = `${storagePath}/temp`;
            callback(null, path);
        },
        filename: (req, file, callback) => {
            callback(null, getUuid().replaceAll('-', ''));
        }
    })
}