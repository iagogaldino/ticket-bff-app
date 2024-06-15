import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { TicketService } from '../services/ticket.service';
import { fetchDataFromExternalEndpoint } from './Request';

@Controller()
export class TicketController {

    traceResults = [];

    constructor(
        private ticketService: TicketService
    ) { }



    async generateTicket(
        tipoIngressoValor: string,
        clientID: number,
        eventID: number,
        tipoIngressoId: number,
        // tipoIngressoLote: number,
    ) {
        this.traceResults = [];
        const pdv_id = 141;
        const login = 'admin';
        const venda_valor_total = parseFloat(tipoIngressoValor);//50;
        const ingresso_codigo = tipoIngressoId;

        const venda_status = 3; // PAGO
        const tipo_retirada_id = 9;
        const ingresso_forma_pagamento = 1;
        const venda_itens_vr_unitario = venda_valor_total;

        const venda_pagamento_status = 3


        // ID | taxa
        // 1; "Dinheiro" | 0.00
        // 4; "Credito Parcelado" | 10.00
        // 5; "Boleto" | 10.00
        // 6; "Boleto Parcelado" | 10.00
        // 7; "Debito em Conta TEF" | 10.00
        // 2; "Cartão de Debito" | 5.00
        // 3; "Crédito" | 10.00
        // 8; "Saldo PS" | 10.00
        // 9; "PIX" | 0.00 -> 80359786469
        const chave = "80359786469";
        const forma_pagamento_id = 9;
        const venda_pagamento_valor_taxa = '0'


        if (!clientID) { return { message: 'erro clientID', error: true } }
        if (!eventID) { return { message: 'erro eventID', error: true } }
        if (!tipoIngressoId) { return { message: 'erro eventID', error: true } }
        // if (!tipoIngressoLote) { return { message: 'erro eventID', error: true } }
        if (!tipoIngressoValor) { return { message: 'erro tipoIngressoValor', error: true } }

        const { vendaID } = await this.ticketService.generateSale(
            clientID,
            pdv_id,
            venda_status,
            login,
            tipo_retirada_id,
            venda_valor_total,
        )
        this.traceResults.push('generateSale = OK');

        const rbt = await this.ticketService.generateTicket(
            ingresso_codigo,
            tipoIngressoId,
            login,
            pdv_id,
            eventID,
            vendaID,
            venda_valor_total,
            ingresso_forma_pagamento
        );
        // console.log(rbt);
        this.traceResults.push('generateTicket = OK');


        await this.ticketService.generateSaleItem(
            tipoIngressoId,
            vendaID,
            venda_itens_vr_unitario
        );
        this.traceResults.push('generateSaleItem = OK');


        await this.ticketService.generateSalePayment(
            vendaID,
            venda_pagamento_status,
            venda_valor_total.toString(),
            forma_pagamento_id,
            venda_pagamento_valor_taxa,
            venda_valor_total,
            chave
        )
        this.traceResults.push('generateSalePayment = OK');

        await this.ticketService.updateTicketValue(venda_valor_total, vendaID);
        this.traceResults.push('updateTicketValue = OK');

        // // Result function ~~
        // // return this.traceResults;
        const { url } = await fetchDataFromExternalEndpoint(vendaID);

        return { trace: this.traceResults, vendaID, urlVoucher: url };
    }

    async getTypeTickets(eventID: number) {
        if (!eventID) {
            return { message: 'Erro event id', erro: true };
        }
        return this.ticketService.getTypeTickets(eventID);
    }

    async getTypeticketDesc(grupo_ingresso_id: number, tipo_ingresso_tipo: string) {
        if (!grupo_ingresso_id) {
            return { message: 'Erro grupo_ingresso_id', erro: true };
        }

        if (!tipo_ingresso_tipo) {
            return { message: 'Erro tipo_ingresso_tipo', erro: true };
        }
        return this.ticketService.getTypeticketDesc(grupo_ingresso_id, tipo_ingresso_tipo);
    }

    async ticketsUser(clientID: number) {
        if (!clientID) {
            return { message: 'Erro clientID', erro: true };
        }


        return this.ticketService.ticketsUser(clientID);
    }

    async removeSale(saleID: string) {
        if (!saleID) { return console.log('erro saleID'); }
        return this.ticketService.removeSale(saleID);
    }

    async removeAllSales(clientID: number) {
        if (!clientID) { return console.log('erro clientID'); }
        return await this.ticketService.removeAllSales(clientID);
    }

    async getUrlVoucher(saleID: number) {
        if (!saleID) { return console.log('erro saleID'); }
        const response = await fetchDataFromExternalEndpoint(saleID);
        return response;

    }

    async login(clientCpf: number) {
        if (!clientCpf) { return console.log('erro clientCpf'); }
        const clientData = await this.ticketService.searchClient(clientCpf) as any[];
        if (!clientData.length) {
            throw new BadRequestException('Customer not found');
        }
        return clientData[0];


    }
     


}


