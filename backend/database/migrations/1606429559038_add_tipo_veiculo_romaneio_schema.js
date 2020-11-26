'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddTipoVeiculoRomaneioSchema extends Schema {
  up () {
    this.alter('romaneios', (table) => {
      table.integer('VEICULO').unsigned()
      .references('id')
      .inTable('tipo_veiculos')
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
    })
  }

  down () {
    this.alter('romaneios', (table) => {
      table.dropColumn("VEICULO");
    })
  }
}

module.exports = AddTipoVeiculoRomaneioSchema
