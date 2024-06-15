import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { EventsService } from './app/services/events.service';
import { TicketController } from './app/controllers/TicketController';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private _eventServer: EventsService,
    private _ticketController: TicketController,
  ) { }

  @Get()
  getHello(@Query('name') name: string): string {
    return this.appService.getHello(name);
  }

  @Get('events')
  async getEvent(@Query('getEvent') a: string): Promise<Array<any>> {
    return await this._eventServer.getEvents();
  }

  @Get('remotedb')
  async remoteDb(@Query('sql') sql: string): Promise<Array<any>> {
    return await this._eventServer.remoteDB(sql);
  }

  @Post('generateSale')
  async generateTicket(
    @Body('tipoIngressoValor') tipoIngressoValor: string,
    @Body('clientID') clientID: number,
    @Body('eventID') eventID: number,
    @Body('tipoIngressoId') tipoIngressoId: number,
  ): Promise<any> {
    return await this._ticketController.generateTicket(
      tipoIngressoValor,
      clientID,
      eventID,
      tipoIngressoId,
    );
  }

  @Get('getTypeTickets/:eventID')
  async getTypeTickets(@Param('eventID') eventID: number): Promise<any> {
    return await this._ticketController.getTypeTickets(eventID);
  }

  @Post('getTypeticketDesc')
  async getTypeticketDesc(
    @Body('grupo_ingresso_id') grupo_ingresso_id: number,
    @Body('tipo_ingresso_tipo') tipo_ingresso_tipo: string,
  ): Promise<any> {
    return await this._ticketController.getTypeticketDesc(grupo_ingresso_id, tipo_ingresso_tipo);
  }
   

  @Get('ticketsUser')
  async ticketsUser(@Query('clientID') clientID: number): Promise<any> {
    return await this._ticketController.ticketsUser(clientID);
  }

  @Get('removeSale')
  async removeSale(@Query('saleID') saleID: string): Promise<any> {
    return await this._ticketController.removeSale(saleID);
  }

  @Get('removeAllSales/:clientID')
  async removeAllSales(@Param('clientID') clientID: number): Promise<any> {
    return await this._ticketController.removeAllSales(clientID);
  }

  @Get('getUrlVoucher/:saleID')
  async getUrlVoucher(@Param('saleID') saleID: number): Promise<any> {
    return await this._ticketController.getUrlVoucher(saleID);
  }

  @Get('login/:cpf')
  async login(@Param('cpf') cpf: number): Promise<any> {
    return await this._ticketController.login(cpf);
  }

  // @Get('testSqlIjection/:login/:cod_barra')
  // async testSqlIjection(
  //   @Param('login') login: string,
  //   @Param('cod_barra') cod_barra: string
  // ): Promise<any> {
  //   return await this._ticketController.testSqlIjection(login, cod_barra);
  // }

   

   
}


