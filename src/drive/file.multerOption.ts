import {} from '@nestjs/common';
import { diskStorage } from 'multer'
import { v4 as getUuid } from 'uuid';

export const FileMulterOption = {
    storage: diskStorage({
        destination: (req, file, callback) => {
            const path: string = __dirname + '/../public/drive/temp';
            callback(null, path);
        },
        filename: (req, file, callback) => {
            callback(null, getUuid().replaceAll('-', ''));
        }
    })
}