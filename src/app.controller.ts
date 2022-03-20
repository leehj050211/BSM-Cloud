import { Controller, Get, Redirect, Render } from '@nestjs/common';

@Controller()
export class AppController {

    @Get()
    @Render('home')
    root(){
        return;
    }

    @Get('drive')
    @Render('drive')
    drive() {
        return;
    }

    @Get('drive/:driveId')
    @Render('drive')
    driveId() {
        return;
    }

    @Get('code/:fileCode')
    @Render('code')
    shareByCode() {
        return;
    }
    
    @Get('share/:fileId')
    @Render('share')
    shareById() {
        return;
    }
}
