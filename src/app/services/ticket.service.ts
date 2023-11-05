import { Injectable } from '@nestjs/common';
import { DBService } from './db.service';

@Injectable()
export class TicketService {
  constructor(private _db: DBService) { }
  // Para criar um ingresso tem que fazer os seguintes registros:
  // Adicionar registro na tabela venda [x]
  // Adicionar registro na tabela ingressos [x]
  // Adicionar registro na tabela venda_itens [x]
  // Adicionar registro na tabela venda_pagamento [x]
  async generateTicket(
    ingresso_codigo: number,
    tipoIngressoId: number,
    login: string,
    pdv: number,
    eventID: number,
    vendaId: number,
    preco: number,
    ingresso_forma_pagamento: number,
  ) {
    const sql = `
    insert into ingresso (
        ingresso_id,
        ingresso_codigo,
        venda_pagamento_obs,
        tipo_ingresso_id,
        ingresso_data_emissao,
        ingresso_cod_barra,
        login,
        pdv_id,
        evento_id,
        ingresso_valor,
        venda_id,
        ingresso_forma_pagamento,
        ingresso_valor_pago

        )values (
            nextval('gen_ingresso'),
            ${ingresso_codigo},
            'venda site',
            ${tipoIngressoId},
            current_timestamp,
            (select to_char(current_timestamp, 'MSDUSDd')),
            '${login}',
            ${pdv},
            ${eventID},
            ${preco},
            ${vendaId},
            '${ingresso_forma_pagamento}',
            ${preco}

        );
    `;
    const db = await this._db.queryDB(sql);
    return db;
  }

  async generateSale(
    clientID: number,
    pdv_id: number,
    venda_status: number,
    login: string,
    tipo_retirada_id: number,
    venda_valor_total: number,
  ) {
    const vendaIDGenVenda = await this._db.queryDB(
      `SELECT nextval('gen_venda');`,
    );
    const vendaID = vendaIDGenVenda[0]['nextval'];
    //TODO: Verifica os status das vendas de sucesso.
    const sql = `
	insert into venda (
    venda_id,
    cliente_id,
    venda_data_hora,
    venda_status,
    pdv_id,
    login,
    tipo_retirada_id,
    venda_valor_total
    )
	values (
    ${vendaID},
    ${clientID},
		current_timestamp,
		${venda_status},
		${pdv_id},
		'${login}',
		${tipo_retirada_id},
		${venda_valor_total}
    );
    `;
    const rDB = await this._db.queryDB(sql);
    return { vendaID };
  }

  async generateSaleItem(
    tipoIngressoId: number,
    vendaID: number,
    venda_itens_vr_unitario: number,
  ) {
    const sqlTicketValue = `SELECT * FROM tipo_ingresso WHERE tipo_ingresso_id = ${tipoIngressoId}`;
    const ticketValue = await this._db.queryDB(sqlTicketValue);
    // console.log('generateSaleItem', 'generateSaleItem', ticketValue);
    const sqlItemsSale = `
   INSERT INTO venda_itens (
                venda_itens_id,
                tipo_ingresso_id,
                venda_id,
                venda_itens_vr_unitario,
                venda_itens_qtd
                )
       VALUES(
       nextval('gen_venda_itens'),
       ${ticketValue[0].tipo_ingresso_id},
       ${vendaID},
        ${venda_itens_vr_unitario},
        1
        )
  `;
    const rvendai = await this._db.queryDB(sqlItemsSale);
    console.log('generateSaleItem', rvendai);
    return true;
  }

  async generateSalePayment(
    venda_id: number,
    venda_pagamento_status: number, //7
    venda_pagamento_valor = '861.00',
    forma_pagamento_id,
    venda_pagamento_valor_taxa = '27.47',
    venda_pagamento_valor_pago,
  ) {
    // const sqlTicketValue = `SELECT * FROM tipo_ingresso WHERE tipo_ingresso_id = ${tipoIngressoId}`;
    // const ticketValue = await this._db.queryDB(sqlTicketValue);
    const venda_pagamento_data_vencimento = '2010-01-01T03:00:00.000Z';
    const venda_pagamento_data_pago = '2020-09-20T23:24:45.875Z';
    const venda_pagamento_chave = '4B28642B-E3BF-4939-8138-ED9670B68795';
    const venda_pagamento_obs = 'obs';
    const venda_pagamento_paymentlink = '';
    const venda_pagamento_barcode = '';

    const sqlItemsSale = `

   INSERT INTO venda_pagamento (
        venda_pagamento_id,
        venda_id,
        venda_pagamento_status,
        venda_pagamento_data_vencimento,
        venda_pagamento_data_pago,
        venda_pagamento_chave,
        venda_pagamento_valor,
        venda_pagamento_obs,
        forma_pagamento_id,
        venda_pagamento_paymentlink,
        venda_pagamento_barcode,
        venda_pagamento_valor_pago,
        venda_pagamento_valor_taxa,
        venda_pagamento_status_detalhe
                )
       VALUES(
       nextval('gen_venda_pagamento'),
        ${venda_id},
        ${venda_pagamento_status},
        '${venda_pagamento_data_vencimento}',
        '${venda_pagamento_data_pago}',
        '${venda_pagamento_chave}',
        ${venda_pagamento_valor},
        '${venda_pagamento_obs}',
        ${forma_pagamento_id},
        '${venda_pagamento_paymentlink}',
        '${venda_pagamento_barcode}',
        ${venda_pagamento_valor_pago},
        ${venda_pagamento_valor_taxa},
        'accredited'
        )
  `;
    const a = await this._db.queryDB(sqlItemsSale);
    console.log('venda_pagamento', a);
    return true;
  }

  async getTypeTickets(eventID: number) {
    const sql = `SELECT * FROM grupo_ingresso WHERE evento_id = ${eventID}`;
    const resultDB = await this._db.queryDB(sql);
    return resultDB;
  }

  async getTypeticketDesc(grupo_ingresso_id: number, tipo_ingresso_tipo: string) {
    const sql = `SELECT * FROM tipo_ingresso WHERE grupo_ingresso_id = ${grupo_ingresso_id} AND tipo_ingresso_tipo LIKE '%${tipo_ingresso_tipo}%'`;
    const resultDB = await this._db.queryDB(sql);
    return resultDB;
  }

  async ticketsUser(clientID: number) {
    const sql = `SELECT * FROM venda WHERE cliente_id = ${clientID}`;
    const resultDB = await this._db.queryDB(sql);
    return resultDB;
  }

  async removeSale(saleID) {
    await this._db.queryDB(`DELETE FROM venda_itens WHERE venda_id = ${saleID}`);
    await this._db.queryDB(`DELETE FROM venda_pagamento WHERE venda_id = ${saleID}`);
    await this._db.queryDB(`DELETE FROM ingresso WHERE venda_id = ${saleID}`);
    await this._db.queryDB(`DELETE FROM venda WHERE venda_id = ${saleID}`);
  }

  async removeAllSales(clientID: number) {
    const clientSales = await this._db.queryDB(`SELECT * FROM venda WHERE cliente_id = ${clientID}`);
    await clientSales.forEach(async sale => {
       await this.removeSale(sale.venda_id);
    });

  }


}
