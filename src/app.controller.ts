import { Controller, Get, Redirect, Render } from '@nestjs/common';

@Controller()
export class AppController {

    @Get()
    @Redirect('/drive/')
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

    @Get('share/:fileId')
    @Render('share')
    share() {
        return;
    }

    @Get('home')
    @Render('home')
    home() {
        return;
    }
}
