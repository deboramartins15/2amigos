'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddRomaneioSchema extends Schema {
  up () {
    this.create('romaneios', (table) => {
      table.increments()
      table.string("PLACAVEICULO").notNullable()
      table.string("DOCMOTORISTA").notNullable()
      table.timestamp('DT_CONFERIDO')
      table.timestamp('DT_EMBARQUE')      
      table.string('USER_CRIACAO')
      table.string('USER_CONFERIDO')
      table.string('USER_EMBARQUE')      
      table.integer('STATUS_ID').unsigned()
      .references('id')
      .inTable('status')
      .onUpdate('CASCADE')
      .onDelete('CASCADE')
      table.timestamps()
    })
  }

  down () {
    this.drop('romaneios')
  }
}

module.exports = AddRomaneioSchema
