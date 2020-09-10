'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddUserDtProcessoSchema extends Schema {
  up () {
    this.alter('nota_fiscal', (table) => {
      table.timestamp('DT_PROCESSO')
      table.string('USER_PROCESSO')
    })
  }

  down () {
    this.alter('nota_fiscal', (table) => {
      table.dropColumn("DT_PROCESSO");
      table.dropColumn("USER_PROCESSO");
    })
  }
}

module.exports = AddUserDtProcessoSchema
