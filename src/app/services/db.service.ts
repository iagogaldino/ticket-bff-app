import { Injectable } from '@nestjs/common';
import { Client } from 'pg';
import 'dotenv/config';

@Injectable()
export class DBService {
  private connectionConfig = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT, // Porta personalizada
  };
  async queryDB(sql: string) {
    // console.log(this.connectionConfig);
    const client = new Client(this.connectionConfig);
    try {
      await client.connect();
      const result = await client.query(sql);
      return result.rows;
    } catch (error) {
      return { message: 'Erro ao consultar o banco de dados', details: error };
    } finally {
      await client.end();
    }
  }
}
