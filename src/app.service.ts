import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(name: string): string {
    return `<html> <body style="background-color:black"> =) </body> </html>`;
  }
}
