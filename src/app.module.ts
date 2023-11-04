import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsService } from './app/services/events.service';
import { DBService } from './app/services/db.service';

@Module({
  controllers: [AppController],
  providers: [AppService, EventsService, DBService],
})
export class AppModule {}
