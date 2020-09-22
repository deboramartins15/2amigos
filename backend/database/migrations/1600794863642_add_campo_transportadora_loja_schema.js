'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddCampoTransportadoraLojaSchema extends Schema {
  up () {
    this.alter('lojas', (table) => {
      table.boolean('transportadora').notNullable().defaultTo(false)
    })
  }

  down () {
    this.alter('lojas', (table) => {
      table.dropColumn("transportadora");
    })
  }
}

module.exports = AddCampoTransportadoraLojaSchema
