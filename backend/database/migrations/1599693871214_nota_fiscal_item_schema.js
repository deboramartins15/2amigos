'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class NotaFiscalItemSchema extends Schema {
  up () {
    this.create('nota_fiscal_items', (table) => {
      table.increments()
      table.string("CODIGO").notNullable()      
      table.string("EAN").notNullable()      
      table.string("DESCRICAO").notNullable()      
      table.decimal("VALOR_UNIT").notNullable()      
      table.decimal("VALOR_TOTAL").notNullable()      
      table.integer("QUANTIDADE").notNullable()      
      table.integer('NF_ID').unsigned()
      .references('id')
      .inTable('nota_fiscal')
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
      table.timestamps()
    })
  }

  down () {
    this.drop('nota_fiscal_items')
  }
}

module.exports = NotaFiscalItemSchema
