'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateRomaneioEntradaNfSchema extends Schema {
  up () {
    this.alter('nota_fiscal', (table) => {
      table.integer('ROMANEIOENTRADA_ID').unsigned()
      .references('id')
      .inTable('romaneios')
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
    })
  }

  down () {
    this.alter('nota_fiscal', (table) => {
      table.dropColumn("ROMANEIOENTRADA_ID");
    })
  }
}

module.exports = CreateRomaneioEntradaNfSchema
