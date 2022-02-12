import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {

    @Get('home')
    @Render('home')
    root() {
        return;
    }
}
