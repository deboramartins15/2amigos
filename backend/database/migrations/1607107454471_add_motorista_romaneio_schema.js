"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class AddMotoristaRomaneioSchema extends Schema {
  up() {
    this.alter("romaneios", table => {
      table
        .integer("MOTORISTA")
        .unsigned()
        .references("id")
        .inTable("motoristas")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");

      table.dropColumn("DOCMOTORISTA");
    });
  }

  down() {
    this.alter("romaneios", table => {
      table.dropColumn("MOTORISTA");
      table.string("DOCMOTORISTA").notNullable();
    });
  }
}

module.exports = AddMotoristaRomaneioSchema;
