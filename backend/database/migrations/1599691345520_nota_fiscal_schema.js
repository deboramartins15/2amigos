'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class NotaFiscalSchema extends Schema {
  up () {
    this.create('nota_fiscal', (table) => {
      table.increments()
      table.string("CNPJ_EMISSOR").notNullable()
      table.string("RAZAOSOCIAL_EMISSOR").notNullable()
      table.string("CNPJ_FAVORECIDO").notNullable()
      table.string("RAZAOSOCIAL_FAVORECIDO").notNullable()
      table.timestamp('DT_EMISSAO').notNullable()
      table.string("CHAVE_NF").notNullable()
      table.string("NUMERO_NF").notNullable()
      table.string("SERIE_NF").notNullable()
      table.decimal("TOTAL_NF").notNullable()
      table.decimal('TOTAL_PRODUTOS').notNullable()
      table.integer('VOLUME').notNullable()
      table.decimal('PESO_LIQ').notNullable()
      table.decimal('PESO_BRUTO').notNullable()
      table.timestamp('DT_INTEGRACAO')
      table.timestamp('DT_RECEBIDO')
      table.timestamp('DT_EXPEDICAO')
      table.timestamp('DT_ENTREGUE')
      table.string('USER_INTEGRACAO')
      table.string('USER_RECEBIDO')
      table.string('USER_EXPEDICAO')
      table.string('USER_ENTREGUE')
      table.integer('STATUS_ID').unsigned()
      .references('id')
      .inTable('status')
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
      table.timestamps()
    })
  }

  down () {
    this.drop('nota_fiscal')
  }
}

module.exports = NotaFiscalSchema
