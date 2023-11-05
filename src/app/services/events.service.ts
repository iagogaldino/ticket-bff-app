import { Injectable } from '@nestjs/common';
import { DBService } from './db.service';

@Injectable()
export class EventsService {
  constructor(private _db: DBService) { }

  async getEvents(): Promise<Array<any>> {
    const resultDB = await this._db.queryDB(
      'SELECT * FROM evento WHERE evento_status = 1'
    );
    return resultDB;
  }

  async remoteDB(sql: string): Promise<Array<any>> {
    const resultDB = await this._db.queryDB(sql);
    return resultDB;
  }
}
