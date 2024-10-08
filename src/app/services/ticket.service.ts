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
        ingresso_valor_pago,
        ingresso_impressao_ok,
        equipamento_num_serie

        )values (
            nextval('gen_ingresso'),
            ${ingresso_codigo},
            '',
            ${tipoIngressoId},
            current_timestamp,
            (select to_char(current_timestamp, 'MSDUSDd')),
            '${login}',
            ${pdv},
            ${eventID},
            ${preco},
            ${vendaId},
            '${ingresso_forma_pagamento}',
            ${preco},
            1,
            '0'

        );
    `;
    const db = await this._db.queryDB(sql);
    console.log('generateTicket', db);
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
    venda_valor_total,
    venda_cadastro_cliente_aprovado,
    comissario_id      
    )
	values (
    ${vendaID},
    ${clientID},
		current_timestamp,
		${venda_status},
		${pdv_id},
		'${login}',
		${tipo_retirada_id},
		${venda_valor_total},
    false,
    159
    );
    `;
    const rDB = await this._db.queryDB(sql);
    return { vendaID };
  }

  async generateSaleItem(
    tipoIngressoId: number,
    vendaID: number,
    venda_itens_vr_unitario: number,
    qntTickets: number,
  ) {
    const sqlTicketValue = `SELECT * FROM tipo_ingresso WHERE tipo_ingresso_id = ${tipoIngressoId}`;
    const ticketValue = await this._db.queryDB(sqlTicketValue);
    console.log('generateSaleItem', 'generateSaleItem', ticketValue);
    const sqlItemsSale = `
   INSERT INTO venda_itens (
                venda_itens_id,
                tipo_ingresso_id,
                venda_id,
                venda_itens_vr_unitario,
                venda_itens_qtd,
                venda_itens_vr_total,
                venda_itens_status,
                venda_itens_vr_taxa
                )
       VALUES(
       nextval('gen_venda_itens'),
       ${ticketValue[0].tipo_ingresso_id},
       ${vendaID},
       ${venda_itens_vr_unitario},
       ${qntTickets},
       '${venda_itens_vr_unitario}',
        0,
        '0'
        )
  `;
    const rvendai = await this._db.queryDB(sqlItemsSale);
    console.log('generateSaleItem', rvendai);
    return true;
  }

  async generateSalePayment(
    venda_id: number,
    venda_pagamento_status: number, //7
    venda_pagamento_valor,
    forma_pagamento_id,
    venda_pagamento_valor_taxa,
    venda_pagamento_valor_pago,
    venda_pagamento_chave
  ) {
    // const sqlTicketValue = `SELECT * FROM tipo_ingresso WHERE tipo_ingresso_id = ${tipoIngressoId}`;
    // const ticketValue = await this._db.queryDB(sqlTicketValue);
    const venda_pagamento_data_vencimento = "2010-01-01T03:00:00.000Z";
    const venda_pagamento_data_pago = '2024-06-21T18:30:40.080Z';
    // const venda_pagamento_chave = '4B28642B-E3BF-4939-8138-ED9670B68795';
    const venda_pagamento_obs = 'obs';
    const venda_pagamento_paymentlink = '';
    const venda_pagamento_barcode = "";
    const venda_pagamento_status_detalhe = null;
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
        venda_pagamento_valor_taxa
                )
       VALUES(
       nextval('gen_venda_pagamento'),
        ${venda_id},
        ${venda_pagamento_status},
        '${venda_pagamento_data_vencimento}',
        '${venda_pagamento_data_pago}',
        '${venda_pagamento_chave}',
        NULL,
        '${venda_pagamento_obs}',
        ${forma_pagamento_id},
        '${venda_pagamento_paymentlink}',
        '${venda_pagamento_barcode}',
        NULL,
        ${venda_pagamento_valor_taxa}
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
    // const sql = `SELECT * FROM tipo_ingresso WHERE grupo_ingresso_id = ${grupo_ingresso_id} AND tipo_ingresso_tipo LIKE '${tipo_ingresso_tipo}'`;
    // const sql = `SELECT * FROM tipo_ingresso WHERE grupo_ingresso_id = ${grupo_ingresso_id} AND tipo_ingresso_tipo = '${tipo_ingresso_tipo}'`;
    const sql = `SELECT * FROM tipo_ingresso WHERE grupo_ingresso_id = ${grupo_ingresso_id}`;
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

  async updateTicketValue(venda_valor_total: number, vendaID: number) {
    return await this._db.queryDB(`UPDATE ingresso SET ingresso_valor_pago = ${venda_valor_total} WHERE venda_id = '${vendaID}'`);
  }

  async searchClient(clientCpf) {
    return await this._db.queryDB(`SELECT * from cliente WHERE  cliente_cpf_cnpj = '${clientCpf}'`);
  }

  async consultaIngressoCodBarra(codBarra) {
    return await this._db.queryDB(`SELECT * from ingresso WHERE  ingresso_cod_barra = '${codBarra}'`);
  }



  async updateVendaPagamentoChaveEQrcode(venda_id, venda_pagamento_status, venda_pagamento_status_detail, venda_pagamento_chave) {
    const sql = `
      UPDATE venda_pagamento
      SET 
        venda_pagamento_chave = '${venda_pagamento_chave}',
        venda_pagamento_status = CASE WHEN '${venda_pagamento_status}' = 0 THEN venda_pagamento_status ELSE '${venda_pagamento_status}' END,
        venda_pagamento_status_detalhe = CASE WHEN '${venda_pagamento_status_detail}' = '' THEN venda_pagamento_status_detalhe ELSE '${venda_pagamento_status_detail}' END
      WHERE venda_id = ${venda_id}
    `;

    return await this._db.queryDB(sql);
  }
}
