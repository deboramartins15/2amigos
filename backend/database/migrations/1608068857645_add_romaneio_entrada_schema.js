"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class AddRomaneioEntradaSchema extends Schema {
  up() {
    this.alter("romaneios", table => {
      table.boolean("ROMANEIOENTRADA").defaultTo(false);
    });
  }

  down() {
    this.alter("romaneios", table => {
      table.dropColumn("ROMANEIOENTRADA");
    });
  }
}

module.exports = AddRomaneioEntradaSchema;
