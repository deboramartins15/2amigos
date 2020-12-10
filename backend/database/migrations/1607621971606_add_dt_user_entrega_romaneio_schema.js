'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddDtUserEntregaRomaneioSchema extends Schema {
  up() {
    this.alter("romaneios", table => {
      table.timestamp('DT_ENTREGA')      
      table.string('USER_ENTREGA')
    });
  }

  down() {
    this.alter("romaneios", table => {
      table.dropColumn("DT_ENTREGA");
      table.dropColumn("USER_ENTREGA");
    });
  }
}

module.exports = AddDtUserEntregaRomaneioSchema
