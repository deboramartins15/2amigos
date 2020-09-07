'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class LojaSchema extends Schema {
  up () {
    this.create('lojas', (table) => {
      table.increments()
      table.string('login', 80).notNullable().unique()
      table.string('senha', 60).notNullable()
      table.string('CNPJ', 14).notNullable().unique()
      table.boolean('matriz').notNullable().defaultTo(false)
      table.timestamps()
    })
  }

  down () {
    this.drop('lojas')
  }
}

module.exports = LojaSchema
