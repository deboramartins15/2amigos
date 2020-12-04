'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CreateMotoristaSchema extends Schema {
  up () {
    this.create('motoristas', (table) => {
      table.increments()
      table.string("NOME").notNullable()
      table.string("DOCUMENTO").notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('motoristas')
  }
}

module.exports = CreateMotoristaSchema
