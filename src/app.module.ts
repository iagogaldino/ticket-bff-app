import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsService } from './app/services/events.service';
import { DBService } from './app/services/db.service';
import { TicketService } from './app/services/ticket.service';
import { TicketController } from './app/controllers/TicketController';

@Module({
  controllers: [AppController],
  providers: [
    AppService,
    EventsService,
    DBService,
    TicketService,
    TicketController
  ],
})
export class AppModule { }
