import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import JwtAuthGuard from 'src/auth/auth.guard';
import { ShareService } from './share.service';

@Controller('api/share')
@UseGuards(JwtAuthGuard)
export class ShareController {
    constructor(private shareService: ShareService) {}

    @Get(':fileId')
    getFileInfo(@Param('fileId') fileId: string) {
        return this.shareService.getFileInfo(fileId);
    }

    @Get('download/:fileId')
    downloadFile(
        @Res() res: Response,
        @Param('fileId') fileId: string
    ) {
        return this.shareService.downlaodFile(res, fileId);
    }
}
