'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateTipoVeiculoSchema extends Schema {
  up () {
    this.create('tipo_veiculos', (table) => {
      table.increments()
      table.timestamps()
      table.string("tipo").notNullable()
    })
  }

  down () {
    this.drop('tipo_veiculos')
  }
}

module.exports = CreateTipoVeiculoSchema
