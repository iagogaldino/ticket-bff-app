import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { EventsService } from './app/services/events.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private _eventServer: EventsService,
  ) {}

  @Get()
  getHello(@Query('name') name: string): string {
    return this.appService.getHello(name);
  }

  @Get('get-events')
  async getEvent(@Query('getEvent') a: string): Promise<Array<any>> {
    return await this._eventServer.getEvents();
  }
}
