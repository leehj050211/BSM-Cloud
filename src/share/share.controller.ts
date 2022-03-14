import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { ShareService } from './share.service';

@Controller('api/share')
export class ShareController {
    constructor(private shareService: ShareService) {}
    
    @Get(':fileId')
    getFileInfoById(@Param('fileId') fileId: string) {
        return this.shareService.getFileInfo({fileId});
    }

    @Get('code/:fileCode')
    getFileInfoByCode(@Param('fileCode') fileCode: string) {
        return this.shareService.getFileInfo({fileCode});
    }
    
    @Get('download/:fileId')
    downloadFileById(
        @Res() res: Response,
        @Param('fileId') fileId: string
    ) {
        return this.shareService.downlaodFile(res, {fileId});
    }

    @Get('download/code/:fileCode')
    downloadFileByCode(
        @Res() res: Response,
        @Param('fileCode') fileCode: string
    ) {
        return this.shareService.downlaodFile(res, {fileCode});
    }
}
