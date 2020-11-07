'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddRomaneioNfSchema extends Schema {
  up () {
    this.alter('nota_fiscal', (table) => {
      table.integer('ROMANEIO_ID').unsigned()
      .references('id')
      .inTable('romaneios')
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
    })
  }

  down () {
    this.alter('nota_fiscal', (table) => {
      table.dropColumn("ROMANEIO_ID");
    })
  }
}

module.exports = AddRomaneioNfSchema
