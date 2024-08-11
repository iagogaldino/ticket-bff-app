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
        qntTickets: number = 1,
    ) {
        this.traceResults = [];
        const pdv_id = 141;
        // const pdv_id = 150;
        const login = 'admin';
        // const venda_valor_total = parseFloat(tipoIngressoValor);//50;
        const venda_valor_total = 0;//50;
        const ingresso_codigo = tipoIngressoId;

        const venda_status = 3; // PAGO
        const tipo_retirada_id = 10;
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
        // const chave = "80359786469";
        const chave = "";
        const forma_pagamento_id = 1;
        const venda_pagamento_valor_taxa = null;


        if (!clientID) { return { message: 'erro clientID', error: true } }
        if (!eventID) { return { message: 'erro eventID', error: true } }
        if (!tipoIngressoId) { return { message: 'erro eventID', error: true } }
        if (!tipoIngressoValor) { return { message: 'erro tipoIngressoValor', error: true } }

        const { vendaID } = await this.ticketService.generateSale(
            clientID,
            pdv_id,
            venda_status,
            login,
            tipo_retirada_id,
            0// venda_valor_total,
        )
        this.traceResults.push('generateSale = OK');

        for (let i = 0; i < qntTickets; i++) {
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
        }
        this.traceResults.push('generateTicket = OK');


        await this.ticketService.generateSaleItem(
            tipoIngressoId,
            vendaID,
            venda_itens_vr_unitario,
            qntTickets
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
    
    async consultaIngressoCodBarra(codBarra: number) {
        if (!codBarra) { return console.log('erro codBarra'); }
        const clientData = await this.ticketService.consultaIngressoCodBarra(codBarra) as any[];
        if (!clientData.length) {
            throw new BadRequestException('Customer not found');
        }
        return clientData[0];


    }

    async update_venda_pagamento_chave_e_qrcode(saleId: string, status: string) {
        if (!saleId) { throw new BadRequestException('Customer saleId found'); }
        if (!status) { throw new BadRequestException('Customer status found'); }
      
        let venda_pagamento_chave = 83486202047;
        let venda_pagamento_status_detail = '3';

        switch (status) {
            case '1':
                venda_pagamento_status_detail = 'pending';
                break;
            case '3':
                venda_pagamento_status_detail = "approved";
                break;
            case '1':
                venda_pagamento_status_detail = 'authorized';
                break;
            case '2':
                venda_pagamento_status_detail = 'in_process';
                break;
            case '5':
                venda_pagamento_status_detail = 'in_mediation';
                break;
            case '7':
                venda_pagamento_status_detail = 'rejected';
                break;
            case '7': // Note que 'rejected' e 'cancelled' têm o mesmo valor
                venda_pagamento_status_detail = 'cancelled';
                break;
            case '6':
                venda_pagamento_status_detail = 'refunded';
                break;
            case '8':
                venda_pagamento_status_detail = 'charged_back';
                break;
            default: throw new BadRequestException('Erro status not found');
        }

        const resup: any[] = this.ticketService.updateVendaPagamentoChaveEQrcode(
            saleId,
            status,
            venda_pagamento_status_detail,
            venda_pagamento_chave
        ) as any;

        if (resup.length) {
            throw new BadRequestException(resup); 
        }

        const urlticket = await fetchDataFromExternalEndpoint(saleId);
        return urlticket;
    }



}


interface json {
    "venda_id": "1210247",
    "forma_pagto": "pix",
    "dados_pagamento": {
        "accounts_info": null,
        "acquirer_reconciliation": [],
        "additional_info": {
            "authentication_code": null,
            "available_balance": null,
            "items": [
                {
                    "category_id": "tickets",
                    "description": "Data: 15/06/2024 - PNZ LOUNGE 2024",
                    "id": "30288",
                    "picture_url": null,
                    "quantity": "1",
                    "title": "SÁBADO-15/JUN | INTEIRA",
                    "unit_price": "170"
                }
            ],
            "nsu_processadora": null,
            "payer": {
                "address": {
                    "street_name": "Rua Marques do Parana",
                    "street_number": "141",
                    "zip_code": "52021050"
                },
                "first_name": "Diana",
                "last_name": "de Moraes Rego",
                "phone": {
                    "area_code": "11",
                    "number": "994265426"
                },
                "registration_date": "2022-07-13T15:07:30.457-03:00"
            }
        },
        "authorization_code": null,
        "binary_mode": false,
        "brand_id": null,
        "build_version": "3.56.0",
        "call_for_authorize_id": null,
        "callback_url": null,
        "captured": true,
        "card": [],
        "charges_details": [
            {
                "accounts": {
                    "from": "collector",
                    "to": "mp"
                },
                "amounts": {
                    "original": 0.95,
                    "refunded": 0
                },
                "client_id": 0,
                "date_created": "2024-06-15T13:39:02.976-04:00",
                "id": "80393616205-001",
                "last_updated": "2024-06-15T13:39:02.976-04:00",
                "metadata": [],
                "name": "mercadopago_fee",
                "refund_charges": [],
                "reserve_id": null,
                "type": "fee"
            }
        ],
        "collector_id": 1121279843,
        "corporation_id": null,
        "counter_currency": null,
        "coupon_amount": 0,
        "currency_id": "BRL",
        "date_approved": null,
        "date_created": "2024-06-15T13:39:02.973-04:00",
        "date_last_updated": "2024-06-15T13:39:02.973-04:00",
        "date_of_expiration": "2024-06-15T14:38:15.042-04:00",
        "deduction_schema": null,
        "description": "#1210247 - PNZ LOUNGE 2024",
        "differential_pricing_id": null,
        "external_reference": "Venda 1210247 (VP652100)",
        "fee_details": [],
        "financing_group": null,
        "id": 80393616205,
        "installments": 1,
        "integrator_id": null,
        "issuer_id": "12501",
        "live_mode": true,
        "marketplace_owner": null,
        "merchant_account_id": null,
        "merchant_number": null,
        "metadata": {
            "venda_id": "1210247",
            "venda_pagamento_id": "652100"
        },
        "money_release_date": null,
        "money_release_schema": null,
        "money_release_status": "released",
        "notification_url": "https://api.ticketsimples.com/ticketsimples/ws_ts_teste/webservice/endpoint.php/notificacao_mp/652100",
        "operation_type": "regular_payment",
        "order": [],
        "payer": {
            "email": null,
            "entity_type": null,
            "first_name": null,
            "id": "1605139068",
            "identification": {
                "number": null,
                "type": null
            },
            "last_name": null,
            "operator_id": null,
            "phone": {
                "area_code": null,
                "extension": null,
                "number": null
            },
            "type": null
        },
        "payment_method": {
            "id": "pix",
            "issuer_id": "12501",
            "type": "bank_transfer"
        },
        "payment_method_id": "pix",
        "payment_type_id": "bank_transfer",
        "platform_id": null,
        "point_of_interaction": {
            "application_data": {
                "name": null,
                "version": null
            },
            "business_info": {
                "branch": "Merchant Services",
                "sub_unit": "default",
                "unit": "online_payments"
            },
            "location": {
                "source": null,
                "state_id": null
            },
            "transaction_data": {
                "bank_info": {
                    "collector": {
                        "account_holder_name": "TICKET SIMPLES PROMOCAO DE EVENTOS MUSICAIS EIRELI",
                        "account_id": null,
                        "long_name": null,
                        "transfer_account_id": null
                    },
                    "is_same_bank_account_owner": null,
                    "origin_bank_id": null,
                    "origin_wallet_id": null,
                    "payer": {
                        "account_id": null,
                        "external_account_id": null,
                        "id": null,
                        "identification": [],
                        "long_name": null
                    }
                },
                "bank_transfer_id": null,
                "e2e_id": null,
                "financial_institution": null,
                "qr_code": "00020126480014br.gov.bcb.pix0126ticketsimples.mp@gmail.com5204000053039865406190.405802BR5925TICKETTICKET20220511101646009Sao Paulo62240520mpqrinter803936162056304F3BD",
                "qr_code_base64": "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",
                "ticket_url": "https://www.mercadopago.com.br/payments/80393616205/ticket?caller_id=1605139068&hash=938b4263-5bde-46cd-8556-1529d4326978",
                "transaction_id": null
            },
            "type": "OPENPLATFORM"
        },
        "pos_id": null,
        "processing_mode": "aggregator",
        "refunds": [],
        "release_info": null,
        "shipping_amount": 0,
        "sponsor_id": null,
        "statement_descriptor": null,
        "status": string,
        "status_detail": "pending_waiting_transfer",
        "store_id": null,
        "tags": null,
        "taxes_amount": 0,
        "transaction_amount": 190.4,
        "transaction_amount_refunded": 0,
        "transaction_details": {
            "acquirer_reference": null,
            "bank_transfer_id": null,
            "external_resource_url": null,
            "financial_institution": null,
            "installment_amount": 0,
            "net_received_amount": 0,
            "overpaid_amount": 0,
            "payable_deferral_period": null,
            "payment_method_reference_id": null,
            "total_paid_amount": 190.4,
            "transaction_id": null
        }
    },
    "obs_pagamento": ""
}


